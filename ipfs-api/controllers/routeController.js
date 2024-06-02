import { uploadFile } from "../utils/ipfsUpload.js";
import { fetchJson } from "../utils/ipfsRetrieve.js";
import dotenv from 'dotenv';
dotenv.config();

let testDataCID;

//Get Test Data
export const getTestData = async (req, res) => {
  if (typeof testDataCID === 'undefined') {
    return res.status(400).json({ message: 'No Test Data Available' });
  }
  const gateWay = process.env.GATEWAY;
  const resultUri = gateWay.concat(testDataCID);
  try {
    const result = await fetchJson(resultUri);
    if (typeof result === 'undefined') {
      return res.status(400).json({ message: 'Problem Occurred! Try Again!' });
    }
    console.log('Request successfully executed!');
    return res.status(200).json( result );
  } catch (error) {
    res.status(400).json({ message: err.message });
  }
};

//Set Test Data
export const setTestData = async (req, res) => {
  const testData = req.body;
  if (!testData) {
    return res.status(400).json({ message: 'Test Data is Required!' });
  }
  // console.log(testData);
  try {
    let result = await uploadFile(testData);
    if (typeof result === 'undefined') {
      return res.status(400).json({ message: 'Problem Occurred! Try Again!' });
    }
    testDataCID = result;
    console.log('Request successfully executed!');
    return res.status(201).json({ message: 'Test Stored Successfully!' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//Set NFT Data
export const setNftData = async (req, res) => {
  const nftData = req.body;
  if (!nftData) {
    return res.status(400).json({ message: 'NFT Data is Required!' });
  }
  try {
    let result = await uploadFile(nftData);
    if (typeof result === 'undefined') {
      return res.status(400).json({ message: 'Problem Occurred! Try Again!' });
    }
    const gateWay = process.env.GATEWAY;
    const resultUri = gateWay.concat(result);
    console.log('Request successfully executed!');
    return res.status(201).json({ uri: resultUri });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}