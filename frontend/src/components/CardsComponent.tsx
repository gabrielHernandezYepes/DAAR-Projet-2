import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../styles.module.css';

type Props = {
  setId: string;
  setName: string;
};

type Card = {
  id: string;
  name: string;
  images: {
    small: string;
    large: string;
  };
  number: string;
};

export const CardsComponent: React.FC<Props> = ({ setId, setName }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [minting, setMinting] = useState<boolean>(false);
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());

  const cardsPerPage = 4; // Nombre de cartes par page
  const totalPages = Math.ceil(cards.length / cardsPerPage);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        console.log(setId);
        const response = await axios.get(`http://localhost:5000/pokemon/sets/`+  setId );
        console.log(response.data);
        setCards(response.data.cards); 
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };
  
    if (setId) {
      fetchCards(); 
    }
  }, [setId]);
  

   
  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages - 1));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const handleCardClick = (cardId: string) => {
    setSelectedCardIds((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(cardId)) {
        newSelected.delete(cardId);
      } else {
        newSelected.add(cardId);
      }
      return newSelected;
    });
  };

  const handleMint = async () => {
    if (!recipientAddress) {
      alert("Veuillez fournir une adresse");
      return;
    }
    if (selectedCardIds.size === 0) {
      alert("Veuillez sélectionner au moins une carte à minter.");
      return;
    }
    setMinting(true);
    try {
      const selectedCards = cards.filter((card) => selectedCardIds.has(card.id));
      const tokenURIs = selectedCards.map((card) => card.images.large);
      const cardNumbers = selectedCards.map((card) => {
        const cardNumber = parseInt(card.number, 10);
        if (isNaN(cardNumber)) {
          console.error(`L'identifiant de la carte n'est pas un nombre valide : ${card.number}`);
          throw new Error(`Invalid card number: ${card.number}`);
        }
        return cardNumber;
      });

      // Appel au backend pour minter les cartes
      await axios.post('http://localhost:5000/pokemon/mint-cards', {
        collectionId: setName, 
        to: recipientAddress,
        cardNumbers: cardNumbers,
        tokenURIs: tokenURIs,
      });

      alert(`Cartes mintées avec succès pour ${recipientAddress}`);
      setSelectedCardIds(new Set());
      setRecipientAddress('');
    } catch (err) {
      console.error(`Erreur lors du minting des cartes : ${(err as Error).message}`);
      alert(`Erreur lors du minting des cartes : ${(err as Error).message}`);
    } finally {
      setMinting(false);
    }
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
          <div
            key={card.id}
            className={`${styles.card} ${selectedCardIds.has(card.id) ? styles.selectedCard : ''}`}
            onClick={() => handleCardClick(card.id)}
          >
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

      {/* Formulaire de mint */}
      <div className={styles.mintForm}>
        <input
          type="text"
          placeholder="Adresse du destinataire"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          className={styles.mintInput}
        />
        <button
          onClick={handleMint}
          disabled={selectedCardIds.size === 0 || minting}
          className={styles.mintButton}
        >
          {minting ? 'Minting...' : 'Mint Selected Cards'}
        </button>
      </div>
    </div>
  );
};

export default CardsComponent;
