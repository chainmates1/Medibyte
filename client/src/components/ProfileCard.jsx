import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import patAbi from "../abis/PatientNFT.json";

const PatientNFT_ADDRESS = import.meta.env.VITE_PATIENTNFT;

const getNFTId = async (provider, walletAddress) => {
  const contract = new ethers.Contract(PatientNFT_ADDRESS, patAbi, provider);
  // const tid = await contract.getTokenIdByPatient(walletAddress);
  const result = await contract.getTokenIdByPatient(walletAddress);
  // console.log(walletAddress);
  return Number(result);
};

const fetchNFTDataFromOpenSea = async (tokenId) => {
// "  https://testnets-api.opensea.io/api/v2/chain/avalanche_fuji/contract/0x009bBEB7f05FdeCE2944b1273d4e99e029EFf9B0/nfts/1"
  const response = await fetch(`https://testnets-api.opensea.io/api/v2/chain/avalanche_fuji/contract/${PatientNFT_ADDRESS}/nfts/${tokenId}`);
  const result = await response.json();
  console.log(result);
  const data = {
    image_url: result.nft.image_url,
    image_preview_url: result.nft.image_url,
    attributes: [
      { trait_type: 'Tokens', value:  result.nft.traits.find(attr => attr.trait_type === 'Tokens').value },
      { trait_type: 'Score', value: result.nft.traits.find(attr => attr.trait_type === 'Score').value },
    ],
    name: result.nft.name,
  }
  return data;
};

