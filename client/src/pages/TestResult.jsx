import React, { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { ethers } from 'ethers';
import abi from "../abis/Health_Contract.json"

const TestResult = () => {
  const { address } = useParams();
  const location = useLocation();
  const { selectedTests } = location.state || {};
  const [testResults, setTestResults] = useState(Array(10).fill(0));

  const handleChange = (index, value) => {
    const newResults = [...testResults];
    newResults[index] = value;
    setTestResults(newResults);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Sending test results to the API
      await axios.post('/setTestData', { data: testResults });

      // Dummy parameters for the contract function call
      const source = "dummy source";
      const encryptedSecretsUrls = ethers.utils.randomBytes(32); // Dummy encrypted secrets
      const donHostedSecretsSlotID = 0;
      const donHostedSecretsVersion = 0;
      const subscriptionId = 0;
      const gasLimit = 300000;
      const donID = ethers.constants.HashZero; // Dummy DON ID
      const amountPaid = 0;

      // Interacting with the smart contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = provider.getSigner();
      const contractAddress = '0x';
      const contractABI = abi;
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      await contract.updatePatientHealthScore(
        source,
        encryptedSecretsUrls,
        donHostedSecretsSlotID,
        donHostedSecretsVersion,
        subscriptionId,
        gasLimit,
        donID,
        address,
        amountPaid
      );

      alert('Test results submitted successfully and contract function called.');
    } catch (error) {
      console.error('Error submitting test results:', error);
      alert('Failed to submit test results.');
    }
  };

  return (
    <div className="w-full md:w-2/3 p-4 mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Test Results for Patient: {address}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {selectedTests && selectedTests.map(testIndex => (
          <div key={testIndex} className="border p-4 rounded shadow">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Test {testIndex + 1} Result:
              <input
                type="number"
                name={`test${testIndex}`}
                value={testResults[testIndex]}
                onChange={(e) => handleChange(testIndex, e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </label>
          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default TestResult;
