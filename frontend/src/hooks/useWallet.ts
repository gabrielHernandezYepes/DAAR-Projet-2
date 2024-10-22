import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import MainABI from '../abis/Main.json';
import NFTCollectionABI from '../abis/NFTCollection.json';

const MAIN_CONTRACT_ADDRESS = 'ADRESSE_DU_CONTRAT_MAIN'; // Remplacez par l'adresse déployée
const NFT_COLLECTION_ADDRESS = 'ADRESSE_DU_CONTRAT_NFTCOLLECTION'; // Remplacez par l'adresse déployée

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [account, setAccount] = useState<string>('');
  const [mainContract, setMainContract] = useState<ethers.Contract>();
  const [nftContract, setNFTContract] = useState<ethers.Contract>();

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const _provider = new ethers.providers.Web3Provider(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const signer = _provider.getSigner();
          const _account = await signer.getAddress();

          // Vérifiez si MainABI est un objet contenant la propriété 'abi' ou directement le tableau ABI
          const abiMain = MainABI.abi ? MainABI.abi : MainABI;
          const abiNFT = NFTCollectionABI.abi ? NFTCollectionABI.abi : NFTCollectionABI;

          const _mainContract = new ethers.Contract(
            MAIN_CONTRACT_ADDRESS,
            abiMain,
            signer
          );

          const _nftContract = new ethers.Contract(
            NFT_COLLECTION_ADDRESS,
            abiNFT,
            signer
          );

          setProvider(_provider);
          setAccount(_account);
          setMainContract(_mainContract);
          setNFTContract(_nftContract);

          // Écouter les changements de compte
          window.ethereum.on('accountsChanged', (accounts: string[]) => {
            setAccount(accounts[0] || '');
          });
        } catch (error) {
          console.error('Erreur lors de la connexion au portefeuille :', error);
        }
      } else {
        console.error('MetaMask non détecté');
      }
    };

    init();
  }, []);

  return {
    provider,
    account,
    mainContract,
    nftContract,
  };
};
