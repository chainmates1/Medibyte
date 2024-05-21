import { FormData } from 'formdata-node';
import { fileFromPath } from 'formdata-node/file-from-path';
import { writeFileSync } from 'fs';
import { resolve } from 'path';


// Create form data
export const createFormData = async (jsonData) => {
  // Path to the JSON file to be created
  const jsonFilePath = resolve('./data/data.json');

  // Write JSON data to a file
  writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
  
  const formData = new FormData();
  const file = await fileFromPath(jsonFilePath);
  formData.append('Body', file, 'data.json');
  formData.append('Key', 'testData');
  formData.append('ContentType', 'application/json');
  return formData;
};

