// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Collection.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Booster.sol";
contract Main is Ownable {

    struct UserCard {
        uint tokenId;
        string collectionId;
        uint cardNumber;
        string tokenURI;
    }

    mapping(string => Collection) public collections;
    string[] public collectionIds; 
    uint public collectionCount = 0;

    constructor(address _owner) Ownable() {
        require(_owner != address(0), "Owner address cannot be zero");
        transferOwnership(_owner);
    }

    function createCollection(string calldata name, uint cardCount) external onlyOwner {
        Collection newCollection = new Collection(name, cardCount);
        collections[name] = newCollection;
        collectionIds.push(name); 
        collectionCount++;
    }

    function mintCardsToUser(
        string calldata collectionId,
        address to,
        uint[] calldata cardNumbers,
        string[] calldata tokenURIs
    ) external onlyOwner {
        require(cardNumbers.length == tokenURIs.length, "Mismatched inputs");
        Collection collection = collections[collectionId];
        require(address(collection) != address(0), "Collection does not exist");
        for (uint i = 0; i < cardNumbers.length; i++) {
            uint cardNumber = cardNumbers[i];
            string memory tokenURI = tokenURIs[i];
            collection.mintCard(to, cardNumber, tokenURI);
        }
    }

    // Fonction pour obtenir les cartes d'un utilisateur depuis toutes les collections
    function getCardsOfUser(address owner) external view returns (UserCard[] memory) {
        uint totalCards = 0;
        for (uint i = 0; i < collectionIds.length; i++) {
            Collection collection = collections[collectionIds[i]];
            uint[] memory userCardsInCollection = collection.getCardsOfOwner(owner);
            totalCards += userCardsInCollection.length;
        }
        UserCard[] memory userCards = new UserCard[](totalCards);
        uint currentIndex = 0;
        for (uint i = 0; i < collectionIds.length; i++) {
            string memory collectionId = collectionIds[i];
            Collection collection = collections[collectionId];
            uint[] memory userCardsInCollection = collection.getCardsOfOwner(owner);

            for (uint j = 0; j < userCardsInCollection.length; j++) {
                uint tokenId = userCardsInCollection[j];
                Collection.CardInfo memory cardInfo = collection.getCardInfo(tokenId);

                userCards[currentIndex] = UserCard({
                    tokenId: tokenId,
                    collectionId: collectionId,
                    cardNumber: cardInfo.cardNumber,
                    tokenURI: cardInfo.tokenURI
                });
                currentIndex++;
            }
        }

        return userCards;
    }

    // Fonction pour obtenir la liste de tous les utilisateurs à travers toutes les collections
    // Fonction pour obtenir la liste de tous les utilisateurs à travers toutes les collections
function getAllUsers() external view returns (address[] memory) {
    address[] memory tempUsers = new address[](5); // Créer un tableau temporaire avec une taille définie
    uint tempUsersCount = 0;

    // Boucler sur toutes les collections
    for (uint i = 0; i < collectionIds.length; i++) {
        Collection collection = collections[collectionIds[i]];
        address[] memory usersInCollection = collection.getAllOwners();

        // Boucler sur tous les utilisateurs de chaque collection
        for (uint j = 0; j < usersInCollection.length; j++) {
            address user = usersInCollection[j];
            bool userExists = false;

            // Vérifier si l'utilisateur est déjà dans le tableau temporaire
            for (uint k = 0; k < tempUsersCount; k++) {
                if (tempUsers[k] == user) { // Vérification de doublons
                    userExists = true;
                    break;
                }
            }

            // Si l'utilisateur n'existe pas encore, l'ajouter au tableau temporaire
            if (!userExists) {
                tempUsers[tempUsersCount] = user;
                tempUsersCount++;
            }
        }
    }

    // Créer un tableau pour stocker les utilisateurs sans doublons
    address[] memory allUsers = new address[](tempUsersCount);
    for (uint i = 0; i < tempUsersCount; i++) {
        allUsers[i] = tempUsers[i];
    }

    return allUsers;
}

    function collectionExists(string memory name) public view returns (bool) {
        return address(collections[name]) != address(0);
    }

    function createBooster(address to ) external onlyOwner {
        Booster newBooster = new Booster();
        newBooster.createBooster(to);
    }
    
}
