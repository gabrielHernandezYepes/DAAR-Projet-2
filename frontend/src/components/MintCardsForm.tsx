import React, { useState } from 'react';
import { Main } from '../lib/main';

type Props = {
  contract: Main;
};

export const MintCardsForm: React.FC<Props> = ({ contract }) => {
  const [collectionId, setCollectionId] = useState<number>(0);
  const [address, setAddress] = useState<string>('');
  const [cardNumbers, setCardNumbers] = useState<string>(''); // String à parser en tableau
  const [tokenURIs, setTokenURIs] = useState<string>(''); // String à parser en tableau
  const [minting, setMinting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleMint = async () => {
    setMinting(true);
    setError(null);

    try {
      // Convertir les chaînes de texte en tableaux
      const cardNumbersArray = cardNumbers.split(',').map((num) => parseInt(num.trim(), 10));
      const tokenURIsArray = tokenURIs.split(',').map((uri) => uri.trim());

      // Appeler la fonction `mintCardsToUser` du contrat
      const tx = await contract.mintCardsToUser(collectionId, address, cardNumbersArray, tokenURIsArray);
      await tx.wait(); // Attendre la confirmation de la transaction

      alert('Minting réussi!');
    } catch (err: any) {
      console.error(err);
      setError('Une erreur est survenue pendant le minting.');
    } finally {
      setMinting(false);
    }
  };

  return (
    <div>
      <h3>Mint des cartes</h3>
      <label>
        Collection ID:
        <input
          type="number"
          value={collectionId}
          onChange={(e) => setCollectionId(parseInt(e.target.value, 10))}
        />
      </label>
      <label>
        Adresse de l'utilisateur:
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
      </label>
      <label>
        Numéros de cartes (séparés par des virgules):
        <input
          type="text"
          value={cardNumbers}
          onChange={(e) => setCardNumbers(e.target.value)}
        />
      </label>
      <label>
        URIs des cartes (séparées par des virgules):
        <input
          type="text"
          value={tokenURIs}
          onChange={(e) => setTokenURIs(e.target.value)}
        />
      </label>
      <button onClick={handleMint} disabled={minting}>
        {minting ? 'Minting en cours...' : 'Mint Cards'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

