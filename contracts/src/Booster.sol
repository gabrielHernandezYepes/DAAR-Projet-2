// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Collection.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Main.sol";

contract Booster is ERC721URIStorage, Ownable {
    struct BoosterInfo {
        string collectionId;
        uint[] cardNumbers; // Contient les numéros de cartes
        string[] tokenURIs; // Contient les URI des cartes

    }

    uint[] public allBoosterIds;
    uint public boosterCount = 0;
    mapping(uint => BoosterInfo) public boosters;

    constructor() ERC721("Booster", "BOOST") {}

    // Créer un booster avec 3 cartes
    function createBooster(string calldata collectionId, uint[] calldata cardNumbers, string[] calldata tokenURIs, address to) external onlyOwner {
        require(cardNumbers.length == 3 && tokenURIs.length == 3, "Booster must contain 3 cards");

        boosterCount++;
        uint boosterId = boosterCount;

        boosters[boosterId] = BoosterInfo({
            collectionId: collectionId,
            cardNumbers: cardNumbers,
            tokenURIs: tokenURIs

        });
        allBoosterIds.push(boosterId);

        _mint(to, boosterId);
    }

    // Fonction pour ouvrir un booster et mint les cartes au compte donné
    function openBooster(uint boosterId, address to) external onlyOwner {
        require(_exists(boosterId), "Booster does not exist");

        // Récupérer les informations du booster
        BoosterInfo memory booster = boosters[boosterId];

        // Mint les cartes dans le booster
        for (uint i = 0; i < booster.cardNumbers.length; i++) {
            _mintCard(to, booster.cardNumbers[i], booster.tokenURIs[i]);
        }

        // Brûler (burn) le booster une fois ouvert
        _burn(boosterId);
    }

// Fonction privée pour mint une carte à partir d'un booster
    function _mintCard(address to, uint cardNumber, string memory tokenURI) private {
        uint tokenId = uint(keccak256(abi.encodePacked(cardNumber, tokenURI, to)));
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);  // Assurez-vous d'utiliser ERC721URIStorage pour avoir cette fonction
    }

    // Fonction pour obtenir tous les IDs des boosters créés
    function getAllBoosterIds() public view returns (uint[] memory) {
        return allBoosterIds;
    }
    
}
