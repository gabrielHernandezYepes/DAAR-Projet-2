// src/components/TransferOwnershipForm.tsx

import React, { useState } from 'react';
import { ethers } from 'ethers';

interface TransferOwnershipFormProps {
  transferOwnership: (newOwner: string) => Promise<void>;
}

export const TransferOwnershipForm: React.FC<TransferOwnershipFormProps> = ({ transferOwnership }) => {
  const [newOwner, setNewOwner] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!ethers.utils.isAddress(newOwner)) {
      setError('Adresse Ethereum invalide.');
      return;
    }

    try {
      setLoading(true);
      await transferOwnership(newOwner);
      setSuccess(`Propriété transférée avec succès à ${newOwner}`);
      setNewOwner('');
    } catch (err: any) {
      setError(err.message || 'Erreur lors du transfert.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
      <h2>Transférer la Propriété du Contrat</h2>
      <label>
        Nouvelle Adresse du Propriétaire :
        <input
          type="text"
          value={newOwner}
          onChange={(e) => setNewOwner(e.target.value)}
          placeholder="0x..."
          required
          style={{ marginLeft: '10px', width: '400px' }}
        />
      </label>
      <button type="submit" disabled={loading} style={{ display: 'block', marginTop: '10px' }}>
        {loading ? 'Transfert en cours...' : 'Transférer la Propriété'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </form>
  );
};
