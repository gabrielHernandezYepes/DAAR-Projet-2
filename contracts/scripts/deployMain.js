async function main() {
  const [deployer] = await ethers.getSigners(); // Récupère l'adresse de déploiement

  // Déploiement du contrat Main
  const Main = await ethers.getContractFactory("Main");
  const mainContract = await Main.deploy(deployer.address); // Fournit l'adresse du déployeur en tant que propriétaire
  await mainContract.deployed();
  console.log("Main Contract déployé à :", mainContract.address);

  // Déploiement du contrat Booster
  const Booster = await ethers.getContractFactory("Booster");
  const boosterContract = await Booster.deploy();
  await boosterContract.deployed();
  console.log("Booster Contract déployé à :", boosterContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
