// routes/pokemon.js
const express = require('express');
const axios = require('axios');
const { ethers } = require('ethers');
require('dotenv').config();
const router = express.Router();

// Importer l'ABI du contrat
const MainABI = require('../../contracts/artifacts/src/Main.sol/Main.json');

// Configuration du fournisseur Ethereum
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Instance du contrat
const mainContract = new ethers.Contract(process.env.MAIN_CONTRACT_ADDRESS, MainABI.abi, wallet);

console.log('Adresse du contrat Main:', mainContract.address);

// Configuration de l'instance axios pour l'API Pokémon TCG
const POKEMON_API_BASE_URL = process.env.POKEMON_API_BASE_URL;
const apiKey = process.env.POKEMON_API_KEY; // Si requis

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
router.get('/sets/:setId/cards', async (req, res) => {
  try {
    const { setId } = req.params;
    const { page = 1, pageSize = 30 } = req.query;

    const { data } = await axiosInstance.get('/cards', {
      params: {
        q: `set.id:${setId}`,
        page,
        pageSize,
      },
    });

    const cards = data.data;
    const totalCount = data.totalCount;
    const totalPages = Math.ceil(totalCount / pageSize);

    res.status(200).json({
      setId,
      cards,
      totalPages,
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des cartes du set:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

// Route pour obtenir une carte par ID
router.get('/cards/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data } = await axiosInstance.get(`/cards/${id}`);

    const card = data.data;

    if (!card) {
      return res.status(404).json({ message: 'Carte non trouvée.' });
    }

    res.status(200).json({ card });
  } catch (error) {
    console.error('Erreur lors de la récupération de la carte:', error);
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

module.exports = router;
