import React, { useState, useEffect } from 'react';

// Remplacez par l'ID du set que vous souhaitez obtenir
const POKEMON_TCG_API_URL = 'https://api.pokemontcg.io/v2/sets/';
const API_KEY = "58f79f80-fbc7-4674-8096-494ca50caab7"; // Add a fallback to an empty string if undefined

type SetInfo = {
  id: string;
  name: string;
  releaseDate: string;
  total: number;
};

export const GetSet: React.FC = () => {
  const [setId, setSetId] = useState<string>('base1'); // Remplacez 'base1' par l'ID de votre choix
  const [setInfo, setSetInfo] = useState<SetInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour appeler l'API Pokémon TCG et récupérer les informations du set
  const fetchSet = async (setId: string) => {
    if (!API_KEY) {
      setError('API key is missing');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${POKEMON_TCG_API_URL}${setId}`, {
        headers: {
          'X-Api-Key': API_KEY // Ensure the API key is not undefined
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }

      const data = await response.json();
      setSetInfo(data.data); // Les données du set sont dans `data.data`
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Utiliser useEffect pour appeler l'API une fois que le composant est monté
  useEffect(() => {
    fetchSet(setId);
  }, [setId]);

  return (
    <div>
      <h1>Pokémon TCG Set Info</h1>

      <label>
        Set ID:
        <input
          type="text"
          value={setId}
          onChange={(e) => setSetId(e.target.value)}
        />
      </label>
      <button onClick={() => fetchSet(setId)}>Rechercher</button>

      {loading && <p>Chargement en cours...</p>}
      {error && <p style={{ color: 'red' }}>Erreur: {error}</p>}
      {setInfo && (
        <div>
          <h2>{setInfo.name}</h2>
          <p>Date de sortie : {setInfo.releaseDate}</p>
          <p>Nombre total de cartes : {setInfo.total}</p>
        </div>
      )}
    </div>
  );
};

export default GetSet;
