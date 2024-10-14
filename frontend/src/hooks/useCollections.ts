import { useEffect, useState } from 'react'
import { Main } from '../lib/main'
import { ethers } from 'ethers'
import CollectionABI from '../abis/NFTCollection.json'

export type Collection = {
  index: number
  address: string
  name: string
  cardCount: number
}

export const useCollections = (contract: Main | undefined) => {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!contract) return

    const fetchCollections = async () => {
      setLoading(true)
      try {
        const collectionsCount = await contract.getCollectionsCount()
        const tempCollections: Collection[] = []
        for (let i = 0; i < collectionsCount; i++) {
          const collectionAddress = await contract.getCollection(i)
          const collectionContract = new ethers.Contract(
            collectionAddress,
            CollectionABI,
            contract.provider
          )
          const name = await collectionContract.collectionName()
          const cardCount = await collectionContract.cardCount()

          tempCollections.push({
            index: i,
            address: collectionAddress,
            name,
            cardCount: Number(cardCount),
          })
        }
        setCollections(tempCollections)
        setLoading(false)
      } catch (err: any) {
        console.error(err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchCollections()
  }, [contract])

  return { collections, loading, error }
}
