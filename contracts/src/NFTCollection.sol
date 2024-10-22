// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTCollection is ERC721 {
    struct CardInfo {
        uint256 collectionId;
        uint256 cardNumber;
        string img;
    }

    mapping(uint256 => CardInfo) public cardInfos;
    uint256 private _currentTokenId;
    address public owner;
    address public mainContractAddress;

    event CardMinted(uint256 indexed tokenId, uint256 indexed collectionId, uint256 cardNumber, address indexed to);

    constructor() ERC721("MyNFTCollection", "MNFT") {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    function setMainContractAddress(address _mainContractAddress) external onlyOwner {
        require(_mainContractAddress != address(0), "Invalid Main contract address");
        mainContractAddress = _mainContractAddress;
    }

    function mintCard(
        address to,
        uint256 collectionId,
        uint256 cardNumber,
        string memory img
    ) external {
        require(msg.sender == mainContractAddress, "Only Main contract can mint cards");

        _currentTokenId++;
        uint256 tokenId = _currentTokenId;

        _safeMint(to, tokenId);

        cardInfos[tokenId] = CardInfo({
            collectionId: collectionId,
            cardNumber: cardNumber,
            img: img
        });

        emit CardMinted(tokenId, collectionId, cardNumber, to);
    }

    // Surcharge de tokenURI pour retourner les métadonnées correctes
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        CardInfo memory card = cardInfos[tokenId];
        return card.img;
    }
}

// contract NFTCollection is ERC721, Ownable {
//     struct CardInfo {
//         uint collectionId;
//         uint cardNumber;
//         string tokenURI;
//     }

//     // Mapping de tokenId vers les informations de la carte
//     mapping(uint => CardInfo) public cardInfos;

//     // Compteur pour les tokenIds
//     uint private _currentTokenId = 0;

//   constructor(address ownerAddress) ERC721("MyNFTCollection", "MNFT") Ownable(ownerAddress) {}
//     // Fonction pour frapper une carte
//     function mintCard(
//         address to,
//         uint collectionId,
//         uint cardNumber,
//         string memory tokenURI
//     ) external onlyOwner returns (uint) {
//         _currentTokenId++;
//         uint newTokenId = _currentTokenId;

//         // Frappe le NFT
//         _safeMint(to, newTokenId);

//         // Stocke les informations de la carte
//         cardInfos[newTokenId] = CardInfo({
//             collectionId: collectionId,
//             cardNumber: cardNumber,
//             tokenURI: tokenURI
//         });

//         return newTokenId;
//     }

//     // Surcharge de la fonction tokenURI pour retourner l'URI correcte
//     // function tokenURI(uint tokenId) public view override returns (string memory) {
//     //     require(_exists(tokenId), "Token does not exist");
//     //     return cardInfos[tokenId].tokenURI;
//     // }
// }