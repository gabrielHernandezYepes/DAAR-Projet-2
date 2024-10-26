// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  // Remplace "Booster" par le nom de ton contrat
  const Booster = await ethers.getContractFactory("Booster");
  const booster = await Booster.deploy();  // Déploie le contrat

  await booster.deployed();  // Assure-toi que le contrat est déployé avant de continuer

  console.log("Booster contract deployed to:", booster.address);  // Affiche l'adresse du contrat déployé
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
