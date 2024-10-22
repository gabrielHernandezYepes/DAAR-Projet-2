const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const NFTCollectionABI = require('./abis/NFTCollection.json');

const app = express();
const port = 3000;

app.use(cors());

// Configuration du fournisseur Ethereum
const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID');

// Adresse du contrat NFT
const nftContractAddress = 'ADRESSE_DU_CONTRAT_NFT';

// Instance du contrat
const nftContract = new ethers.Contract(nftContractAddress, NFTCollectionABI, provider);

// Fonction pour obtenir les métadonnées d'un NFT
async function getNFTMetadata(tokenId) {
  const cardInfo = await nftContract.cardInfos(tokenId);

  return {
    name: `Card #${cardInfo.cardNumber}`,
    illustration: cardInfo.tokenURI || null,
  };
}

// Route API pour obtenir les métadonnées d'un NFT
app.get('/api/nft/:tokenId', async (req, res) => {
  const tokenId = req.params.tokenId;

  try {
    const metadata = await getNFTMetadata(tokenId);
    res.json(metadata);
  } catch (error) {
    console.error(`Erreur lors de la récupération des métadonnées pour le tokenId ${tokenId}`, error);
    res.status(500).json({ error: 'Erreur lors de la récupération des métadonnées' });
  }
});

app.listen(port, () => {
  console.log(`Le serveur API NFT est en cours d'exécution sur http://localhost:${port}`);
});
