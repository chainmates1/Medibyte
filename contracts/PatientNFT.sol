// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PatientNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _currentTokenId;
    
    constructor() ERC721("PatientNFT", "PNFT") Ownable(msg.sender){}     
    function safeMint(address to, string memory uri)
        external
        onlyOwner
    {
        uint256 tokenId = _currentTokenId;
        _currentTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function setTokenURI(uint256 tokenId, string memory newURI) public onlyOwner {
        require(_exists(tokenId), "ERC721URIStorage: URI set of nonexistent token");
        _setTokenURI(tokenId, newURI);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}
