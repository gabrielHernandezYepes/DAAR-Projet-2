// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Collection is ERC721, Ownable {
    struct CardInfo {
        uint cardNumber;
        string tokenURI;
    }

    // Mapping de tokenId vers les informations de la carte
    mapping(uint => CardInfo) public cardInfos;

    // Mapping de owner vers la liste des cartes qu'il possède
    mapping(address => uint[]) public ownerToCards;

    // Liste de tous les propriétaires
    address[] private allOwners;
    mapping(address => bool) private ownerExists;

    // Compteur pour les tokenIds
    uint private _currentTokenId = 0;

    event OwnerAdded(address indexed owner);
    string public collectionName;
    uint256 public cardCount;

    constructor(string memory name, uint _cardCount) ERC721(name, "MNFT") {
        collectionName = name;
        cardCount = _cardCount;
    }

    // Fonction pour frapper une carte
    function mintCard(
        address to,
        uint cardNumber,
        string memory tokenURI
    ) public onlyOwner returns (uint) {
        _currentTokenId++;
        uint newTokenId = _currentTokenId;

        // Frappe le NFT
        _safeMint(to, newTokenId);

        // Stocke les informations de la carte
        cardInfos[newTokenId] = CardInfo({
            cardNumber: cardNumber,
            tokenURI: tokenURI
        });

        // Mettre à jour les mappings pour suivre l'owner de la carte
        ownerToCards[to].push(newTokenId);

        // Si le propriétaire est nouveau, l'ajouter à la liste
        if (!ownerExists[to]) {
            ownerExists[to] = true;
            allOwners.push(to);
            emit OwnerAdded(to);
        }

        return newTokenId;
    }

    // Fonction pour récupérer les informations d'une carte
    function getCardInfo(uint tokenId) external view returns (CardInfo memory) {
        return cardInfos[tokenId];
    }

    // Fonction pour récupérer toutes les cartes associées à un owner
    function getCardsOfOwner(address owner) external view returns (uint[] memory) {
        return ownerToCards[owner];
    }

    // Fonction pour récupérer tous les propriétaires
    function getAllOwners() external view returns (address[] memory) {
        return allOwners;
    }
}
