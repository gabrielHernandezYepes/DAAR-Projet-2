import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { useWallet } from '../hooks/useWallet';
import styles from '../styles.module.css';

const BoosterComponent = () => {
  const wallet = useWallet();
  const { account } = wallet || {};

  const [collectionName, setCollectionName] = useState(''); // Pour spécifier le nom du set lors de la création du booster
  const [boosterId, setBoosterId] = useState('');           // Pour spécifier l'ID du booster à ouvrir
  const [toAddress, setToAddress] = useState(account);      // Adresse par défaut préremplie avec celle du compte
  const [boosterIds, setBoosterIds] = useState([]);
  // Fonction pour créer un booster
  const handleCreateBooster = async () => {
    try {
      const response = await axios.post('http://localhost:5000/pokemon/create-booster', {
        collectionName,  // Utilise le nom de la collection
        to: account      // Adresse du compte connecté
      });
      alert('Booster créé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la création du booster:', error);
      alert('Erreur lors de la création du booster.');
    }
  };

  // Fonction pour ouvrir un booster
  const handleOpenBooster = async () => {
    try {
      const response = await axios.post('http://localhost:5000/pokemon/open-booster', {
        boosterId,   // L'ID du booster que tu veux ouvrir
        to: toAddress  // Adresse du destinataire, par défaut l'adresse du compte connecté
      });
      alert('Booster ouvert avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du booster:', error);
      alert('Erreur lors de l\'ouverture du booster.');
    }
  };

  // Fonction pour récupérer les IDs des boosters depuis le backend
  const getBoosterIds = async () => {
    try {
      const response = await axios.get('http://localhost:5000/pokemon/booster-ids'); // Appelle la route backend
      const ids = response.data.boosterIds;
      setBoosterIds(ids);
      console.log('Booster IDs:', ids);
    } catch (error) {
      console.error('Erreur lors de la récupération des IDs des boosters:', error);
    }
  };

  // Charger les boosterIds lors du montage du composant
  useEffect(() => {
    getBoosterIds();
  }, []);

  return (
    <div className={styles.boosterContainer}>
      <h2>Créer un Booster</h2>
      <input
        type="text"
        placeholder="Nom de la Collection (ex: Jungle)"
        value={collectionName}
        onChange={(e) => setCollectionName(e.target.value)}
        className={styles.inputField}
      />
      <button onClick={handleCreateBooster} className={styles.createBoosterButton}>
        Créer Booster
      </button>

      <h2>Ouvrir un Booster</h2>
      <input
        type="text"
        placeholder="Booster ID"
        value={boosterId}
        onChange={(e) => setBoosterId(e.target.value)}
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

      <h2>Booster IDs existants</h2>
      <ul>
        {boosterIds.map(id => (
          <li key={id}>{id}</li>
        ))}
      </ul>
    </div>
  );
};

export default BoosterComponent;