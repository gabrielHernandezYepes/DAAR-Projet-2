// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTCollection is ERC721, Ownable {
    struct CardInfo {
        uint collectionId;
        uint cardNumber;
        string tokenURI;
    }

    // Mapping de tokenId vers les informations de la carte
    mapping(uint => CardInfo) public cardInfos;

    // Mapping de tokenId vers l'owner
    mapping(uint => address) public cardToOwner;

    // Mapping de owner vers la liste des cartes qu'il possède
    mapping(address => uint[]) public ownerToCards;

    // Compteur pour les tokenIds
    uint private _currentTokenId = 0;

    constructor(address ownerAddress) ERC721("MyNFTCollection", "MNFT") {
        transferOwnership(ownerAddress); // Utilisez transferOwnership pour définir le propriétaire
    }

    // Fonction pour frapper une carte
    function mintCard(
        address to,
        uint collectionId,
        uint cardNumber,
        string memory tokenURI
    ) public onlyOwner returns (uint) {
        require(!isMinted(collectionId, cardNumber), "Card already minted");

        _currentTokenId++;
        uint newTokenId = _currentTokenId;

        // Frappe le NFT
        _safeMint(to, newTokenId);

        // Stocke les informations de la carte
        cardInfos[newTokenId] = CardInfo({
            collectionId: collectionId,
            cardNumber: cardNumber,
            tokenURI: tokenURI
        });

        // Mettre à jour les mappings pour suivre l'owner de la carte
        cardToOwner[newTokenId] = to;
        ownerToCards[to].push(newTokenId);

        return newTokenId;
    }

    // Fonction pour vérifier si une carte est déjà mintée ou non
    function isMinted(uint collectionId, uint cardNumber) public view returns (bool) {
        for (uint i = 1; i <= _currentTokenId; i++) {
            if (cardInfos[i].collectionId == collectionId && cardInfos[i].cardNumber == cardNumber) {
                return true;
            }
        }
        return false;
    }

    // Fonction pour récupérer toutes les cartes associées à un owner
    function getCardsOfOwner(address owner) public view returns (uint[] memory) {
        return ownerToCards[owner];
    }
}
