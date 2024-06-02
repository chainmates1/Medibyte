import React, { useState, useEffect } from "react";
import { useUser } from "../UserContext";
import { ethers } from "ethers";
import usdcAbi from "../abis/USDCABI.json";
import abi from "../abis/Health_Contract.json";
import senderAbi from "../abis/Sender.json";

const UserForm = () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const [showDescriptions, setShowDescriptions] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [chainId, setChainId] = useState(null);

  const tests = [
    { id: 0, name: "Haemoglobin Test", description: "Test Haemoglobin in your blood. Price: 1 USD", price: ethers.parseUnits("1", 6) },
    { id: 1, name: "Blood Sugar Test", description: "Test your Blood Sugar . Price: 1 USD", price: ethers.parseUnits("1", 6)},
    { id: 2, name: "Blood Uria Test", description: "Test the Uria content in your blood. Price: 1 USD", price: ethers.parseUnits("1", 6) },
    { id: 3, name: "Serum Bilirubin Test", description: "Test Serum Bilirubin in your blood. Price: 2 USD", price: ethers.parseUnits("2", 6) },
    { id: 4, name: "HDL Cholestrol Test", description: "Test your HDL Cholestrol. Price: 2 USD", price: ethers.parseUnits("2", 6) },
    { id: 5, name: "FDL Cholestrol Test", description: "Test your FDL Cholestrol. Price: 3 USD", price: ethers.parseUnits("3", 6) }
  ];

  useEffect(() => {
    const fetchChainId = async () => {
      if (provider) {
        const network = await provider.getNetwork();
        setChainId(network.chainId);
        console.log(Number(network.chainId));
      }
    };
    fetchChainId();
  }, []);

  const toggleDescription = (id) => {
    if (showDescriptions.includes(id)) {
      setShowDescriptions(showDescriptions.filter((testId) => testId !== id));
    } else {
      setShowDescriptions([...showDescriptions, id]);
    }
  };

  const handleTestSelection = (id) => {
    if (selectedTests.includes(id)) {
      setSelectedTests(selectedTests.filter((testId) => testId !== id));
    } else {
      setSelectedTests([...selectedTests, id]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    console.log(signer);
    const contractAddress = import.meta.env.VITE_HEALTH_CONTRACT;
    // console.log(contractAddress);
    const contractABI = abi;
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    // event.preventDefault();
    // console.log(contract);
    if (!contract) {
      alert("Smart contract is not loaded.");
      return;
    }
    const DESTINATION_CHAIN_ID = 43113;
    const selectedTestPrices = selectedTests.map(testId => tests.find(test => test.id === testId).price);
    console.log(selectedTestPrices);
    
    // const totalPrice = selectedTestPrices.reduce((total, price) => total.add(price), ethers.BigNumber.from(0));
    let totalPrice = 0;
    for(let i = 0;i < selectedTestPrices.length;i++){
      totalPrice += Number(selectedTestPrices[i])
    }

    // console.log(totalPrice);
    const USDC_CONTRACT_ADDRESS = import.meta.env.VITE_USDC;

  
    try {
      const usdcContract = new ethers.Contract(
        USDC_CONTRACT_ADDRESS, 
        usdcAbi, 
        await provider.getSigner()
      );

      console.log(usdcContract);
      if (chainId == DESTINATION_CHAIN_ID ) { 
        const approveTx = await usdcContract.approve(contractAddress, (totalPrice));
        await approveTx.wait();
        const tx = await contract.selectTests(signer.address, selectedTests, (totalPrice));
        await tx.wait();
        
        alert("Tests selected successfully!");
      } else {
        // console.log(import.meta.env.VITE_S_USDC_CONTRACT_ADDRESS)
        const usdcContract1 = new ethers.Contract(
          import.meta.env.VITE_S_USDC_CONTRACT_ADDRESS, 
          usdcAbi,  
          await provider.getSigner()
        );
        // console.log(import.meta.env.VITE_SENDER);
        const senderContract = new ethers.Contract(
          import.meta.env.VITE_SENDER, 
          senderAbi,
          await provider.getSigner()
        );
        const transferTx = await usdcContract1.transfer(import.meta.env.VITE_SENDER, totalPrice);
        await transferTx.wait();
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const account = accounts[0];
        const tx = await senderContract.sendMessagePayLINK(
          import.meta.env.VITE_DESTINATION_CHAIN_SELECTOR,
          account,
          selectedTests,  
          totalPrice
        );
        await tx.wait();
        alert("Tests selected and message sent successfully!");
      }
    } catch (error) {
      console.error("Error selecting tests:", error);
      alert("Error selecting tests.");
    }
  };

  return (
    <div className="w-full md:w-2/3 p-4">
      <h2 className="text-2xl font-semibold mb-4">Select Tests</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {tests.map((test) => (
          <div key={test.id} className="border p-4 rounded shadow">
            <div className="flex items-center justify-between">
              <div>
                <input
                  type="checkbox"
                  id={`test-${test.id}`}
                  className="mr-2"
                  onChange={() => handleTestSelection(test.id)}
                />
                <label htmlFor={`test-${test.id}`} className="cursor-pointer">
                  {test.name}
                </label>
              </div>
              <button
                type="button"
                className="ml-4 text-blue-500 hover:text-blue-700"
                onClick={() => toggleDescription(test.id)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20 10 10 0 010-20z"
                  ></path>
                </svg>
              </button>
            </div>
            {showDescriptions.includes(test.id) && (
              <div className="mt-2 p-2 bg-n-6 rounded shadow text-n-2">
                {test.description}
              </div>
            )}
          </div>
        ))}
        {/* <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit
        </button> */}
        <div className="flex justify-center">
        <button className="relative inline-block text-lg group mt-4">
          <span className="relative z-10 block px-5 py-3 overflow-hidden font-medium leading-tight text-gray-800 transition-colors duration-300 ease-out border-2 border-gray-900 rounded-lg group-hover:text-white">
            <span className="absolute inset-0 w-full h-full px-5 py-3 rounded-lg bg-gray-50"></span>
            <span className="absolute left-0 w-48 h-48 -ml-2 transition-all duration-300 origin-top-right -rotate-90 -translate-x-full translate-y-12 bg-gray-900 group-hover:-rotate-180 ease"></span>
            <span className="relative font-extrabold">Pay</span>
          </span>
          <span
            className="absolute bottom-0 right-0 w-full h-12 -mb-1 -mr-1 transition-all duration-200 ease-linear bg-green-400 rounded-lg group-hover:mb-0 group-hover:mr-0"
            data-rounded="rounded-lg"
          ></span>
        </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
