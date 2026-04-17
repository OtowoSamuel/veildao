import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("╔═══════════════════════════════════════════════╗");
    console.log("║           VeilDAO Deployment                  ║");
    console.log("╚═══════════════════════════════════════════════╝");
    console.log("");
    console.log(`  Deployer: ${deployer.address}`);
    console.log(`  Network:  ${(await ethers.provider.getNetwork()).name}`);
    console.log(`  Chain ID: ${(await ethers.provider.getNetwork()).chainId}`);
    console.log("");

    // Deploy with deployer as initial governor and threshold of 1
    const VeilDAO = await ethers.getContractFactory("VeilDAO");
    const veildao = await VeilDAO.deploy(
        [deployer.address], // initial governors
        1                    // voting threshold
    );

    await veildao.waitForDeployment();
    const address = await veildao.getAddress();

    console.log("  ✅ VeilDAO deployed to:", address);
    console.log("");
    console.log("  Save this address in your .env file:");
    console.log(`  VEILDAO_CONTRACT_ADDRESS=${address}`);
    console.log("");
    console.log("═══════════════════════════════════════════════════");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });
    