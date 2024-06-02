import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "../abis/Health_Contract.json";
import mediabi from "../abis/MediCoin.json";
import patientNFTAbi from "../abis/PatientNFT.json";
import SubHeader from "../components/SubHeader";
import { useLocation } from 'react-router-dom';
import checkupabi from "../abis/FreeHealthCheckupNFT.json";
import kitabi from "../abis/FreeHealthKitNFT.json";
import insuranceabi from "../abis/HealthInsuranceNFT.json";

const Rewards = () => {
    const location = useLocation();
    const { tokens, score, id, image_url } = location.state;
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
        HealthKit: {
            address: import.meta.env.VITE_KIT,
            price: 20,
            image: 'https://gateway.pinata.cloud/ipfs/QmegqDLxYX1zHAx1DBSw4SA2v9ymzczXE1qgKDSoPy2Jgp',
            available: rewardAvailability.HealthKit
        },
        HealthCheckup: {
            address: import.meta.env.VITE_CHECKUP,
            price: 50,
            image: 'https://gateway.pinata.cloud/ipfs/Qmdree1mCWqrAvAa8gjYzCQAEGyQVj4imJ6ZVefJ6q9bYd',
            available: rewardAvailability.HealthCheckup
        },
        HealthInsurance: {
            address: import.meta.env.VITE_INSURANCE,
            price: 100,
            image: 'https://gateway.pinata.cloud/ipfs/QmbovfLDsr7JYTaCN1FJYugbfGq5KUkmtyPhYAEiEkbkJg',
            available: rewardAvailability.HealthInsurance
        },
    };

    const claimReward = async (rewardKey) => {
        try {
            if (!window.ethereum) throw new Error("No crypto wallet found");

            await window.ethereum.request({ method: "eth_requestAccounts" });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const account = await signer.getAddress();
            // console.log(account);
            const HEALTH_address = import.meta.env.VITE_HEALTH_CONTRACT;
            const PatientNFT_ADDRESS = import.meta.env.VITE_PATIENTNFT;
            const Medicoin_ADDRESS = import.meta.env.VITE_MEDICOIN;
            const contract = new ethers.Contract(HEALTH_address, abi, signer);
            const medicoin = new ethers.Contract(Medicoin_ADDRESS, mediabi, signer);
            const patientNFTContract = new ethers.Contract(PatientNFT_ADDRESS, patientNFTAbi, signer);

            // Convert tokens to a number, defaulting to 0 if it's "-"
            const tokenAmount = tokens === "-" ? "0" : tokens;
            console.log(tokenAmount);
            const balance = ethers.parseUnits(tokenAmount.toString(), 18);
            const rewardPrice = ethers.parseUnits(rewardContracts[rewardKey].price.toString(), 18);
            console.log(balance);
            console.log(rewardPrice);
            if (balance < rewardPrice) {
                alert("Insufficient token balance");
                throw new Error("Insufficient token balance");
            }

            // // Approve tokens
            const approveTx = await medicoin.approve(HEALTH_address, rewardContracts[rewardKey].price);
            await approveTx.wait();

            // // Claim reward
            const claimTx = await contract.claimReward(rewardContracts[rewardKey].address);
            await claimTx.wait();

            console.log("Reward claimed successfully!");

            // Update NFT data
            const updatedTokens = balance - rewardPrice;
            const updatedNftData = {
                description: "PatientNFT! Shows your Token Score",
                image: image_url,
                name: "PatientNFT",
                attributes: [
                    {
                        trait_type: "Score",
                        value: score
                    },
                    {
                        trait_type: "Tokens",
                        value: Number(updatedTokens)/ 10 ** 18,
                    },
                    {
                        trait_type: "Address",
                        value: account
                    }
                ]
            };

            // Send updated data to the API
            const response = await fetch('https://test-api-production-678d.up.railway.app/setNftData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedNftData)
            });

            if (!response.ok) {
                throw new Error("Failed to update NFT data");
            }

            const result = await response.json(); // Assuming the API response contains the new URI
            console.log(result.uri);
            const privateKey = import.meta.env.VITE_PRIVATE_KEY;
            const provider2 = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL)
            const adminWallet = new ethers.Wallet(privateKey, provider2);
            // console.log(adminWallet);
            // Call setTokenURI function on the PatientNFT contract
            const setTokenUriTx = await patientNFTContract.connect(adminWallet).setTokenURI(id, result.uri);
            await setTokenUriTx.wait();

            console.log("NFT URI updated successfully");

        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <SubHeader />
      <br />
      <br />
      <h1 className="h1 text-center mb-10">Claim Your Rewards</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(rewardContracts).map(
          ([key, { address, price, image, available }]) => (
            <div
              key={key}
              className="card bg-n-6 border border-stroke-1 p-5 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex flex-col items-center"
              
            >
              <img
                src={image}
                alt={`${key} Image`}
                className="w-full h-48 object-cover rounded-t-lg mb-4"
              />
              <h2 className="h2 mb-4 text-center text-stroke-2">
                {key.replace(/NFT$/, "")}
              </h2>
              <p className="body-1 text-center text-stroke-2">
                Available: {available}
              </p>
              <p className="body-1 text-center text-stroke-2">
                Price: {price} Health Tokens
              </p>
              <button className="relative inline-block text-lg group mt-4" onClick={() => claimReward(key)}>
                <span className="relative z-10 block px-5 py-3 overflow-hidden font-medium leading-tight text-gray-800 transition-colors duration-300 ease-out border-2 border-gray-900 rounded-lg group-hover:text-white">
                  <span className="absolute inset-0 w-full h-full px-5 py-3 rounded-lg bg-gray-50"></span>
                  <span className="absolute left-0 w-48 h-48 -ml-2 transition-all duration-300 origin-top-right -rotate-90 -translate-x-full translate-y-12 bg-gray-900 group-hover:-rotate-180 ease"></span>
                  <span className="relative font-extrabold">Claim</span>
                </span>
                <span
                  className="absolute bottom-0 right-0 w-full h-12 -mb-1 -mr-1 transition-all duration-200 ease-linear bg-green-400 rounded-lg group-hover:mb-0 group-hover:mr-0"
                  data-rounded="rounded-lg"
                ></span>
                
              </button>
            </div>
          ))}
      </div>
    </div>
    );
};

export default Rewards;
