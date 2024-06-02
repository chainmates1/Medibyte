import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "../abis/Health_Contract.json";

const useEvents = (contractAddress, specificWallet) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    const fetchEvents = async () => {
      contract.on("TestsSelected", (patient, selectedTests) => {
        if (patient.toLowerCase() === specificWallet.toLowerCase()) {
          setEvents((prevEvents) => [
            ...prevEvents,
            { patient, selectedTests },
          ]);
        }
      });

      return () => {
        contract.off("TestsSelected");
      };
    };

    fetchEvents();
  }, [contractAddress, specificWallet]);

  return events;
};

export default useEvents;
