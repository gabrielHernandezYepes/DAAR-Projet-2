import React from 'react'
import { Collection } from '../hooks/useCollections'
import { CollectionItem } from './CollectionItem'

type Props = {
  collections: Collection[]
}

export const CollectionList: React.FC<Props> = ({ collections }) => {
  return (
    <div>
      <h2>Collections</h2>
      {collections.map((collection) => (
        <CollectionItem key={collection.index} collection={collection} />
      ))}
    </div>
  )
}
