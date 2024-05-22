import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

export const fetchJson = async (uri) =>{
  let result;
  try{
    const response = await fetch(uri, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.SECRET_API_KEY,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    result = await response.json();
  }catch(error){
    console.error(error);
  }
  return result;
}