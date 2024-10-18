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
    NFTCollection public nftContract;

    event CardMinted(uint collectionId, address to, uint cardNumber, string tokenURI);

    constructor(address _owner) Ownable(msg.sender) {
        require(_owner != address(0), "Owner address cannot be zero");
        transferOwnership(_owner);
        nftContract = NFTCollection(msg.sender);
    }


    // Add the override specifier here
    function transferOwnership(address newOwner) public override onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        _transferOwnership(newOwner);
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

            nftContract.mintCard(to, collectionId, cardNumber, tokenURIs[i]);

            collection.mintedCount++;
            
            // Emit the event for off-chain tracking
            emit CardMinted(collectionId, to, cardNumber, tokenURIs[i]);
        }
    }
}
