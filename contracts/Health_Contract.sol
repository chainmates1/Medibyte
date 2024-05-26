// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./MediCoin.sol";
import "./PatientNFT.sol";
import "./HealthInsuranceNFT.sol";
import "./FreeHealthKitNFT.sol";
import "./FreeHealthCheckupNFT.sol";

contract Health_Contract is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;
    using Strings for uint256;
    using Strings for address;

    PatientNFT public patientNFT;
    MediCoin public healthToken;
    HealthInsuranceNFT public healthInsuranceNFT;
    FreeHealthKitNFT public freeHealthKitNFT;
    FreeHealthCheckupNFT public freeHealthCheckupNFT;

    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;

    error UnauthorizedDoctor(address caller);
    error UnexpectedRequestID(bytes32 requestId);
    error PatientNotFound(address patient);
    error InvalidReferral(address referrer);
    error InsufficientBalance(uint256 required, uint256 available);

    event Response(bytes32 indexed requestId, bytes response, bytes err);
    event HealthScoreUpdated(uint256 tokenId, uint256 healthScore, uint256 tokensEarned);
    event RequestInitiated(address doctor, uint256 tokenId, uint256 timestamp);
    event ReferralRegistered(address referrer, address referee);
    event TestsSelected(address indexed patient, uint8[] selectedTests); // Added indexed modifier for patient address
    event TestsCleared(address patient);
    event RewardClaimed(address patient, address rewardContract, uint256 tokenId);

    mapping(bytes32 => uint256) private requestIdToTokenId;
    mapping(bytes32 => address) private requestIdToPatient;
    mapping(address => bool) public authorizedDoctors;
    mapping(address => address) public referrals;
    mapping(address => uint8[10]) public patientTests; // Assuming we have 10 tests

    mapping(address => uint256) public rewardThresholds;
    mapping(address => bool) public patientsWithTestsSelected; // Tracks patients who have selected tests

    uint256 public referralReward = 100 * 10 ** 18; // Example referral reward in tokens

    constructor(
        address router,
        address _patientNFT,
        address _healthToken,
        address _healthInsuranceNFT,
        address _freeHealthKitNFT,
        address _freeHealthCheckupNFT
    ) FunctionsClient(router) ConfirmedOwner(msg.sender) {
        patientNFT = PatientNFT(_patientNFT);
        healthToken = MediCoin(_healthToken);
        healthInsuranceNFT = HealthInsuranceNFT(_healthInsuranceNFT);
        freeHealthKitNFT = FreeHealthKitNFT(_freeHealthKitNFT);
        freeHealthCheckupNFT = FreeHealthCheckupNFT(_freeHealthCheckupNFT);
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

        patientsWithTestsSelected[msg.sender] = true; // Mark that this patient has selected tests

        emit TestsSelected(msg.sender, selectedTests); // Emit event with patient's address
    }

    // Function to set reward thresholds
    function setRewardThreshold(address rewardContract, uint256 threshold) external onlyOwner {
        rewardThresholds[rewardContract] = threshold;
    }

    // Function to claim reward NFT
    function claimReward(address rewardContract) external {
        uint256 threshold = rewardThresholds[rewardContract];
        require(threshold > 0, "Reward not available");

        uint256 patientBalance = healthToken.balanceOf(msg.sender);
        if (patientBalance < threshold) {
            revert InsufficientBalance(threshold, patientBalance);
        }

        healthToken.transferFrom(msg.sender, owner(), threshold);

        uint256 tokenId;
        if (rewardContract == address(healthInsuranceNFT)) {
            tokenId = healthInsuranceNFT.mint(msg.sender);
        } else if (rewardContract == address(freeHealthKitNFT)) {
            tokenId = freeHealthKitNFT.mint(msg.sender);
        } else if (rewardContract == address(freeHealthCheckupNFT)) {
            tokenId = freeHealthCheckupNFT.mint(msg.sender);
        } else {
            revert("Invalid reward contract");
        }

        emit RewardClaimed(msg.sender, rewardContract, tokenId);
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
        require(patientsWithTestsSelected[patient], "No tests selected by patient"); // Ensure patient has selected tests
        
        uint256 tokenId = patientNFT.getTokenIdByPatient(patient);
        string memory uri = "";

        if (tokenId != 0) {
            uri = patientNFT.tokenURI(tokenId);
        }

        uint256 tokenBalance = healthToken.balanceOf(patient);

        emit RequestInitiated(msg.sender, tokenId, block.timestamp);

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        if (encryptedSecretsUrls.length > 0) {
            req.addSecretsReference(encryptedSecretsUrls);
        } else if (donHostedSecretsVersion > 0) {
            req.addDONHostedSecrets(donHostedSecretsSlotID, donHostedSecretsVersion);
        }

        string[] memory args = new string[](4);
        args[0] = uri;
        args[1] = patient.toHexString();
        args[2] = amountPaid.toString();
        args[3] = tokenBalance.toString();

        req.setArgs(args);

        s_lastRequestId = _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit, donID);

        requestIdToTokenId[s_lastRequestId] = tokenId;
        requestIdToPatient[s_lastRequestId] = patient;
    }

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

            if (tokenId == 0) {
                patientNFT.safeMint(patient, newUri);
                tokenId = patientNFT.getTokenIdByPatient(patient);
            } else {
                patientNFT.setTokenURI(tokenId, newUri);
            }

            healthToken.mint(patient, tokensEarned);

            emit HealthScoreUpdated(tokenId, healthScore, tokensEarned);
        }

        emit Response(requestId, response, err);

        delete patientTests[requestIdToPatient[requestId]];
        patientsWithTestsSelected[requestIdToPatient[requestId]] = false; // Clear the flag indicating tests selected
        emit TestsCleared(requestIdToPatient[requestId]);
    }
}
