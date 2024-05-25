// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./MediCoin.sol";
import "./PatientNFT.sol";

contract Health_Contract is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    PatientNFT public patientNFT;
    MediCoin public healthToken;

    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;

    error UnauthorizedDoctor(address caller);
    error UnexpectedRequestID(bytes32 requestId);
    error PatientNotFound(address patient);
    error InvalidReferral(address referrer);

    event Response(bytes32 indexed requestId, bytes response, bytes err);
    event HealthScoreUpdated(uint256 tokenId, uint256 healthScore, uint256 tokensEarned);
    event RequestInitiated(address doctor, uint256 tokenId, uint256 timestamp);
    event ReferralRegistered(address referrer, address referee);
    event TestsSelected(address patient, uint8[] selectedTests);
    event TestsCleared(address patient);

    mapping(bytes32 => uint256) private requestIdToTokenId;
    mapping(bytes32 => address) private requestIdToPatient;
    mapping(address => bool) public authorizedDoctors;
    mapping(address => address) public referrals;
    mapping(address => uint8[10]) public patientTests; // Assuming we have 10 tests

    uint256 public referralReward = 100 * 10 ** 18; // Example referral reward in tokens

    constructor(
        address router,
        address _patientNFT,
        address _healthToken
    ) FunctionsClient(router) ConfirmedOwner(msg.sender) {
        patientNFT = PatientNFT(_patientNFT);
        healthToken = MediCoin(_healthToken);
    }

    // Modifier to check if the caller is an authorized doctor
    modifier onlyAuthorizedDoctor() {
        if (!authorizedDoctors[msg.sender]) {
            revert UnauthorizedDoctor(msg.sender);
        }
        _;
    }

    // Function to authorize a new doctor
    function authorizeDoctor(address doctor) external onlyOwner {
        authorizedDoctors[doctor] = true;
    }

    // Function to revoke doctor's authorization
    function revokeDoctor(address doctor) external onlyOwner {
        authorizedDoctors[doctor] = false;
    }

    // Function to register a referral
    function registerReferral(address referrer) external {
        if (referrer == msg.sender) {
            revert InvalidReferral(referrer);
        }
        referrals[msg.sender] = referrer;
        emit ReferralRegistered(referrer, msg.sender);
    }

    // Function for a patient to select and submit tests
    function selectTests(uint8[] calldata selectedTests) external {
        require(selectedTests.length <= 10, "Too many tests selected");
        
        uint8[10] storage tests = patientTests[msg.sender];
        for (uint8 i = 0; i < 10; i++) {
            tests[i] = 0; // Reset all tests
        }
        for (uint8 i = 0; i < selectedTests.length; i++) {
            require(selectedTests[i] < 10, "Invalid test index");
            tests[selectedTests[i]] = 1; // Mark selected tests
        }

        emit TestsSelected(msg.sender, selectedTests);
    }

    // Function to update patient health score
    function updatePatientHealthScore(
        string memory source,
        bytes memory encryptedSecretsUrls,
        uint8 donHostedSecretsSlotID,
        uint64 donHostedSecretsVersion,
        uint64 subscriptionId,
        uint32 gasLimit,
        bytes32 donID,
        address patient,
        uint256 amountPaid
    ) external onlyAuthorizedDoctor {
        uint256 tokenId = patientNFT.getTokenIdByPatient(patient);
        string memory uri = "";

        // Check if the patient already has an NFT
        if (tokenId != 0) {
            uri = patientNFT.tokenURI(tokenId);
        }

        // Fetch the balance of health tokens for the patient
        uint256 tokenBalance = healthToken.balanceOf(patient);

        // Log the transaction details
        emit RequestInitiated(msg.sender, tokenId, block.timestamp);

        // Initialize and send the request
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        if (encryptedSecretsUrls.length > 0) {
            req.addSecretsReference(encryptedSecretsUrls);
        } else if (donHostedSecretsVersion > 0) {
            req.addDONHostedSecrets(donHostedSecretsSlotID, donHostedSecretsVersion);
        }

        // Set arguments for the request
        string[] memory args = new string[](4);
        args[0] = uri;
        args[1] = toAsciiString(patient);
        args[2] = uintToString(amountPaid);
        args[3] = uintToString(tokenBalance);

        req.setArgs(args);

        s_lastRequestId = _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit, donID);

        // Map the request ID to the token ID and patient address
        requestIdToTokenId[s_lastRequestId] = tokenId;
        requestIdToPatient[s_lastRequestId] = patient;
    }

    /**
     * @dev Internal function to process the outcome of a data request. It stores the latest response or error and updates the contract state accordingly. This function is designed to handle only one of `response` or `err` at a time, not both. It decodes the response if present and emits events to log both raw and decoded data.
     *
     * @param requestId The unique identifier of the request, originally returned by `sendRequest`. Used to match responses with requests.
     * @param response The raw aggregated response data from the external source. This data is ABI-encoded and is expected to contain specific information (e.g., healthScore, tokensEarned, newUri) if no error occurred. The function attempts to decode this data if `response` is not empty.
     * @param err The raw aggregated error information, indicating an issue either from the user's code or within the execution of the user Chainlink Function.
     *
     * Emits a `DecodedResponse` event if the `response` is successfully decoded, providing detailed information about the data received.
     * Emits a `Response` event for every call to log the raw response and error data.
     *
     * Requirements:
     * - The `requestId` must match the last stored request ID to ensure the response corresponds to the latest request sent.
     * - Only one of `response` or `err` should contain data for a given call; the other should be empty.
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId);
        }

        s_lastError = err;
        s_lastResponse = response;

        if (response.length > 0) {
            (uint256 healthScore, uint256 tokensEarned, string memory newUri) = abi.decode(response, (uint256, uint256, string));

            uint256 tokenId = requestIdToTokenId[requestId];
            address patient = requestIdToPatient[requestId];

            // If the patient doesn't have an NFT, mint one with the provided URI
            if (tokenId == 0) {
                patientNFT.safeMint(patient, newUri);
                tokenId = patientNFT.getTokenIdByPatient(patient);
            } else {
                // Update the existing NFT with the new URI
                patientNFT.setTokenURI(tokenId, newUri);
            }

            healthToken.mint(patient, tokensEarned);

            // Handle referral reward
            address referrer = referrals[patient];
            if (referrer != address(0)) {
                healthToken.mint(referrer, referralReward);
                healthToken.mint(patient, referralReward);
            }

            // Clear the test selections for the patient
            delete patientTests[patient];
            emit TestsCleared(patient);

            emit HealthScoreUpdated(tokenId, healthScore, tokensEarned);
        }

        emit Response(requestId, response, err);
    }

    // Helper function to convert uint256 to string
    function uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // Helper function to convert address to string
    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint256 i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint256(uint160(x)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
}
