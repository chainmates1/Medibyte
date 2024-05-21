import fetch from 'node-fetch';
import { createFormData } from './fileUtils.js';
import dotenv from 'dotenv';
dotenv.config();

export const uploadFile = async (jsonData) => {
  // Api key and URI
  const apiKey = process.env.API_KEY;
  const url = process.env.QUICK_NODE_URI;

  // Set headers
  const headers = {
    'x-api-key': apiKey,
  };
  // Request options
  const requestOptions = {
      method: 'POST',
      headers,
      body: await createFormData(jsonData),
      redirect: 'follow',
  };

  let cid;
  // Make the request
  try {
    const options =  requestOptions;
    const response = await fetch(url, options);
    const result = await response.json();
    cid = result.pin.cid;
    // console.log(cid);
  } catch (error) {
    console.error('Error:', error);
  }
  return cid;
};

