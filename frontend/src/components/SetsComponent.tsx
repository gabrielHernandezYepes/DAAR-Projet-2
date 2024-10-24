import React, { useState } from 'react';
import { usePokemonSets } from '../hooks/usePokemonSets';
import { CardsComponent } from './CardsComponent'; // Composant qui affiche les cartes
import styles from '../styles.module.css';

const SetsComponent = () => {
  const { sets, loading, error } = usePokemonSets();
  const [selectedSet, setSelectedSet] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // Pour la pagination

  const setsPerPage = 4; // Nombre de sets par page
  const totalPages = Math.ceil(sets.length / setsPerPage); // Nombre total de pages

  // Gestion du clic sur un set pour afficher ses cartes
  const handleSetClick = (set) => {
    setSelectedSet(set);
  };

  // Fonction pour changer de page (pagination)
  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages - 1));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  // Récupérer les sets à afficher pour la page actuelle
  const displayedSets = sets.slice(
    currentPage * setsPerPage,
    (currentPage + 1) * setsPerPage
  );

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
                style={{ cursor: 'pointer' }} // Ajouter un curseur de pointeur
              >
                <img
                  src={set.images.logo}
                  alt={`Logo de ${set.name}`}
                  className={styles.setLogo}
                />
                <h2>{set.name}</h2>
                <p>Date de sortie : {set.releaseDate}</p>
                <p>Total de cartes : {set.total}</p>
              </div>
            ))}
          </div>

          {/* Boutons de pagination */}
          <div>
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
      ) : (
        <CardsComponent setId={selectedSet.id} setName={selectedSet.name} />
      )}
    </div>
  );
};

export default SetsComponent;
