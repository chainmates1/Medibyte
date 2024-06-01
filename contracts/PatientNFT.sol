// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract PatientNFT is ERC721, ERC721URIStorage, Ownable, AccessControl {
    uint256 private _currentTokenId=1;
    mapping(address => uint256) private _patientToTokenId; // Map patient address to tokenId
    mapping(uint256 => address) private _tokenIdToPatient; // Map tokenId to patient address
    mapping(uint256 => uint256) public tokenIdToHealthScore; // Map tokenId to health score

    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");
    bytes32 public constant HEALTH_CONTRACT_ROLE = keccak256("HEALTH_CONTRACT_ROLE");

    constructor() ERC721("PatientNFT", "PNFT") Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); 
        _grantRole(DOCTOR_ROLE, msg.sender);       
    }

    // Custom modifier to allow either doctors or health contracts
    modifier onlyDoctorOrHealthContract() {
        require(
            hasRole(DOCTOR_ROLE, msg.sender) || hasRole(HEALTH_CONTRACT_ROLE, msg.sender),
            "Caller is not a doctor or health contract"
        );
        _;
    }
    function _exists(uint256 tokenId) internal view virtual  returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    function safeMint(address to, string memory uri) external onlyRole(HEALTH_CONTRACT_ROLE)returns (uint256) {
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

    // Multiple modifiers applied to this function
    function setTokenURI(uint256 tokenId, string memory newURI) public onlyDoctorOrHealthContract {
        require(_exists(tokenId), "ERC721URIStorage: URI set of nonexistent token");
        _setTokenURI(tokenId, newURI);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Functions to grant and revoke roles
    function addDoctor(address doctor) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(DOCTOR_ROLE, doctor);
    }

    function removeDoctor(address doctor) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(DOCTOR_ROLE, doctor);
    }

    function addHealthContract(address healthContract) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(HEALTH_CONTRACT_ROLE, healthContract);
    }

    function removeHealthContract(address healthContract) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(HEALTH_CONTRACT_ROLE, healthContract);
    }
}
