// routes/pokemon.js
const express = require('express');
const axios = require('axios');
const { ethers } = require('ethers');

const router = express.Router();
require('dotenv').config();

const MainABI = require('../../contracts/artifacts/src/Main.sol/Main.json');
const BoosterABI = require('../../contracts/artifacts/src/Booster.sol/Booster.json');
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const mainContract = new ethers.Contract(process.env.MAIN_CONTRACT_ADDRESS, MainABI.abi, wallet);
const POKEMON_API_BASE_URL = process.env.POKEMON_API_BASE_URL;
const apiKey = process.env.POKEMON_API_KEY; 
const signer = provider.getSigner();
const boosterContractAddress = process.env.BOOSTER_CONTRACT_ADDRESS;
const boosterContract = new ethers.Contract(boosterContractAddress, BoosterABI.abi, signer);
const axiosInstance = axios.create({
  baseURL: POKEMON_API_BASE_URL,
  headers: {
    'X-Api-Key': apiKey,
  },
});

// Route pour obtenir tous les sets
router.get('/sets', async (req, res) => {
  try {
    const { data } = await axiosInstance.get('/sets');
    const sets = data.data;
    res.status(200).json({ sets });
  } catch (error) {
    console.error('Erreur lors de la récupération des sets:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

// Route pour obtenir les cartes d'un set par ID de set
router.get('/sets/:setId', async (req, res) => {
  try {
    const  {setId} = req.params;
    console.log('ID du set:', setId);
    // Requête simple avec uniquement setId correctement interpolé
    const { data } = await axios.get('https://api.pokemontcg.io/v2/cards?q=set.id:'+setId);

    const cards = data.data;
    // Retourner la liste des cartes pour le set donné
    res.status(200).json({
      cards,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des cartes du set:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});



// Route pour créer une collection sur la blockchain
router.post('/create-collection', async (req, res) => {
  try {
    const { name } = req.body;

    console.log(`Création de la collection ${name} sur la blockchain...`);

    // Vérifier si la collection existe déjà
    const exists = await mainContract.collectionExists(name);
    if (exists) {
      console.log(`La collection ${name} existe déjà sur la blockchain.`);
      return res.status(400).json({ message: 'La collection existe déjà.' });
    }

    // Récupérer le set par nom
    const setResponse = await axiosInstance.get('/sets', {
      params: {
        q: `name:"${name}"`,
      },
    });

    const sets = setResponse.data.data;
    if (!sets || sets.length === 0) {
      return res.status(404).json({ message: 'Set non trouvé.' });
    }

    const set = sets[0];
    // Récupérer les cartes du set (limité pour éviter les problèmes de gas)
    const cardsResponse = await axiosInstance.get('/cards', {
      params: {
        q: `set.id:${set.id}`,
        pageSize: 5, // Limiter le nombre de cartes pour éviter les problèmes de gas
      },
    });
    const cards = cardsResponse.data.data;
    const gasEstimate = await mainContract.estimateGas.createCollection(name, cards.length);
    const tx = await mainContract.createCollection(name, cards.length, {
      gasLimit: gasEstimate.mul(2),
    });
    const receipt = await tx.wait();
    console.log(`Collection ${name} créée avec succès. Hash de la transaction: ${receipt.transactionHash}`);
    res.json({ message: 'Collection créée avec succès sur la blockchain' });
  } catch (err) {
    console.error('Erreur lors de la création de la collection:', err);
    res.status(500).json({ error: 'Erreur lors de la création de la collection' });
  }
});

router.post('/mint-cards', async (req, res) => {
  try {
    const { collectionId, to, cardNumbers, tokenURIs } = req.body;
    console.log(`Minting cards for user ${to} in collection ${collectionId}`);
    const gasEstimate = await mainContract.estimateGas.mintCardsToUser(collectionId, to, cardNumbers, tokenURIs);
    console.log("Set ID:", collectionId);
    console.log("Card Numbers:", cardNumbers);
    console.log("Token URIs:", tokenURIs);
    console.log("To Address:", to);
    const tx = await mainContract.mintCardsToUser(collectionId, to, cardNumbers, tokenURIs, {
      gasLimit: gasEstimate.mul(2),
    });
    const receipt = await tx.wait();
    console.log(`Cartes mintées avec succès. Hash de la transaction: ${receipt.transactionHash}`);
    res.json({ success: true, message: 'Cartes mintées avec succès' });
  } catch (error) {
    console.error('Erreur lors du mint des cartes:', error);
    res.status(500).json({ error: 'Erreur lors du mint des cartes' });
  }
});

// Route pour obtenir les cartes d'un utilisateur
router.get('/get-cards-of-user/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const userCards = await mainContract.getCardsOfUser(address);

    const cards = userCards.map((card) => ({
      tokenId: card.tokenId.toNumber(),
      collectionId: card.collectionId,
      cardNumber: card.cardNumber.toNumber(),
      tokenURI: card.tokenURI,
    }));

    res.json({ success: true, cards });
  } catch (error) {
    console.error('Erreur lors de la récupération des cartes de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des cartes de l\'utilisateur' });
  }
});

// Route pour obtenir tous les utilisateurs
router.get('/get-all-users', async (req, res) => {
  try {
    const users = await mainContract.getAllUsers();
    res.json({ success: true, users });
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les utilisateurs:', error);
    if (error.reason) {
        console.error('Raison de l\'erreur:', error.reason);
      }
      res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
  
});

router.post('/create-booster', async (req, res) => {
  try {
    const { collectionName, to } = req.body;
    console.log("Entrée dans la route /create-booster");
    const setsResponse = await axiosInstance.get('/sets', {
      params: {
        q: `name:"${collectionName}"` 
      }
    });
    const sets = setsResponse.data.data;
    if (!sets || sets.length === 0) {
      console.log("Set non trouvé");
      return res.status(404).json({ message: 'Set non trouvé.' });
    }
    console.log("avant SetId")
    const setId = sets[0].id;
    console.log("Set ID trouvé:", setId);
    const cardsResponse = await axiosInstance.get('/cards', {
      params: {
        q: `set.id:${setId}`,
        pageSize: 100
      }
    });
    console.log("après cardsResponse")
    const allCards = cardsResponse.data.data;
    if (allCards.length < 3) {
      console.log("Pas assez de cartes pour créer un booster");
      return res.status(400).json({ message: 'Pas assez de cartes dans ce set pour créer un booster.' });
    }
    const shuffled = allCards.sort(() => 0.5 - Math.random());
    const selectedCards = shuffled.slice(0, 3);
    const cardNumbers = selectedCards.map(card => parseInt(card.number));
    const tokenURIs = selectedCards.map(card => card.images.large); 

    console.log("avant d etre envoye")
    console.log("Set ID:", collectionName);
    console.log("Card Numbers:", cardNumbers);
    console.log("Token URIs:", tokenURIs);
    console.log("To Address:", to);
    

    

    const tx = await mainContract.createBooster( to,
      {gasLimit: ethers.utils.hexlify(3000000)}
    );
    const receipt = await tx.wait();
  
    const tx2 = await mainContract.mintCardsToUser(collectionName, to, cardNumbers, tokenURIs, {
      gasLimit:ethers.utils.hexlify(3000000),
    });
    const receipt2 = await tx2.wait();

    console.log(`Booster créé avec succès. Hash de la transaction: ${receipt2.transactionHash}`);
    res.json({ success: true, message: 'Booster créé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la création du booster:', error);
    res.status(500).json({ error: 'Erreur lors de la création du booster' });
  }
});



router.post('/open-booster', async (req, res) => {
  try {
    const { boosterId, to } = req.body;

    console.log("Entrée dans la route /open-booster");
    console.log("boosterId:", boosterId);
    console.log("to:", to);

    // Vérifier si le booster existe sur la blockchain
    const boosterExists = await boosterContract.boosters(boosterId);
    if (!boosterExists) {
      console.log("Booster non trouvé");
      return res.status(404).json({ message: 'Booster non trouvé.' });
    }

    // Récupérer les informations du booster
    const boosterInfo = await boosterContract.boosters(boosterId);
    const { cardNumbers, tokenURIs } = boosterInfo;

    console.log("Booster trouvé avec succès.");
    console.log("Card Numbers:", cardNumbers);
    console.log("Token URIs:", tokenURIs);
    console.log("To Address:", to);

    // Appel au contrat pour ouvrir le booster et envoyer les cartes au compte donné
    const tx = await boosterContract.estimateGas.openBooster(
      boosterId,
      to
    );
    
    // Appliquer une marge de sécurité sur l'estimation du gas
    const gasLimit = tx.mul(2); // Par exemple, multiplier par 2 pour être sûr

    const transaction = await boosterContract.openBooster(
      boosterId,
      to,
      { gasLimit }
    );
    
    const receipt = await transaction.wait();

    console.log(`Booster ouvert avec succès. Hash de la transaction: ${receipt.transactionHash}`);
    res.json({ success: true, message: 'Booster ouvert avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'ouverture du booster:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ouverture du booster' });
  }
});







module.exports = router;
