// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pokemonRouter = require('./routes/pokemon');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/pokemon', pokemonRouter);

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

// Route de base
app.get('/', (req, res) => {
  res.send('Bienvenue sur l\'API Pokémon TCG');
});
