// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NFTCollection.sol";

contract Main is Ownable {
    struct CollectionInfo {
        string name;
        uint cardCount;
        uint mintedCount;
    }

    // Mapping de collectionId vers les informations de la collection
    mapping(uint => CollectionInfo) public collections;
    uint public collectionCount = 0;

    NFTCollection public nftContract;

    constructor(address _nftContractAddress) {
        nftContract = NFTCollection(_nftContractAddress);
    }

    // Fonction pour créer une nouvelle collection
    function createCollection(string calldata name, uint cardCount) external onlyOwner {
        collections[collectionCount] = CollectionInfo({
            name: name,
            cardCount: cardCount,
            mintedCount: 0
        });
        collectionCount++;
    }

    // Fonction pour frapper et assigner des cartes à un utilisateur
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

            // Vérifie que la carte n'a pas déjà été frappée
            // Vous pouvez implémenter un mécanisme pour suivre les cartes déjà frappées

            // Frappe la carte via le contrat NFTCollection
            nftContract.mintCard(to, collectionId, cardNumber, tokenURIs[i]);

            collection.mintedCount++;
        }
    }

    // Fonction pour obtenir les informations d'une collection
    function getCollection(uint collectionId) external view returns (CollectionInfo memory) {
        require(collectionId < collectionCount, "Collection does not exist");
        return collections[collectionId];
    }
}
