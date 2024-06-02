import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { ethers } from 'ethers';
import abi from "../abis/Health_Contract.json";
import SubHeader from '../components/SubHeader';
import {sourcecd} from "../assets/srccode";

const TestResult = () => {
  const { address } = useParams();
  const location = useLocation();
  const { selectedTests } = location.state || {};
  const [testResults, setTestResults] = useState(Array(10).fill(0)); // Ensure testResults is always an array
  const testValues = [1, 1, 1, 2, 2, 3]; // Array of test values

  useEffect(() => {
    // Initialize testResults with zeros for selected tests
    if (selectedTests && selectedTests.length > 0) {
      const initialResults = Array(10).fill(0);
      setTestResults(initialResults);
    }
  }, [selectedTests]);

  const handleChange = (index, value) => {
    const newResults = [...testResults];
    newResults[index] = parseFloat(value); // Ensure value is a number
    setTestResults(newResults);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Sending test results to the API
      var response = await axios.post('https://test-api-production-678d.up.railway.app/setTestData', { data: testResults });
      console.log(response.data);

      // Calculate amountPaid based on selected tests
      const amountPaid = selectedTests.reduce((sum, testIndex) => sum + testValues[testIndex], 0);
      // console.log(sourcecd);
      // Dummy parameters for the contract function call
      const source = sourcecd;
      const encryptedSecretsUrls = "0x"; // Dummy encrypted secrets
      const donHostedSecretsSlotID = 0;
      const donHostedSecretsVersion = 0;
      const subscriptionId = 9105;
      const gasLimit = 300000;
      const donID = "0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000"; // Dummy DON ID

      // Interacting with the smart contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractAddress = import.meta.env.VITE_HEALTH_CONTRACT;
      const contractABI = abi;
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      // console.log(amountPaid)
      await contract.updatePatientHealthScore(
        source,
        encryptedSecretsUrls,
        donHostedSecretsSlotID,
        donHostedSecretsVersion,
        subscriptionId,
        gasLimit,
        donID,
        address,
        amountPaid// Ensure the amount is in the correct unit
      );

      alert('Test results submitted successfully and contract function called.');
    } catch (error) {
      console.error('Error submitting test results:', error);
      alert('Failed to submit test results.');
    }
  };

  return (
    <>
      <SubHeader />
      <br />
      <br />
      <br />
      <br />
      <div className="w-full md:w-2/3 p-4 mx-auto">
        <h2 className="text-2xl cont-semibold mb-4 text-n-2"><span className='font-extrabold'>Test Results for Patient:</span> {address}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedTests && selectedTests.map(testIndex => (
            <div key={testIndex} className="border p-4 rounded shadow">
              <label className="block text-white-700 text-sm font-bold mb-2">
                Test {testIndex + 1} Result:
                <input
                  type="number"
                  step="any"
                  name={`test${testIndex}`}
                  value={testResults[testIndex] || ''} // Default to '' if undefined
                  onChange={(e) => handleChange(testIndex, e.target.value)}
                  className="mt-1 text-n-6 block w-full px-3 py-2 border border-black-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </label>
            </div>
          ))}
          <button
            type="submit"
            className="w-full text-black bg-white hover:bg-green-500 hover:text-white font-bold py-2 px-4 rounded "
          >
            Submit
          </button>
        </form>
      </div>
    </>
  );
};

export default TestResult;
