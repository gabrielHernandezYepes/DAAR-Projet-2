import { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { BigNumber } from 'ethers';

export type Collection = {
  collectionId: number;
  name: string;
  cardCount: number;
};

export const useCollections = (mainContract: ethers.Contract | undefined) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    if (!mainContract) return;

    setLoading(true);
    try {
      const nextCollectionId: BigNumber = await mainContract.nextCollectionId();
      const totalCollections = nextCollectionId.toNumber();

      const tempCollections: Collection[] = [];

      for (let i = 0; i < totalCollections; i++) {
        const collectionData = await mainContract.collections(i);
        const collection: Collection = {
          collectionId: i,
          name: collectionData.name,
          cardCount: collectionData.cardCount.toNumber(),
        };
        tempCollections.push(collection);
      }

      setCollections(tempCollections);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [mainContract]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return { collections, loading, error, fetchCollections };
};
