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

    struct UserCard {
        uint tokenId;
        string collectionId;
        uint cardNumber;
        string tokenURI;
    }

    mapping(string => CollectionInfo) public collections;
    uint public collectionCount = 0;

    mapping(uint => uint[]) public collectionCards;

    NFTCollection public nftContract;

    event CardMinted(string collectionId, address to, uint cardNumber, string tokenURI);

    constructor(address _owner, address nftCollectionAddress) Ownable() {
        require(_owner != address(0), "Owner address cannot be zero");
        require(nftCollectionAddress != address(0), "NFT Collection address cannot be zero");
        transferOwnership(_owner);
        nftContract = NFTCollection(nftCollectionAddress);
    }

    function createCollection(string calldata name, uint cardCount) external onlyOwner {
        collections[name] = CollectionInfo({
            name: name,
            cardCount: cardCount,
            mintedCount: 0
        });
        collectionCount++;
    }

    function mintCardsToUser(
        string calldata collectionId,
        address to,
        uint[] calldata cardNumbers,
        string[] calldata tokenURIs
    ) external onlyOwner {
        require(cardNumbers.length == tokenURIs.length, "Mismatched inputs");
        for (uint i = 0; i < cardNumbers.length; i++) {
            uint cardNumber = cardNumbers[i];
            nftContract.mintCard(to, collectionId, cardNumber, tokenURIs[i]);
            emit CardMinted(collectionId, to, cardNumber, tokenURIs[i]);
        }
    }

    // Fonction pour obtenir les cartes d'un utilisateur
    function getCardsOfUser(address owner) external view returns (UserCard[] memory) {
        uint[] memory tokenIds = nftContract.getCardsOfOwner(owner);
        uint length = tokenIds.length;
        UserCard[] memory userCards = new UserCard[](length);

        for (uint i = 0; i < length; i++) {
            uint tokenId = tokenIds[i];
            NFTCollection.CardInfo memory cardInfo = nftContract.getCardInfo(tokenId);

            userCards[i] = UserCard({
                tokenId: tokenId,
                collectionId: cardInfo.collectionId,
                cardNumber: cardInfo.cardNumber,
                tokenURI: cardInfo.tokenURI
            });
        }
        return userCards;
    }

    // Fonction pour obtenir la liste de tous les utilisateurs
    function getAllUsers() external view returns (address[] memory) {
        return nftContract.getAllOwners();
    }

function collectionExists(string memory name) public view returns (bool) {
    for (uint i = 0; i < collectionCount; i++) {
        if (keccak256(abi.encodePacked(collections[name].name)) == keccak256(abi.encodePacked(name))) {
            return true;
        }
    }
    return false;
}

}
