// import fetch from 'node-fetch';
import axios from 'axios';
import { createFormData } from './fileUtils.js';
import dotenv from 'dotenv';
dotenv.config();

export const uploadFile = async (jsonData) => {
  // JWT and URI;
  const JWT = process.env.JWT;
  const url = process.env.URI;

  let cid;
  // Make the request
  try {
    const formData = await createFormData(jsonData);
    console.log(formData);
    const response = await axios.post(
      url,
      formData,
      {
        headers: {
          Authorization: `Bearer ${JWT}`,
        },
      }
    );
    console.log(response.data);
    cid = response.data.IpfsHash;
    // console.log(cid);
  } catch (error) {
    console.error('Error:', error);
  }
  return cid;
};

