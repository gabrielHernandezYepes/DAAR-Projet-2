import React, { useEffect, useState } from 'react';
import { useWallet } from './hooks/useWallet';
import styles from './styles.module.css';
import { ethers } from 'ethers';
import MainABI from './abis/Main.json'; // Assurez-vous que le chemin est correct
import { CreateCollectForm } from './components/CreateCollectForm';
import { MintCardsForm } from './components/MintCardsForm';
import { TransferOwnershipForm } from './components/TransferOwnershipForm';
import SetsComponent from './components/SetsComponent'; // Importer le composant SetsComponent

// Importer l'image du logo
import logo from './assets/images/logo.png'; // Vérifiez le chemin

// Importer l'image d'arrière-plan
import backgroundImage from './assets/images/charizard.jpg'; // Vérifiez le chemin si vous utilisez des styles en ligne

const contractAddress = "0x7751483EAe19d423C390632Dc2e0cABcd2d42054"; // Mettez à jour si nécessaire

export const App = () => {
  const wallet = useWallet();
  const { account, balance, contract } = wallet || {};
  const [currentOwner, setCurrentOwner] = useState<string>('');
  const { ethereum } = window;
  
  const [showSets, setShowSets] = useState(false); // État pour afficher ou non les sets

  // Initialiser le contrat et récupérer le propriétaire
  useEffect(() => {
    const initialize = async () => {
      if (contract) {
        try {
          const owner = await contract.owner();
          setCurrentOwner(owner);
        } catch (error) {
          console.error('Erreur lors de la récupération du propriétaire:', error);
        }
      }
    };
    initialize();
  }, [contract]);

  // Fonction de transfert de propriété
  const transferOwnership = async (newOwnerAddress: string) => {
    if (!contract) return;
    try {
      const normalizedAddress = ethers.utils.getAddress(newOwnerAddress);
      const tx = await contract.transferOwnership(normalizedAddress);
      console.log(`Transfert de propriété en cours: ${tx.hash}`);
      await tx.wait();
      console.log(`Propriété transférée avec succès à ${normalizedAddress}`);
      setCurrentOwner(normalizedAddress);
    } catch (error: any) {
      console.error('Erreur lors du transfert de propriété:', error);
      throw error; // Relancer l'erreur pour la gestion dans le formulaire
    }
  };

  // Gestion des changements de comptes MetaMask
  useEffect(() => {
    if (ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          console.log('Compte changé:', accounts[0]);
          // Mettre à jour l'état ou rafraîchir les détails du contrat si nécessaire
        } else {
          console.log('Veuillez connecter un compte.');
        }
      };

      ethereum.on('accountsChanged', handleAccountsChanged);

      // Nettoyage lors du démontage du composant
      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [ethereum]);

  if (!ethereum) {
    return (
      <div className={styles.body}>
        <h1>Bienvenue dans Pokémon TCG</h1>
        <p>Veuillez installer MetaMask.</p>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className={styles.body}>
        <h1>Bienvenue dans Pokémon TCG</h1>
        <p>Veuillez connecter votre portefeuille.</p>
      </div>
    );
  }

  return (
    <div 
      className={`${styles.body} ${styles.background}`} 
      style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className={styles.buttons}>
         <img src={logo} alt="Logo Pokémon TCG" className={styles.logo} />
        <button>Home</button>
        <button onClick={() => setShowSets(!showSets)}>Sets</button> {/* Ajouter un bouton pour afficher/cacher les sets */}
        <button>Users</button>
        <button>Boosters</button>
      </div>
      <h1>Bienvenue dans Pokémon TCG</h1>

      {/* Afficher les sets si showSets est vrai */}
      {showSets && <SetsComponent />}
    </div>
  );
}

export default App;
