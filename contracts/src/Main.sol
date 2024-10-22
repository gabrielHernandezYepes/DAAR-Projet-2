// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./NFTCollection.sol";

contract Main is Ownable {
    struct Collection {
        string name;
        uint256 cardCount;
    }

    mapping(uint256 => Collection) public collections;
    uint256 public nextCollectionId;
    NFTCollection public nftCollection;

    event CollectionCreated(uint256 indexed collectionId, string name, uint256 cardCount);

    constructor(address _nftCollectionAddress) {
        require(_nftCollectionAddress != address(0), "Invalid NFTCollection address");
        nftCollection = NFTCollection(_nftCollectionAddress);
        // Le propriétaire est initialisé automatiquement à msg.sender par Ownable
    }

    function createCollection(string memory _name, uint256 _cardCount) external onlyOwner {
        require(bytes(_name).length > 0, "Collection name cannot be empty");
        require(_cardCount > 0, "Card count must be greater than zero");

        uint256 collectionId = nextCollectionId;
        collections[collectionId] = Collection({
            name: _name,
            cardCount: _cardCount
        });
        nextCollectionId++;

        emit CollectionCreated(collectionId, _name, _cardCount);
    }

    function mintCardsToUser(
        uint256 collectionId,
        address to,
        uint256[] memory cardNumbers,
        string[] memory imgs
    ) external onlyOwner {
        require(collectionId < nextCollectionId, "Collection does not exist");
        require(cardNumbers.length == imgs.length, "cardNumbers and imgs arrays must have the same length");
        require(to != address(0), "Invalid recipient address");

        Collection memory collection = collections[collectionId];

        for (uint256 i = 0; i < cardNumbers.length; i++) {
            uint256 cardNumber = cardNumbers[i];
            require(cardNumber > 0 && cardNumber <= collection.cardCount, "Invalid card number");

            // Call mintCard function on NFTCollection contract
            nftCollection.mintCard(to, collectionId, cardNumber, imgs[i]);
        }
    }
}



// contract Main is Ownable {
//     struct CollectionInfo {
//         string name;
//         uint cardCount;
//         uint mintedCount;
//     }

//     mapping(uint => CollectionInfo) public collections;
//     uint public collectionCount = 0;
//     NFTCollection public nftContract;

//     event CardMinted(uint collectionId, address to, uint cardNumber, string tokenURI);

//     constructor(address _owner) Ownable(msg.sender) {
//         require(_owner != address(0), "Owner address cannot be zero");
//         transferOwnership(_owner);
//         nftContract = NFTCollection(msg.sender);
//     }


//     // // Add the override specifier here
//     // function transferOwnership(address newOwner) public override onlyOwner {
//     //     require(newOwner != address(0), "New owner is the zero address");
//     //     _transferOwnership(newOwner);
//     // }

//     function createCollection(string calldata name, uint cardCount) external onlyOwner {
//         collections[collectionCount] = CollectionInfo({
//             name: name,
//             cardCount: cardCount,
//             mintedCount: 0
//         });
//         collectionCount++;
//     }

//     function mintCardsToUser(
//         uint collectionId,
//         address to,
//         uint[] calldata cardNumbers,
//         string[] calldata tokenURIs
//     ) external onlyOwner {
//         require(collectionId < collectionCount, "Collection does not exist");
//         require(cardNumbers.length == tokenURIs.length, "Mismatched inputs");

//         CollectionInfo storage collection = collections[collectionId];

//         for (uint i = 0; i < cardNumbers.length; i++) {
//             uint cardNumber = cardNumbers[i];
//             require(cardNumber >= 1 && cardNumber <= collection.cardCount, "Invalid card number");

//             nftContract.mintCard(to, collectionId, cardNumber, tokenURIs[i]);

//             collection.mintedCount++;
            
//             // Emit the event for off-chain tracking
//             emit CardMinted(collectionId, to, cardNumber, tokenURIs[i]);
//         }
//     }
// }