const ProfileCard = () => {
  const [nftData, setNftData] = useState({
    image_url: "https://via.placeholder.com/500",
    image_preview_url: "https://via.placeholder.com/100",
    attributes: [
      { trait_type: "Tokens", value: "-" },
      { trait_type: "Score", value: "-" },
    ],
    name: "No NFT Data",
  });
  const [loading, setLoading] = useState(true);
  const [TokenId, setTokenId] = useState(0);
  const [account, setAccount] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNFTData = async () => {
      try {
        if (window.ethereum) {
          // const provider = new ethers.BrowserProvider(window.ethereum);
          const provider = new ethers.JsonRpcProvider(
            import.meta.env.VITE_RPC_URL
          );
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          const account = accounts[0];
          setAccount(account);
          const tokenId = await getNFTId(provider, account);
          setTokenId(tokenId);
          if (!tokenId) {
            setLoading(false);
            return;
          }
          console.log(tokenId);
          const nftData = await fetchNFTDataFromOpenSea(tokenId);
          // console.log(nftData);
          setNftData(nftData);
        } else {
          alert("MetaMask extension not detected. Please install MetaMask.");
        }
      } catch (error) {
        console.error("Error fetching NFT data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNFTData();
  }, []);

  const RewardLink = () => {
    navigate("/Rewards", {
      state: {
        tokens: nftData.attributes.find(attr => attr.trait_type === 'Tokens').value,
        score: nftData.attributes.find(attr => attr.trait_type === 'Score').value,
        id: TokenId,
        image_url: nftData.image_url
      }
    });
  };

  const coins = nftData.attributes.find(
    (attr) => attr.trait_type === "Tokens"
  ) || { value: "-" };
  const score = nftData.attributes.find(
    (attr) => attr.trait_type === "Score"
  ) || { value: "-" };

  return (
    <div className="max-w-2xl mx-4 sm:max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-sm sm:mx-auto md:mx-auto lg:mx-auto xl:mx-auto mt-16 bg-n-6 border border-stroke-1 shadow-xl rounded-lg text-gray-900">
      <div className="rounded-t-lg h-32 overflow-hidden">
        <img
          className="object-cover object-top w-full"
          src={nftData.image_url}
          alt={nftData.name}
        />
      </div>
      <div className="mx-auto w-32 h-32 relative -mt-16 border-4 border-n-4 rounded-full overflow-hidden">
        <img
          className="object-cover object-center h-32"
          src={nftData.image_preview_url}
          alt={nftData.name}
        />
      </div>
      <div className="text-center mt-2">
        <h2 className="font-semibold text-n-2">
          {account ? `${account.substring(0, 5)}...${account.slice(-3)}` : "0x"}
        </h2>
      </div>
      <ul className="py-4 mt-2 text-gray-700 flex items-center justify-around">
        <li className="flex flex-col items-center justify-around">
          <svg
            className="w-6 h-6 fill-current text-black-900"
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path d="M512 80c0 18-14.3 34.6-38.4 48c-29.1 16.1-72.5 27.5-122.3 30.9c-3.7-1.8-7.4-3.5-11.3-5C300.6 137.4 248.2 128 192 128c-8.3 0-16.4 .2-24.5 .6l-1.1-.6C142.3 114.6 128 98 128 80c0-44.2 86-80 192-80S512 35.8 512 80zM160.7 161.1c10.2-.7 20.7-1.1 31.3-1.1c62.2 0 117.4 12.3 152.5 31.4C369.3 204.9 384 221.7 384 240c0 4-.7 7.9-2.1 11.7c-4.6 13.2-17 25.3-35 35.5c0 0 0 0 0 0c-.1 .1-.3 .1-.4 .2l0 0 0 0c-.3 .2-.6 .3-.9 .5c-35 19.4-90.8 32-153.6 32c-59.6 0-112.9-11.3-148.2-29.1c-1.9-.9-3.7-1.9-5.5-2.9C14.3 274.6 0 258 0 240c0-34.8 53.4-64.5 128-75.4c10.5-1.5 21.4-2.7 32.7-3.5zM416 240c0-21.9-10.6-39.9-24.1-53.4c28.3-4.4 54.2-11.4 76.2-20.5c16.3-6.8 31.5-15.2 43.9-25.5V176c0 19.3-16.5 37.1-43.8 50.9c-14.6 7.4-32.4 13.7-52.4 18.5c.1-1.8 .2-3.5 .2-5.3zm-32 96c0 18-14.3 34.6-38.4 48c-1.8 1-3.6 1.9-5.5 2.9C304.9 404.7 251.6 416 192 416c-62.8 0-118.6-12.6-153.6-32C14.3 370.6 0 354 0 336V300.6c12.5 10.3 27.6 18.7 43.9 25.5C83.4 342.6 135.8 352 192 352s108.6-9.4 148.1-25.9c7.8-3.2 15.3-6.9 22.4-10.9c6.1-3.4 11.8-7.2 17.2-11.2c1.5-1.1 2.9-2.3 4.3-3.4V304v5.7V336zm32 0V304 278.1c19-4.2 36.5-9.5 52.1-16c16.3-6.8 31.5-15.2 43.9-25.5V272c0 10.5-5 21-14.9 30.9c-16.3 16.3-45 29.7-81.3 38.4c.1-1.7 .2-3.5 .2-5.3zM192 448c56.2 0 108.6-9.4 148.1-25.9c16.3-6.8 31.5-15.2 43.9-25.5V432c0 44.2-86 80-192 80S0 476.2 0 432V396.6c12.5 10.3 27.6 18.7 43.9 25.5C83.4 438.6 135.8 448 192 448z" />
          </svg>
          <div className="text-xl text-n-1 font-semibold text-black-900">
            {coins.value}
          </div>
          <div className="text-sm text-n-2">Coins</div>
        </li>
        <li className="flex flex-col items-center justify-around">
          <svg
            className="w-6 h-6 fill-current text-black-900"
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path d="M512 80c0 18-14.3 34.6-38.4 48c-29.1 16.1-72.5 27.5-122.3 30.9c-3.7-1.8-7.4-3.5-11.3-5C300.6 137.4 248.2 128 192 128c-8.3 0-16.4 .2-24.5 .6l-1.1-.6C142.3 114.6 128 98 128 80c0-44.2 86-80 192-80S512 35.8 512 80zM160.7 161.1c10.2-.7 20.7-1.1 31.3-1.1c62.2 0 117.4 12.3 152.5 31.4C369.3 204.9 384 221.7 384 240c0 4-.7 7.9-2.1 11.7c-4.6 13.2-17 25.3-35 35.5c0 0 0 0 0 0c-.1 .1-.3 .1-.4 .2l0 0 0 0c-.3 .2-.6 .3-.9 .5c-35 19.4-90.8 32-153.6 32c-59.6 0-112.9-11.3-148.2-29.1c-1.9-.9-3.7-1.9-5.5-2.9C14.3 274.6 0 258 0 240c0-34.8 53.4-64.5 128-75.4c10.5-1.5 21.4-2.7 32.7-3.5zM416 240c0-21.9-10.6-39.9-24.1-53.4c28.3-4.4 54.2-11.4 76.2-20.5c16.3-6.8 31.5-15.2 43.9-25.5V176c0 19.3-16.5 37.1-43.8 50.9c-14.6 7.4-32.4 13.7-52.4 18.5c.1-1.8 .2-3.5 .2-5.3zm-32 96c0 18-14.3 34.6-38.4 48c-1.8 1-3.6 1.9-5.5 2.9C304.9 404.7 251.6 416 192 416c-62.8 0-118.6-12.6-153.6-32C14.3 370.6 0 354 0 336V300.6c12.5 10.3 27.6 18.7 43.9 25.5C83.4 342.6 135.8 352 192 352s108.6-9.4 148.1-25.9c7.8-3.2 15.3-6.9 22.4-10.9c6.1-3.4 11.8-7.2 17.2-11.2c1.5-1.1 2.9-2.3 4.3-3.4V304v5.7V336zm32 0V304 278.1c19-4.2 36.5-9.5 52.1-16c16.3-6.8 31.5-15.2 43.9-25.5V272c0 10.5-5 21-14.9 30.9c-16.3 16.3-45 29.7-81.3 38.4c.1-1.7 .2-3.5 .2-5.3zM192 448c56.2 0 108.6-9.4 148.1-25.9c16.3-6.8 31.5-15.2 43.9-25.5V432c0 44.2-86 80-192 80S0 476.2 0 432V396.6c12.5 10.3 27.6 18.7 43.9 25.5C83.4 438.6 135.8 448 192 448z" />
          </svg>
          <div className="text-xl text-n-1 font-semibold text-black-900">
            {score.value}
          </div>
          <div className="text-sm text-n-2">Score</div>
        </li>
      </ul>
      {/* <div className="p-4 border-t mx-8 mt-2">
        <button
          onClick={RewardLink}
          className="w-full text-center text-white bg-gray-900 hover:bg-green-500 hover:text-black py-2 rounded-lg transition-colors duration-300 hover:shadow-md"
        >
          Get Rewards
        </button>
      </div> */}
      <div className="p-4 border-t mx-8 mt-2">
  <button 
    onClick={RewardLink} 
    className="w-full text-center text-black bg-white hover:bg-green-500 hover:text-white py-2 rounded-lg transition-colors duration-300 hover:shadow-md"
  >
    Get Rewards
  </button>
</div>

    </div>
  );
};

export default ProfileCard;
