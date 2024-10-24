// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./NFTCollection.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Main is Ownable {
    struct CollectionInfo {
        string name;
        uint cardCount;
        uint mintedCount;
    }

    mapping(uint => CollectionInfo) public collections;
    uint public collectionCount = 0;

    mapping(uint => uint[]) public collectionCards;

    NFTCollection public nftContract;

    event CardMinted(uint collectionId, address to, uint cardNumber, string tokenURI);

    constructor(address _owner, address nftCollectionAddress) Ownable() {
        require(_owner != address(0), "Owner address cannot be zero");
        require(nftCollectionAddress != address(0), "NFT Collection address cannot be zero");
        transferOwnership(_owner);
        nftContract = NFTCollection(nftCollectionAddress); // Instancier le contrat NFTCollection avec l'adresse
    }

    function createCollection(string calldata name, uint cardCount) external onlyOwner {
        collections[collectionCount] = CollectionInfo({
            name: name,
            cardCount: cardCount,
            mintedCount: 0
        });
        collectionCount++;
    }

    function mintCardsToUser(
        uint collectionId,
        address to,
        uint[] calldata cardNumbers,
        string[] calldata tokenURIs
    ) external onlyOwner {
        require(collectionId < collectionCount, "Collection does not exist");
        require(cardNumbers.length == tokenURIs.length, "Mismatched inputs");

        CollectionInfo storage collection = collections[collectionId];

        for (uint i = 0; i < cardNumbers.length; i++) {
            uint cardNumber = cardNumbers[i];
            require(cardNumber >= 1 && cardNumber <= collection.cardCount, "Invalid card number");

            // Mint la carte dans le contrat NFT
            uint newTokenId = nftContract.mintCard(to, collectionId, cardNumber, tokenURIs[i]);

            // Ajoute le tokenId à la collection correspondante
            collectionCards[collectionId].push(newTokenId);

            collection.mintedCount++;

            // Emit event pour tracking off-chain
            emit CardMinted(collectionId, to, cardNumber, tokenURIs[i]);
        }
    }

    // Fonction pour récupérer toutes les cartes associées à une collection (set)
    function getCollectionCards(uint collectionId) external view returns (uint[] memory) {
        require(collectionId < collectionCount, "Collection does not exist");
        return collectionCards[collectionId];
    }
}
