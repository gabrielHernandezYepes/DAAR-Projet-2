import React from 'react'
import { Collection } from '../hooks/useCollections'

type Props = {
  collection: Collection
}

export const CollectionItem: React.FC<Props> = ({ collection }) => {
  return (
    <div>
      <h3>{collection.name}</h3>
      <p>Address: {collection.address}</p>
      <p>Number of Cards: {collection.cardCount}</p>
      {/* Vous pouvez ajouter un lien ou un bouton pour afficher les cartes de cette collection */}
    </div>
  )
}
