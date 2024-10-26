import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CardsComponent } from './CardsComponent';
import styles from '../styles.module.css';

interface SetsComponentProps {}

const SetsComponent: React.FC<SetsComponentProps> = () => {
  const [sets, setSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSet, setSelectedSet] = useState<{ id: string; name: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const setsPerPage = 4;
  const totalPages = Math.ceil(sets.length / setsPerPage);

  // Fonction pour récupérer les sets depuis le serveur
  const fetchSets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/pokemon/sets');
      setSets(response.data.sets);
      setLoading(false);
    } catch (error) {
      setError('Erreur lors de la récupération des sets.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSets(); // Appel pour récupérer les sets au chargement du composant
  }, []);

  const handleSetClick = async (set: {
    id: string;
    name: string;
    images: { logo: string };
    releaseDate: string;
    total: number;
  }) => {
    try {
      await axios.post('http://localhost:5000/pokemon/create-collection', {
        name: set.name,
      });
    } catch (error) {
      console.error('Erreur lors de la vérification ou de la création du set:', error);
    }

    setSelectedSet(set);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages - 1));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const displayedSets = sets.slice(currentPage * setsPerPage, (currentPage + 1) * setsPerPage);

  if (loading) return <p>Chargement des sets...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div>
      {!selectedSet ? (
        <div>
          <div className={styles['sets-container']}>
            {displayedSets.map((set) => (
              <div
                key={set.id}
                className={styles.set}
                onClick={() => handleSetClick(set)}
                style={{ cursor: 'pointer' }}
              >
                <img src={set.images.logo} alt={`Logo de ${set.name}`} className={styles.setLogo} />
                <h2>{set.name}</h2>
                <p>Date de sortie : {set.releaseDate}</p>
                <p>Total de cartes : {set.total}</p>
              </div>
            ))}
          </div>

          <div>
            <button onClick={handlePreviousPage} disabled={currentPage === 0}>
              Précédent
            </button>
            <button onClick={handleNextPage} disabled={currentPage === totalPages - 1}>
              Suivant
            </button>
          </div>
        </div>
      ) : (
        <CardsComponent setId={selectedSet.id} setName={selectedSet.name} />
      )}
    </div>
  );
};

export default SetsComponent;
