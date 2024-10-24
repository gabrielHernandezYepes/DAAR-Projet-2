import React, { useState } from 'react';
import { ethers } from 'ethers';

interface MintCardProps {
  contract: ethers.Contract;
  collectionId: number;
  cardNumber: number;
  tokenURI: string;
}

const MintCard: React.FC<MintCardProps> = ({ contract, collectionId, cardNumber, tokenURI }) => {
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [minting, setMinting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fonction pour mint la carte à l'adresse fournie
  const handleMintCard = async () => {
    if (!contract || !recipientAddress) return;
    setMinting(true);
    try {
      const tx = await contract.mintCard(recipientAddress, collectionId, cardNumber, tokenURI);
      await tx.wait();
      setSuccessMessage(`Carte ${cardNumber} a été mintée pour ${recipientAddress} !`);
      setErrorMessage(null);
    } catch (error: any) {
      setErrorMessage(`Erreur: ${error.message}`);
      setSuccessMessage(null);
    } finally {
      setMinting(false);
    }
  };

  return (
    <div>
      <h2>Mint une carte</h2>
      <input
        type="text"
        value={recipientAddress}
        onChange={(e) => setRecipientAddress(e.target.value)}
        placeholder="Adresse du destinataire"
        disabled={minting}
      />
      <button onClick={handleMintCard} disabled={minting || !recipientAddress}>
        {minting ? 'Minting en cours...' : 'Mint Carte'}
      </button>
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default MintCard;
