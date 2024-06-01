import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "../abis/Health_Contract.json";
import mediabi from "../abis/MediCoin.json";
import patientNFTAbi from "../abis/PatientNFT.json";
import Header from "../components/header";
import { useLocation } from 'react-router-dom';
import checkupabi from "../abis/FreeHealthCheckupNFT.json";
import kitabi from "../abis/FreeHealthKitNFT.json";
import insuranceabi from "../abis/HealthInsuranceNFT.json";

const Rewards = () => {
    const location = useLocation();
    const { tokens, score, id } = location.state || { tokens: 0, score: 0, id: 0 };
    const [rewardAvailability, setRewardAvailability] = useState({
        HealthCheckup: 0,
        HealthKit: 0,
        HealthInsurance: 0,
    });

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!window.ethereum) return;

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const signerAddress = await signer.getAddress();
            const checkup_address = import.meta.env.VITE_CHECKUP;
            const kit_address = import.meta.env.VITE_KIT;
            const Insurance_address = import.meta.env.VITE_INSURANCE;
            const CheckupContract = new ethers.Contract(checkup_address, checkupabi, signer);
            const KitContract = new ethers.Contract(kit_address, kitabi, signer);
            const InsuranceContract = new ethers.Contract(Insurance_address, insuranceabi, signer);

            const avCheckup = await CheckupContract.balanceOf(signerAddress);
            const avKit = await KitContract.balanceOf(signerAddress);
            const avInsurance = await InsuranceContract.balanceOf(signerAddress);

            setRewardAvailability({
                HealthCheckup: avCheckup.toString(),
                HealthKit: avKit.toString(),
                HealthInsurance: avInsurance.toString(),
            });
        };

        fetchAvailability();
    }, []);

    const rewardContracts = {
        HealthCheckup: {
            address: '0x123',
            price: 10,
            image: 'url-to-healthcheckup-image',
            available: rewardAvailability.HealthCheckup
        },
        HealthKit: {
            address: '0x456',
            price: 20,
            image: 'url-to-healthkit-image',
            available: rewardAvailability.HealthKit
        },
        HealthInsurance: {
            address: '0x789',
            price: 30,
            image: 'url-to-healthinsurance-image',
            available: rewardAvailability.HealthInsurance
        },
    };

    const claimReward = async (rewardKey) => {
        try {
            if (!window.ethereum) throw new Error("No crypto wallet found");

            await window.ethereum.send("eth_requestAccounts");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const account = await signer.getAddress();
            const HEALTH_address = import.meta.env.VITE_HEALTH_CONTRACT;
            const PatientNFT_ADDRESS = import.meta.env.VITE_PATIENTNFT;
            const Medicoin_ADDRESS = import.meta.env.VITE_MEDICOIN;
            const contract = new ethers.Contract(HEALTH_address, abi, signer);
            const medicoin = new ethers.Contract(Medicoin_ADDRESS, mediabi, signer);
            const patientNFTContract = new ethers.Contract(PatientNFT_ADDRESS, patientNFTAbi, signer);

            // Check user balance
            const balance = ethers.parseUnits(tokens.toString(), 18);
            const rewardPrice = ethers.parseUnits(rewardContracts[rewardKey].price.toString(), 18);

            if (balance.lt(rewardPrice)) {
                throw new Error("Insufficient token balance");
            }

            // Approve tokens
            const approveTx = await medicoin.approve(HEALTH_address, rewardPrice);
            await approveTx.wait();

            // Claim reward
            const claimTx = await contract.claimReward(rewardContracts[rewardKey].address);
            await claimTx.wait();

            console.log("Reward claimed successfully!");

            // Update NFT data
            const updatedTokens = balance.sub(rewardPrice);
            const updatedNftData = {
                description: "this is here",
                image: "xyz.com",
                name: "hemlo",
                attributes: [
                    {
                        trait_type: "Score",
                        value: score
                    },
                    {
                        trait_type: "Tokens",
                        value: updatedTokens.toString()
                    },
                    {
                        trait_type: "Address",
                        value: account
                    }
                ]
            };

            // Send updated data to the API
            const response = await fetch('/setNftData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedNftData)
            });

            if (!response.ok) {
                throw new Error("Failed to update NFT data");
            }

            const { uri } = await response.json(); // Assuming the API response contains the new URI
            const privateKey = import.meta.env.VITE_PRIVATE_KEY;
            const adminWallet = new ethers.Wallet(privateKey, provider);

            // Call setTokenURI function on the PatientNFT contract
            const setTokenUriTx = await patientNFTContract.connect(adminWallet).setTokenURI(id, uri);
            await setTokenUriTx.wait();

            console.log("NFT URI updated successfully");

        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <Header />
            <br />
            <br />
            <h1 className="h1 text-center mb-10">Claim Your Rewards</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(rewardContracts).map(([key, { address, price, image, available }]) => (
                    <div
                        key={key}
                        className="card bg-n-1 border border-stroke-1 p-5 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                        onClick={() => claimReward(key)}
                    >
                        <img src={image} alt={`${key} Image`} className="w-full h-48 object-cover rounded-t-lg mb-4" />
                        <h2 className="h2 mb-4 text-center text-stroke-1">{key.replace(/NFT$/, "")}</h2>
                        <p className="body-1 text-center text-stroke-1">Available: {available}</p>
                        <p className="body-1 text-center text-stroke-1">Price: {price} Health Tokens</p>
                        <button className="button bg-color-1 text-n-1 mt-5 py-2 px-4 rounded w-full" onClick={claimReward}>Claim</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Rewards;