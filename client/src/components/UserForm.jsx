// UserForm.js
import React, { useState } from "react";
import { useUser } from "../UserContext";

const UserForm = () => {
  const { account, contract } = useUser();
  const [showDescriptions, setShowDescriptions] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);

  const tests = [
    { id: 1, name: "Blood Test", description: "A test to check your blood." },
    { id: 2, name: "X-Ray", description: "An imaging test to view bones." },
    { id: 3, name: "MRI", description: "A test to get detailed images of organs." },
    { id: 4, name: "CT Scan", description: "A detailed imaging test." },
    { id: 5, name: "Urine Test", description: "A test to analyze urine." },
    { id: 6, name: "Ultrasound", description: "A test using sound waves to create images." },
    { id: 7, name: "EKG", description: "A test to check heart activity." },
    { id: 8, name: "Blood Pressure Test", description: "A test to measure blood pressure." },
    { id: 9, name: "Cholesterol Test", description: "A test to measure cholesterol levels." },
    { id: 10, name: "Blood Sugar Test", description: "A test to measure blood sugar levels." }
  ];

  const toggleDescription = (id) => {
    if (showDescriptions.includes(id)) {
      setShowDescriptions(showDescriptions.filter(testId => testId !== id));
    } else {
      setShowDescriptions([...showDescriptions, id]);
    }
  };

  const handleTestSelection = (id) => {
    if (selectedTests.includes(id)) {
      setSelectedTests(selectedTests.filter(testId => testId !== id));
    } else {
      setSelectedTests([...selectedTests, id]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (contract) {
      try {
        const tx = await contract.selectTests(selectedTests);
        await tx.wait();
        alert("Tests selected successfully!");
      } catch (error) {
        console.error("Error selecting tests:", error);
        alert("Error selecting tests.");
      }
    } else {
      alert("Smart contract is not loaded.");
    }
  };

  return (
    <div className="w-full md:w-2/3 p-4">
      <h2 className="text-2xl font-semibold mb-4">Select Tests</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {tests.map(test => (
          <div key={test.id} className="border p-4 rounded shadow">
            <div className="flex items-center justify-between">
              <div>
                <input
                  type="checkbox"
                  id={`test-${test.id}`}
                  className="mr-2"
                  onChange={() => handleTestSelection(test.id)}
                />
                <label
                  htmlFor={`test-${test.id}`}
                  className="cursor-pointer"
                >
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20 10 10 0 010-20z"></path>
                </svg>
              </button>
            </div>
            {showDescriptions.includes(test.id) && (
              <div className="mt-2 p-2 bg-gray-100 rounded shadow text-black">
                {test.description}
              </div>
            )}
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

export default UserForm;
