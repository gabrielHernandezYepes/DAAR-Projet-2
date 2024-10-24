import 'dotenv/config';
import { DeployFunction } from 'hardhat-deploy/types';

const deployer: DeployFunction = async (hre) => {
  if (hre.network.config.chainId !== 31337) return;

  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Déployez d'abord le contrat NFTCollection
  const nftCollectionDeployment = await deploy('NFTCollection', {
    from: deployer,
    args: [deployer], // Passer l'adresse du propriétaire ici
    log: true,
  });

  // Puis déployez le contrat Main en lui passant l'adresse du propriétaire et celle du contrat NFTCollection
  await deploy('Main', {
    from: deployer,
    args: [deployer, nftCollectionDeployment.address], // Passer les deux arguments ici
    log: true,
  });
};

export default deployer;
deployer.tags = ['Main'];
