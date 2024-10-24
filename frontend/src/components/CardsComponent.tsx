import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../styles.module.css';

export const CardsComponent = ({ setId, setName, contract }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [recipientAddresses, setRecipientAddresses] = useState({}); // Objet pour stocker l'adresse de chaque carte
  const [mintingCardId, setMintingCardId] = useState(null); // Carte en cours de mint

  const cardsPerPage = 4; // Nombre de cartes par page (4 par page maintenant)
  const totalPages = Math.ceil(cards.length / cardsPerPage); // Nombre total de pages

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await axios.get(`https://api.pokemontcg.io/v2/cards?q=set.id:${setId}`);
        setCards(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCards();
  }, [setId]);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages - 1));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const handleMint = async (card) => {
    const recipientAddress = recipientAddresses[card.id]; // Récupère l'adresse pour cette carte spécifique
    if (!contract || !recipientAddress) {
      alert("Veuillez fournir une adresse et vous assurer que le contrat est connecté.");
      return;
    }
    setMintingCardId(card.id); // Indique que le mint est en cours pour cette carte
    try {
      // Utiliser un tokenURI fictif ou réel, selon votre configuration
      const tokenURI = card.images.large;
      const tx = await contract.mintCard(recipientAddress, setId, card.id, tokenURI);
      await tx.wait();
      alert(`Carte ${card.name} mintée avec succès pour ${recipientAddress}`);
    } catch (err) {
      alert(`Erreur lors du minting de la carte ${card.name} : ${err.message}`);
    } finally {
      setMintingCardId(null); // Réinitialiser après le mint
    }
  };
  

  // Gérer la modification de l'adresse pour une carte spécifique
  const handleRecipientAddressChange = (cardId, address) => {
    setRecipientAddresses((prevAddresses) => ({
      ...prevAddresses,
      [cardId]: address,
    }));
  };

  const displayedCards = cards.slice(
    currentPage * cardsPerPage,
    (currentPage + 1) * cardsPerPage
  );

  if (loading) return <p>Chargement des cartes...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div>
      <h2>Cartes du set : {setName}</h2>
      <div className={styles['cards-container']}>
        {displayedCards.map((card) => (
          <div key={card.id} className={styles.card}>
            <img src={card.images.small} alt={card.name} className={styles.cardImage} />
            <p>{card.name}</p>
            <input
              type="text"
              placeholder="Adresse du destinataire"
              value={recipientAddresses[card.id] || ''} // Utilise l'adresse spécifique à cette carte
              onChange={(e) => handleRecipientAddressChange(card.id, e.target.value)} // Met à jour l'adresse pour cette carte
              className={styles.mintInput}
            />
            <button
              onClick={() => handleMint(card)}
              disabled={!recipientAddresses[card.id] || mintingCardId === card.id} // Désactiver si l'adresse est vide ou le mint est en cours
              className={styles.mintButton}
            >
              {mintingCardId === card.id ? 'Minting...' : 'Mint'}
            </button>
          </div>
        ))}
      </div>

      {/* Pagination des cartes */}
      <div className={styles.pagination}>
        <button onClick={handlePreviousPage} disabled={currentPage === 0}>
          Précédent
        </button>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1}
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default CardsComponent;
