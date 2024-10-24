import axios from 'axios';
import { useState, useEffect } from 'react';

const API_URL = 'https://api.pokemontcg.io/v2/sets';
const API_KEY = '7592bb20-baeb-4219-9499-0089565cd163'; 

export const usePokemonSets = () => {
  const [sets, setSets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSets = async () => {
      setLoading(true);
      try {
        const response = await axios.get(API_URL, {
          headers: { 'X-Api-Key': API_KEY },
        });
        setSets(response.data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSets();
  }, []);

  return { sets, loading, error };



  
};
