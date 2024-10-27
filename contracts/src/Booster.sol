// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Collection.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Main.sol";

contract Booster is ERC721URIStorage, Ownable {
    uint public boosterCount = 0;

    constructor() ERC721("Booster", "BOOST") {}
    
    function createBooster(address to) external onlyOwner {
        boosterCount++;
        _mint(to, boosterCount);
    }
}
