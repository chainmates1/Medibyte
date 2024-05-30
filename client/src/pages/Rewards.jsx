import React from "react";
import { ethers } from "ethers";
import abi from "../abis/Health_Contract.json"; 
import Header from "../components/header"

const Rewards = () => {
    const rewardContracts = {
        HealthCheckup: {
            address: '0x123',
            price: 10,
            image: 'url-to-healthcheckup-image', 
        },
        HealthKit: {
            address: '0x456', 
            price: 20,
            image: 'url-to-healthkit-image', 
        },
        HealthInsurance: {
            address: '0x789', 
            price: 30,
            image: '', 
        },
    };

    const claimReward = async (rewardContract) => {
        try {
            if (!window.ethereum) throw new Error("No crypto wallet found");

            await window.ethereum.send("eth_requestAccounts");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract('YOUR_HEALTH_CONTRACT_ADDRESS', abi, signer);

            const tx = await contract.claimReward(rewardContract);
            await tx.wait();
            console.log("Reward claimed successfully!");
        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <Header />
            <br />
            <br />
            <h1 className="h1 text-center mb-10 ">Claim Your Rewards</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(rewardContracts).map(([key, { address, price, image }]) => (
                    <div
                        key={key}
                        className="card bg-n-1 border border-stroke-1 p-5 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                        onClick={() => claimReward(address)}
                    >
                        <img src={image} alt={`${key} Image`} className="w-full h-48 object-cover rounded-t-lg mb-4"/>
                        <h2 className="h2 mb-4 text-center text-stroke-1">{key.replace(/NFT$/, "")}</h2>
                        <p className="body-1 text-center text-stroke-1">Price: {price} Health Tokens</p>
                        <button className="button bg-color-1 text-n-1 mt-5 py-2 px-4 rounded w-full">Claim</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Rewards;
