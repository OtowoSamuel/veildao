import { expect } from "chai";
import hre from "hardhat";

describe("VeilDAO", function () {
    let veildao: any;
    let owner: any;
    let governor1: any;
    let governor2: any;
    let governor3: any;
    let nonGovernor: any;
    let recipient: any;

    beforeEach(async function () {
        [owner, governor1, governor2, governor3, nonGovernor, recipient] = await hre.ethers.getSigners();

        const VeilDAO = await hre.ethers.getContractFactory("VeilDAO");
        veildao = await VeilDAO.deploy(
            [governor1.address, governor2.address, governor3.address],
            2 // voting threshold = 2 of 3
        );
        await veildao.waitForDeployment();
    });

    describe("Deployment", function () {
        it("should set the correct owner", async function () {
            expect(await veildao.owner()).to.equal(owner.address);
        });

        it("should initialize governors correctly", async function () {
            expect(await veildao.isGovernor(governor1.address)).to.be.true;
            expect(await veildao.isGovernor(governor2.address)).to.be.true;
            expect(await veildao.isGovernor(governor3.address)).to.be.true;
            expect(await veildao.governorCount()).to.equal(3);
        });

        it("should set the correct voting threshold", async function () {
            expect(await veildao.votingThreshold()).to.equal(2);
        });

        it("should initialize category names", async function () {
            expect(await veildao.getCategoryName(0)).to.equal("Development");
            expect(await veildao.getCategoryName(1)).to.equal("Marketing");
            expect(await veildao.getCategoryName(2)).to.equal("Operations");
            expect(await veildao.getCategoryName(3)).to.equal("Research");
            expect(await veildao.getCategoryName(4)).to.equal("Community");
        });

        it("should reject deployment with no governors", async function () {
            const VeilDAO = await hre.ethers.getContractFactory("VeilDAO");
            await expect(VeilDAO.deploy([], 1)).to.be.revertedWith("VeilDAO: need at least one governor");
        });

        it("should reject deployment with invalid threshold", async function () {
            const VeilDAO = await hre.ethers.getContractFactory("VeilDAO");
            await expect(VeilDAO.deploy([governor1.address], 0)).to.be.revertedWith("VeilDAO: invalid threshold");
            await expect(VeilDAO.deploy([governor1.address], 2)).to.be.revertedWith("VeilDAO: invalid threshold");
        });
    });

    describe("Governor Management", function () {
        it("should allow owner to add a governor", async function () {
            await veildao.addGovernor(nonGovernor.address);
            expect(await veildao.isGovernor(nonGovernor.address)).to.be.true;
            expect(await veildao.governorCount()).to.equal(4);
        });

        it("should reject adding duplicate governor", async function () {
            await expect(veildao.addGovernor(governor1.address)).to.be.revertedWith("VeilDAO: already a governor");
        });

        it("should allow owner to remove a governor", async function () {
            await veildao.removeGovernor(governor3.address);
            expect(await veildao.isGovernor(governor3.address)).to.be.false;
            expect(await veildao.governorCount()).to.equal(2);
        });

        it("should reject non-owner adding governor", async function () {
            await expect(
                veildao.connect(governor1).addGovernor(nonGovernor.address)
            ).to.be.revertedWith("VeilDAO: caller is not the owner");
        });

        it("should reject removing governor below threshold", async function () {
            // Remove to get to threshold count (3 governors, threshold 2)
            await veildao.removeGovernor(governor3.address); // Now 2 governors, threshold 2
            await expect(
                veildao.removeGovernor(governor2.address)
            ).to.be.revertedWith("VeilDAO: cannot go below threshold");
        });
    });

    describe("Budget Allocation", function () {
        it("should allow governor to allocate budget to a category", async function () {
            // Create an encrypted amount using the mock system
            const client = await hre.cofhe.createClientWithBatteries(governor1);
            const encrypted = await client.encryptInputs([{ type: "uint32", value: 10000n }]).execute();

            await veildao.connect(governor1).allocateBudget(0, encrypted[0]);
            expect(await veildao.categoryExists(0)).to.be.true;
        });

        it("should reject non-governor budget allocation", async function () {
            const client = await hre.cofhe.createClientWithBatteries(nonGovernor);
            const encrypted = await client.encryptInputs([{ type: "uint32", value: 5000n }]).execute();

            await expect(
                veildao.connect(nonGovernor).allocateBudget(0, encrypted[0])
            ).to.be.revertedWith("VeilDAO: caller is not a governor");
        });

        it("should reject invalid category", async function () {
            const client = await hre.cofhe.createClientWithBatteries(governor1);
            const encrypted = await client.encryptInputs([{ type: "uint32", value: 5000n }]).execute();

            await expect(
                veildao.connect(governor1).allocateBudget(5, encrypted[0])
            ).to.be.revertedWith("VeilDAO: invalid category");
        });
    });

    describe("Proposal Flow", function () {
        beforeEach(async function () {
            // Allocate budget to Development category
            const client = await hre.cofhe.createClientWithBatteries(governor1);
            const budgetEncrypted = await client.encryptInputs([{ type: "uint32", value: 50000n }]).execute();
            await veildao.connect(governor1).allocateBudget(0, budgetEncrypted[0]);
        });

        it("should allow anyone to create a spend proposal", async function () {
            const client = await hre.cofhe.createClientWithBatteries(nonGovernor);
            const spendEncrypted = await client.encryptInputs([{ type: "uint32", value: 5000n }]).execute();

            await veildao.connect(nonGovernor).proposeSpend(
                0,
                recipient.address,
                spendEncrypted[0],
                "Fund developer bounties"
            );

            const proposal = await veildao.getProposal(0);
            expect(proposal.category).to.equal(0);
            expect(proposal.proposer).to.equal(nonGovernor.address);
            expect(proposal.recipient).to.equal(recipient.address);
            expect(proposal.description).to.equal("Fund developer bounties");
            expect(proposal.status).to.equal(0); // Pending
        });

        it("should allow governors to vote on proposals", async function () {
            const client = await hre.cofhe.createClientWithBatteries(nonGovernor);
            const spendEncrypted = await client.encryptInputs([{ type: "uint32", value: 5000n }]).execute();
            await veildao.connect(nonGovernor).proposeSpend(0, recipient.address, spendEncrypted[0], "Test proposal");

            // Governor 1 votes yes
            await veildao.connect(governor1).voteOnProposal(0, true);
            let proposal = await veildao.getProposal(0);
            expect(proposal.votesFor).to.equal(1);
            expect(proposal.status).to.equal(0); // Still pending (need 2)

            // Governor 2 votes yes — reaches threshold
            await veildao.connect(governor2).voteOnProposal(0, true);
            proposal = await veildao.getProposal(0);
            expect(proposal.votesFor).to.equal(2);
            expect(proposal.status).to.equal(1); // Approved
        });

        it("should reject double voting", async function () {
            const client = await hre.cofhe.createClientWithBatteries(nonGovernor);
            const spendEncrypted = await client.encryptInputs([{ type: "uint32", value: 5000n }]).execute();
            await veildao.connect(nonGovernor).proposeSpend(0, recipient.address, spendEncrypted[0], "Test proposal");

            await veildao.connect(governor1).voteOnProposal(0, true);
            await expect(
                veildao.connect(governor1).voteOnProposal(0, true)
            ).to.be.revertedWith("VeilDAO: already voted");
        });

        it("should reject non-governor voting", async function () {
            const client = await hre.cofhe.createClientWithBatteries(nonGovernor);
            const spendEncrypted = await client.encryptInputs([{ type: "uint32", value: 5000n }]).execute();
            await veildao.connect(nonGovernor).proposeSpend(0, recipient.address, spendEncrypted[0], "Test proposal");

            await expect(
                veildao.connect(nonGovernor).voteOnProposal(0, true)
            ).to.be.revertedWith("VeilDAO: caller is not a governor");
        });

        it("should allow execution of approved proposals", async function () {
            const client = await hre.cofhe.createClientWithBatteries(nonGovernor);
            const spendEncrypted = await client.encryptInputs([{ type: "uint32", value: 5000n }]).execute();
            await veildao.connect(nonGovernor).proposeSpend(0, recipient.address, spendEncrypted[0], "Test proposal");

            // Approve with threshold votes
            await veildao.connect(governor1).voteOnProposal(0, true);
            await veildao.connect(governor2).voteOnProposal(0, true);

            // Execute
            await veildao.connect(governor1).executeSpend(0);

            const proposal = await veildao.getProposal(0);
            expect(proposal.status).to.equal(3); // Executed
        });

        it("should reject execution of non-approved proposals", async function () {
            const client = await hre.cofhe.createClientWithBatteries(nonGovernor);
            const spendEncrypted = await client.encryptInputs([{ type: "uint32", value: 5000n }]).execute();
            await veildao.connect(nonGovernor).proposeSpend(0, recipient.address, spendEncrypted[0], "Test proposal");

            await expect(
                veildao.connect(governor1).executeSpend(0)
            ).to.be.revertedWith("VeilDAO: not approved");
        });
    });

    describe("Treasury", function () {
        it("should accept ETH deposits", async function () {
            await veildao.deposit({ value: hre.ethers.parseEther("1.0") });
            const balance = await hre.ethers.provider.getBalance(await veildao.getAddress());
            expect(balance).to.equal(hre.ethers.parseEther("1.0"));
        });

        it("should reject zero deposits", async function () {
            await expect(veildao.deposit({ value: 0 })).to.be.revertedWith("VeilDAO: zero deposit");
        });
    });

    describe("Access Control", function () {
        it("should only allow governors to view budgets", async function () {
            const client = await hre.cofhe.createClientWithBatteries(governor1);
            const encrypted = await client.encryptInputs([{ type: "uint32", value: 10000n }]).execute();
            await veildao.connect(governor1).allocateBudget(0, encrypted[0]);

            // Governor can view
            await expect(veildao.connect(governor1).viewBudget(0)).to.not.be.reverted;

            // Non-governor cannot view
            await expect(
                veildao.connect(nonGovernor).viewBudget(0)
            ).to.be.revertedWith("VeilDAO: caller is not a governor");
        });
    });
});
