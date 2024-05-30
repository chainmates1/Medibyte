import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import abi from "../abis/Health_Contract.json";

const PatientsSheet = () => {
  const [patients, setPatients] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();
  let contract; 
  const authorizedAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        if (!window.ethereum) {
          alert("MetaMask extension not detected. Please install MetaMask.");
          console.error('MetaMask is not installed');
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const add = await provider.getSigner();
        const userAddress = add.address;
        console.log(userAddress);
        if (userAddress.toLowerCase() === authorizedAddress.toLowerCase()) {
          setIsAuthorized(true);
          fetchPatients();
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Error checking authorization:', error);
      }
    };

    const fetchPatients = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
        const contractABI = abi;
        contract = new ethers.Contract(contractAddress, contractABI, provider);

        contract.on('TestsSelected', (patientAddress, selectedTests) => {
          setPatients(prevPatients => [...prevPatients, { address: patientAddress, selectedTests }]);
        });
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    checkAuthorization();

    return () => {
      if (window.ethereum && contract) {
        contract.removeAllListeners('TestsSelected');
      }
    };
  }, []);

  const handleRowClick = (address, selectedTests) => {
    navigate(`/patient/${address}`, { state: { selectedTests } });
  };

  if (!isAuthorized) {
    return <div className="text-center mt-10 text-red-500">You are not authorized to access this page.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Registered Patient Addresses</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.address} onClick={() => handleRowClick(patient.address, patient.selectedTests)} className="cursor-pointer hover:bg-gray-100">
              <td className="py-2 px-4 border-b">{patient.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientsSheet;
