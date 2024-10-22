import React from 'react';

type NFTCardProps = {
  name: string;
  illustration?: string; // Le champ illustration peut être optionnel s'il peut être null ou non défini
};

const NFTCard: React.FC<NFTCardProps> = ({ name, illustration }) => (
  <div className="nft-card">
    <h3>{name}</h3>
    {illustration ? (
      <img src={illustration} alt={name} />
    ) : (
      <p>Aucune illustration disponible</p>
    )}
  </div>
);

export default NFTCard;
