// src/App.tsx

import React, { useEffect, useState } from 'react';
import { useWallet } from './hooks/useWallet';
import { useCollections } from './hooks/useCollections';
import styles from './styles.module.css';
import { ethers } from 'ethers';

export const App = () => {
  const { provider, account, mainContract, nftContract } = useWallet();
  const { collections, loading, error } = useCollections(mainContract);

  // États pour les formulaires
  const [collectionName, setCollectionName] = useState<string>('');
  const [cardCount, setCardCount] = useState<number>(0);

  const [userAddress, setUserAddress] = useState<string>('');
  const [cardNumbers, setCardNumbers] = useState<string>(''); // Saisir les numéros de cartes séparés par des virgules
  const [imgs, setImgs] = useState<string>(''); // Saisir les images correspondantes séparées par des virgules

  const [userTokens, setUserTokens] = useState<number[]>([]); // Tokens détenus par l'utilisateur

  // États pour la recherche dans l'API Pokémon
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredCollection, setFilteredCollection] = useState<any | null>(null);

  // Fonction pour créer une collection
  const createCollection = async () => {
    if (mainContract) {
      try {
        const tx = await mainContract.createCollection(collectionName, cardCount);
        await tx.wait();
        alert('Collection créée avec succès!');
        setCollectionName('');
        setCardCount(0);
        await fetchCollections(); // Rafraîchir la liste des collections
      } catch (err) {
        console.error('Erreur lors de la création de la collection:', err);
      }
    } else {
      console.error("Le contrat Main n'est pas initialisé.");
    }
  };

  // Fonction pour mint des cartes
  const mintCards = async () => {
    if (mainContract) {
      try {
        const cardNumbersArray = cardNumbers.split(',').map(Number);
        const imgsArray = imgs.split(',');

        if (cardNumbersArray.length !== imgsArray.length) {
          alert('Le nombre de numéros de cartes et d\'images doit être égal.');
          return;
        }

        const tx = await mainContract.mintCardsToUser(
          0, // Remplacez par l'ID de la collection souhaitée
          userAddress,
          cardNumbersArray,
          imgsArray
        );
        await tx.wait();
        alert('Cartes mintées avec succès!');
        setUserAddress('');
        setCardNumbers('');
        setImgs('');
      } catch (err) {
        console.error('Erreur lors du minting des cartes:', err);
      }
    } else {
      console.error("Le contrat Main n'est pas initialisé.");
    }
  };

  // Fonction pour récupérer les NFTs de l'utilisateur connecté
  const fetchUserTokens = async () => {
    if (nftContract && account) {
      try {
        const balance = await nftContract.balanceOf(account);
        const tokens: number[] = [];

        for (let i = 0; i < balance.toNumber(); i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(account, i);
          tokens.push(tokenId.toNumber());
        }

        setUserTokens(tokens);
      } catch (err) {
        console.error('Erreur lors de la récupération des tokens:', err);
      }
    }
  };

  // Appeler fetchUserTokens au démarrage et lorsque l'utilisateur ou le contrat change
  useEffect(() => {
    fetchUserTokens();
  }, [nftContract, account]);

  // Fonction de recherche dans l'API Pokémon
  const searchCollectionByName = async () => {
    if (!searchQuery) {
      alert('Veuillez entrer le nom d\'un Pokémon.');
      return;
    }

    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchQuery.toLowerCase()}`);
      if (!response.ok) {
        setFilteredCollection(null);
        alert('Pokémon non trouvé.');
        return;
      }
      const data = await response.json();
      setFilteredCollection(data);
    } catch (error) {
      console.error('Erreur lors de la recherche du Pokémon :', error);
    }
  };

  return (
    <div className={styles.body}>
      <h1>Bienvenue sur votre Collection NFT</h1>

      {/* Affichage de l'adresse connectée */}
      <p>Adresse du portefeuille connecté : {account ? account : 'Non connecté'}</p>

      {/* Section pour rechercher un Pokémon */}
      <div>
        <h2>Rechercher un Pokémon</h2>
        <input
          type="text"
          placeholder="Entrez le nom d'un Pokémon"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={searchCollectionByName}>Rechercher</button>

        {/* Affichage du résultat de la recherche */}
        {filteredCollection ? (
          <div>
            <h3>{filteredCollection.name.toUpperCase()}</h3>
            <img
              src={filteredCollection.sprites.front_default}
              alt={filteredCollection.name}
              width="200"
            />
            {/* Afficher d'autres informations si nécessaire */}
          </div>
        ) : (
          searchQuery && <p>Pokémon non trouvé.</p>
        )}
      </div>

      {/* Section pour afficher les collections */}
<div>
  <h2>Collections Disponibles</h2>
  {loading ? (
    <p>Chargement des collections...</p>
  ) : error ? (
    <p>Erreur : {error}</p>
  ) : (
    <ul>
      {collections.map((collection) => (
        <li key={collection.collectionId}>
          <p>ID: {collection.collectionId}</p>
          <p>Nom: {collection.name}</p>
          <p>Nombre de cartes: {collection.cardCount}</p>
        </li>
      ))}
    </ul>
  )}
</div>


      {/* Formulaire pour créer une nouvelle collection */}
      <div>
        <h2>Créer une Nouvelle Collection</h2>
        <input
          type="text"
          placeholder="Nom de la collection"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Nombre de cartes"
          value={cardCount}
          onChange={(e) => setCardCount(Number(e.target.value))}
        />
        <button onClick={createCollection}>Créer la Collection</button>
      </div>

      {/* Formulaire pour mint des cartes */}
      <div>
        <h2>Mint des Cartes</h2>
        <input
          type="text"
          placeholder="Adresse de l'utilisateur"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="Numéros de cartes (ex: 1,2,3)"
          value={cardNumbers}
          onChange={(e) => setCardNumbers(e.target.value)}
        />
        <input
          type="text"
          placeholder="Images correspondantes (ex: img1.png,img2.png,img3.png)"
          value={imgs}
          onChange={(e) => setImgs(e.target.value)}
        />
        <button onClick={mintCards}>Mint les Cartes</button>
      </div>

      {/* Affichage des NFTs de l'utilisateur */}
      <div>
        <h2>Mes NFTs</h2>
        {userTokens.length === 0 ? (
          <p>Aucun NFT trouvé</p>
        ) : (
          <ul>
            {userTokens.map((tokenId) => (
              <li key={tokenId}>
                <p>Token ID: {tokenId}</p>
                {/* Vous pouvez ajouter plus de détails en récupérant les métadonnées */}
              </li>
            ))}
          </ul>
        )}
        <button onClick={fetchUserTokens}>Rafraîchir mes NFTs</button>
      </div>
    </div>
  );
};

export default App;
