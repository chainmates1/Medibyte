import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

const PatientsSheet = () => {
  const [patients, setPatients] = useState([]);
  const history = useHistory();

  useEffect(() => {
    fetch('https://api.example.com/patients')
      .then(response => response.json())
      .then(data => setPatients(data))
      .catch(error => console.error('Error fetching patients:', error));
  }, []);

  const handleRowClick = (address) => {
    history.push(`/patient/${address}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Patient Address</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.address} onClick={() => handleRowClick(patient.address)} className="cursor-pointer hover:bg-gray-100">
              <td className="py-2 px-4 border-b">{patient.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientsSheet;
