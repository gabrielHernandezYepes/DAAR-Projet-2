import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../styles.module.css';

export const CardsComponent = ({ setId, setName }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const cardsPerPage = 8; // Nombre de cartes par page
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
