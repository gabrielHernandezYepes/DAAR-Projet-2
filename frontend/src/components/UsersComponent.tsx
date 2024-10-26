import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../styles.module.css';

type Props = {};

type CardInfo = {
  tokenId: number;
  collectionId: string;
  cardNumber: number;
  tokenURI: string;
};

type UserCards = {
  owner: string;
  cards: CardInfo[];
};

export const UsersComponent: React.FC<Props> = () => {
  const [usersCards, setUsersCards] = useState<UserCards[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsersCards = async () => {
      try {
        // Récupérer tous les utilisateurs via le backend
        const usersResponse = await axios.get('http://localhost:5000/pokemon/get-all-users');
        const users = usersResponse.data.users;

        const usersCardsPromises = users.map(async (user: string) => {
          // Récupérer les cartes de l'utilisateur via le backend
          const cardsResponse = await axios.get(`http://localhost:5000/pokemon/get-cards-of-user/${user}`);
          const cards = cardsResponse.data.cards;

          return {
            owner: user,
            cards,
          };
        });

        const usersCards = await Promise.all(usersCardsPromises);
        setUsersCards(usersCards);
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };

    fetchUsersCards();
  }, []);

  if (loading) return <p>Chargement des utilisateurs et de leurs cartes...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div>
      <h2>Cartes de tous les utilisateurs</h2>
      {usersCards.map((userCards) => (
        <div key={userCards.owner} className={styles.userSection}>
          <h3>Utilisateur : {userCards.owner}</h3>
          <div className={styles['cards-container']}>
            {userCards.cards.map((card) => (
              <div key={card.tokenId} className={styles.card}>
                <img src={card.tokenURI} alt={`Card ${card.cardNumber}`} className={styles.cardImage} />
                <p>Token ID: {card.tokenId}</p>
                <p>Collection ID: {card.collectionId}</p>
                <p>Card Number: {card.cardNumber}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UsersComponent;
