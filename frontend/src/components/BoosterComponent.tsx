import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { useWallet } from '../hooks/useWallet';
import styles from '../styles.module.css';

const BoosterComponent = () => {
  const wallet = useWallet();
  const { account } = wallet || {};

  const [collectionName, setCollectionName] = useState(''); 
  const [boosterId, setBoosterId] = useState('');           
  const [toAddress, setToAddress] = useState(account);     
  const [boosterIds, setBoosterIds] = useState([]);
  

  // Fonction pour ouvrir un booster
  const handleOpenBooster = async () => {
    try {
      const response = await axios.post('http://localhost:5000/pokemon/create-booster', {
        collectionName,  
        to: account      
      });
      alert('Booster créé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la création du booster:', error);
      alert('Erreur lors de la création du booster.');
    }
  };

  return (
    <div className={styles.boosterContainer}>
     

      <h2>Ouvrir un Booster</h2>
      <input
        type="text"
        placeholder="Nom de la Collection (ex: Jungle)"
        value={collectionName}
        onChange={(e) => setCollectionName(e.target.value)}
        className={styles.inputField}
      />
      <input
        type="text"
        placeholder="Adresse du destinataire"
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
        className={styles.inputField}
      />
      <button onClick={handleOpenBooster} className={styles.openBoosterButton}>
        Ouvrir Booster
      </button>
    </div>
  );
};

export default BoosterComponent;