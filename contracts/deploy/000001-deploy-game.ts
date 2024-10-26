import 'dotenv/config';
import { DeployFunction } from 'hardhat-deploy/types';

const deployer: DeployFunction = async (hre) => {
  if (hre.network.config.chainId !== 31337) return;

  const { deployer: deployerAddress } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Déployez d'abord le contrat NFTCollection sans arguments
 

  // Puis déployez le contrat Main en lui passant l'adresse du propriétaire et celle du contrat NFTCollection
  const mainDeployment = await deploy('Main', {
    from: deployerAddress,
    args: [deployerAddress], // Passer les deux arguments ici
    log: true,
  });
};

export default deployer;
deployer.tags = ['Main'];
