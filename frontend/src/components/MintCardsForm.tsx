import React, { useState } from 'react';
import { ethers } from 'ethers';

interface MintCardsFormProps {
  contract: ethers.Contract; // Le contrat principal pour mint
  collectionId: number; // ID de la collection
  onMintSuccess?: (message: string) => void; // Callback en cas de succès
}

const MintCardsForm: React.FC<MintCardsFormProps> = ({ contract, collectionId, onMintSuccess }) => {
  const [recipientAddress, setRecipientAddress] = useState<string>(''); // L'adresse du destinataire
  const [cardNumber, setCardNumber] = useState<number>(1); // Le numéro de la carte
  const [tokenURI, setTokenURI] = useState<string>(''); // Le token URI pour la carte
  const [minting, setMinting] = useState<boolean>(false); // L'état du processus de mint
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Gestion des erreurs

  // Fonction pour mint les cartes
  const handleMintCards = async () => {
    if (!contract || !recipientAddress || !tokenURI) return;
    setMinting(true); // Indiquer que le mint est en cours
    try {
      const tx = await contract.mintCard(recipientAddress, collectionId, cardNumber, tokenURI);
      await tx.wait();
      onMintSuccess && onMintSuccess(`Carte ${cardNumber} mintée avec succès pour ${recipientAddress}`);
      setErrorMessage(null); // Réinitialiser l'erreur
    } catch (error: any) {
      setErrorMessage(`Erreur : ${error.message}`);
    } finally {
      setMinting(false); // Le mint est terminé
    }
  };

  return (
    <div>
      <h2>Mint des cartes dans la collection {collectionId}</h2>
      <div>
        <input
          type="text"
          placeholder="Adresse du destinataire"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          disabled={minting}
        />
      </div>
      <div>
        <input
          type="number"
          placeholder="Numéro de la carte"
          value={cardNumber}
          onChange={(e) => setCardNumber(Number(e.target.value))}
          min={1}
          disabled={minting}
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Token URI (lien vers l'image ou les métadonnées)"
          value={tokenURI}
          onChange={(e) => setTokenURI(e.target.value)}
          disabled={minting}
        />
      </div>
      <button onClick={handleMintCards} disabled={minting || !recipientAddress || !tokenURI}>
        {minting ? 'Minting...' : 'Mint Carte'}
      </button>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default MintCardsForm;
