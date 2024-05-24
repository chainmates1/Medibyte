// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PatientNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _currentTokenId;
    mapping(address => uint256) private _patientToTokenId; // Map patient address to tokenId
    mapping(uint256 => address) private _tokenIdToPatient; // Map tokenId to patient address
    mapping(uint256 => uint256) public tokenIdToHealthScore; // Map tokenId to health score

    constructor() ERC721("PatientNFT", "PNFT") Ownable(msg.sender) {}

    function _exists(uint256 tokenId) internal view virtual  returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    function safeMint(address to, string memory uri) external onlyOwner returns (uint256) {
        require(_patientToTokenId[to] == 0, "Patient already has an NFT");

        uint256 tokenId = _currentTokenId;
        _currentTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        _patientToTokenId[to] = tokenId;
        _tokenIdToPatient[tokenId] = to;

        return tokenId;
    }

    function getTokenIdByPatient(address patient) external view returns (uint256) {
        return _patientToTokenId[patient];
    }

    function getPatientByTokenId(uint256 tokenId) external view returns (address) {
        return _tokenIdToPatient[tokenId];
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
