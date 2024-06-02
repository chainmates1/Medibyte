import FormData  from 'form-data';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import fs from 'fs';


// Create form data
export const createFormData = async (jsonData) => {
  // Path to the JSON file to be created
  const jsonFilePath = resolve('./data/data.json');
  // Write JSON data to a file
  writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
  const formData = new FormData();
  
  const file = fs.createReadStream('./data/data.json');
  formData.append("file", file);

  const pinataMetadata = JSON.stringify({
    name: "testData",
  });
  formData.append("pinataMetadata", pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 1,
  });
  formData.append("pinataOptions", pinataOptions);
  return formData;
};

