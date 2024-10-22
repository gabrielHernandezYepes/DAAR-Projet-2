import React, { useState } from 'react';
import { Main } from '../lib/main';

type Props = {
  contract: Main;
};

export const CreateCollectForm: React.FC<Props> = ({ contract }) => {
  const [name, setName] = useState<string>(''); // Nom de la collection
  const [cardCount, setCardCount] = useState<number>(0); // Nombre de cartes dans la collection
  const [minting, setMinting] = useState<boolean>(false); // Statut du minting
  const [error, setError] = useState<string | null>(null); // Pour afficher les erreurs

  const handleCreateCollection = async () => {
    setMinting(true);
    setError(null);

    try {
      // Appel du contrat pour créer une collection
      const tx = await contract.createCollection(name, cardCount);
      await tx.wait(); // Attendre la confirmation de la transaction

      alert('Création de la collection réussie !');
    } catch (err: any) {
      console.error(err);
      setError('Une erreur est survenue pendant la création de la collection.');
    } finally {
      setMinting(false);
    }
  };

  return (
    <div>
      <h3>Créer une nouvelle Collection</h3>
      <label>
        Nom de la collection:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)} // Mettre à jour le nom de la collection
        />
      </label>
      <br />
      <label>
        Nombre de cartes dans la collection:
        <input
          type="number"
          value={cardCount}
          onChange={(e) => setCardCount(parseInt(e.target.value, 10))} // Mettre à jour le nombre de cartes
        />
      </label>
      <br />
      <button onClick={handleCreateCollection} disabled={minting}>
        {minting ? 'Création en cours...' : 'Créer Collection'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default CreateCollectForm;
