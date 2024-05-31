// src/utils/walletUtils.js
import { ethers } from "ethers";

export const connectWallet = async (setAccount, setIsConnected, navigate) => {
  try {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const account = accounts[0];
      setAccount(account);
      setIsConnected(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      navigate("/user");
    } else {
      alert("MetaMask extension not detected. Please install MetaMask.");
    }
  } catch (error) {
    console.error("Error connecting to MetaMask:", error);
  }
};
