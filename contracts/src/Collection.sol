// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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

    // Compteur pour les tokenIds
    uint private _currentTokenId = 0;

    constructor() ERC721("MyNFTCollection", "MNFT") {}

    // Fonction pour frapper une carte
    function mintCard(
        address to,
        uint collectionId,
        uint cardNumber,
        string memory tokenURI
    ) external onlyOwner returns (uint) {
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

        return newTokenId;
    }

    // Surcharge de la fonction tokenURI pour retourner l'URI correcte
    function tokenURI(uint tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return cardInfos[tokenId].tokenURI;
    }
}
