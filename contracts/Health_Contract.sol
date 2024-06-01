// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./MediCoin.sol";
import "./PatientNFT.sol";
import "./HealthInsuranceNFT.sol";
import "./FreeHealthKitNFT.sol";
import "./FreeHealthCheckupNFT.sol";

struct Log {
    uint256 index; // Index of the log in the block
    uint256 timestamp; // Timestamp of the block containing the log
    bytes32 txHash; // Hash of the transaction containing the log
    uint256 blockNumber; // Number of the block containing the log
    bytes32 blockHash; // Hash of the block containing the log
    address source; // Address of the contract that emitted the log
    bytes32[] topics; // Indexed topics of the log
    bytes data; // Data of the log
}

interface ILogAutomation {
    function checkLog(
        Log calldata log,
        bytes memory checkData
    ) external returns (bool upkeepNeeded, bytes memory performData);

    function performUpkeep(bytes calldata performData) external;
}

interface IHealth_Contract {
    function selectTests(address _patient, uint8[] calldata selectedTests, uint256 _amount) external;
}

contract Health_Contract is IHealth_Contract, FunctionsClient, ConfirmedOwner, ILogAutomation {
    using FunctionsRequest for FunctionsRequest.Request;
    using Strings for uint256;
    using Strings for address;
    using SafeERC20 for IERC20;

    PatientNFT public patientNFT;
    MediCoin public healthToken;
    IERC20 private immutable i_usdcToken;
    HealthInsuranceNFT public healthInsuranceNFT;
    FreeHealthKitNFT public freeHealthKitNFT;
    FreeHealthCheckupNFT public freeHealthCheckupNFT;

    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;

    error UnauthorizedDoctor(address caller);
    error UnexpectedRequestID(bytes32 requestId);
    error PatientNotFound(address patient);
    error InvalidUsdcToken(); 
    error InsufficientBalance(uint256 required, uint256 available);

    event Response(bytes32 indexed requestId, bytes response, bytes err);
    event HealthScoreUpdated(uint256 tokenId, uint256 healthScore, uint256 tokensEarned);
    event RequestInitiated(address doctor, uint256 tokenId, uint256 timestamp);
    event TestsSelected(address patient, uint8[] selectedTests);
    event TestsCleared(address patient);
    event RewardClaimed(address patient, address rewardContract, uint256 tokenId);
    event UpkeepPerformed(bytes32 indexed requestId, bytes response, bytes err);

    mapping(bytes32 => uint256) private requestIdToTokenId;
    mapping(bytes32 => address) private requestIdToPatient;
    mapping(address => bool) public authorizedDoctors;
    mapping(address => uint8[6]) public patientTests;
    mapping(address => uint256) public rewardThresholds;

    constructor(
        address router,
        address _patientNFT,
        address _healthToken,
        address _healthInsuranceNFT,
        address _freeHealthKitNFT,
        address _freeHealthCheckupNFT,
        address _usdcToken
    ) FunctionsClient(router) ConfirmedOwner(msg.sender) {
        patientNFT = PatientNFT(_patientNFT);
        healthToken = MediCoin(_healthToken);
        healthInsuranceNFT = HealthInsuranceNFT(_healthInsuranceNFT);
        freeHealthKitNFT = FreeHealthKitNFT(_freeHealthKitNFT);
        freeHealthCheckupNFT = FreeHealthCheckupNFT(_freeHealthCheckupNFT);
        if (_usdcToken == address(0)) revert InvalidUsdcToken();
        i_usdcToken = IERC20(_usdcToken);
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

    // Function for a patient to select and submit tests
    function selectTests(address _patient, uint8[] calldata selectedTests, uint256 _amount) external {
        require(selectedTests.length <= 6, "Too many tests selected");
        i_usdcToken.transferFrom(msg.sender, address(this), _amount);
        uint8[6] storage tests = patientTests[_patient];
        for (uint8 i = 0; i < 6; i++) {
            tests[i] = 0; // Reset all tests
        }
        for (uint8 i = 0; i < selectedTests.length; i++) {
            require(selectedTests[i] < 6, "Invalid test index");
            tests[selectedTests[i]] = 1; // Mark selected tests
        }

        emit TestsSelected(_patient, selectedTests);
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
        args[1] = Strings.toHexString(patient);
        args[2] = Strings.toString(amountPaid);
        args[3] = Strings.toString(tokenBalance);

        req.setArgs(args);

        s_lastRequestId = _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit, donID);

        // Map the request ID to the token ID and patient address
        requestIdToTokenId[s_lastRequestId] = tokenId;
        requestIdToPatient[s_lastRequestId] = patient;
    }

    // Fulfill request and log event for automation
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

        emit Response(requestId, response, err);
    }

    //Funtion Automation :

    function checkLog(
        Log calldata log,
        bytes memory
    ) external pure returns (bool upkeepNeeded, bytes memory performData) {
        upkeepNeeded = true;
        bytes32 requestId=log.topics[1];
        (bytes memory response,bytes memory err) = abi.decode(log.data, (bytes, bytes));
        performData = abi.encode(requestId, response, err);
    }

    // Function to be called by Chainlink Automation
    function performUpkeep(bytes calldata performData) external {
        (bytes32 requestId, bytes memory response,bytes memory err) = abi.decode(performData, (bytes32, bytes,bytes));
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

        //Transfer healthTokens to Patient Address
        healthToken.mint(patient, tokensEarned);

        //Send the USDC tokens to Doctor(Owner) 
        uint256 USDBalance=i_usdcToken.balanceOf(address(this));
        i_usdcToken.transfer(owner(), USDBalance);

        delete patientTests[patient];
        emit UpkeepPerformed(requestId,response,err);
        emit TestsCleared(patient);
        emit HealthScoreUpdated(tokenId, healthScore, tokensEarned);
    }
}