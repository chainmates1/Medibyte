import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import abi from "../abis/Health_Contract.json";

const PatientsSheet = () => {
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();
  let contract; 
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        if (!window.ethereum) {
          console.error('MetaMask is not installed');
          return;
        }

        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contractAddress = '0x'; 
        const contractABI = abi;
        contract = new ethers.Contract(contractAddress, contractABI, provider);

        contract.on('TestsSelected', (patientAddress, selectedTests) => {
          setPatients(prevPatients => [...prevPatients, { address: patientAddress, selectedTests }]);
        });

      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    fetchPatients();

    return () => {
      if (window.ethereum && contract) {
        contract.removeAllListeners('TestsSelected');
      }
    };
  }, []);

  const handleRowClick = (address, selectedTests) => {
    navigate(`/patient/${address}`, { state: { selectedTests } });
  };

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
