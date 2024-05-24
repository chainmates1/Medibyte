
if (!secrets.apiKey) {
    throw Error(
        "api key not set"
    );
}

// Predefined normal ranges for patient data
const normalRanges = [
    { min: 70, max: 100 }, // Range for blood pressure
    { min: 60, max: 100 }, // Range for heart rate
    { min: 12, max: 20 }, // Range for respiratory rate

];

// arg[0]=uri of patient nft
// arg[1]=address of patient
// arg[2]=amount paid
// arg[3]=number of tokens for this address

// Make HTTP request to fetch patient data from external API

const apiUrlPatientData = 'https://ipfs-api-production-4146.up.railway.app/getTestData'; // Replace with actual API URL
const patientDataRequest = Functions.makeHttpRequest({
    url: apiUrlPatientData,
    headers: {
        "Content-Type": "application/json",
        "x-api-key": secrets.apiKey,
    },
})
const response = await patientDataRequest;
if (response.error) {
    console.log("error");
}
console.log(response.data.data);

// Calculate deviation for each parameter and find average deviation
let totalDeviation = 0;

for (let i = 0; i < data.length; i++) {
    const parameter = data[i];
    const normalRange = normalRanges[i];
    const mean = (normalRange.min + normalRange.max) / 2;

    let deviation;
    if (parameter >= normalRange.min && parameter <= normalRange.max) {
        deviation = 0; // No deviation if parameter lies within the normal range
    }
    else {
        // Calculate deviation from the nearest value between min and max
        if (Math.abs(parameter - normalRange.min) < Math.abs(parameter - normalRange.max)) {
            deviation = Math.abs((parameter - normalRange.min) / mean) * 100;
        } else {
            deviation = Math.abs((parameter - normalRange.max) / mean) * 100;
        }
    }
    totalDeviation += deviation;
}

const averageDeviation = totalDeviation / data.length;

// Calculate patient score
const b = 100 - averageDeviation;
const patientScore = Math.round(b);


let additionalTokens = 0;
const tokensForScore = (score / 10) * parseInt(arg[2]);

if (args[0] != "") {
    const apiurlPreviousScore = args[0];
    const previousScoreRequest = Functions.makeHttpRequest({
        url: args[0],
    })
    const response2 = await previousScoreRequest;
    console.log(response2.data.attribute[0].value);

    const previousScore = response2.data.attribute[0];
    additionalTokens = ((patientScore - previousScore) / 10) * parseInt(arg[2]);
}

const totalTokens = additionalTokens + tokensForScore + parseInt(arg[3]);
const tokensToProvide = additionalTokens + tokensForScore;

let imgurl = "";

if (patientScore > 30 && patientScore < 70) {
    imgurl = "";
}
else if (patientScore <= 30) {
    imgurl = "";
}
else imgurl = "";


const patientData = {
    description: "Patient NFT ", // Description provided as argument
    image: imgurl, // Image URL provided as argument
    name: "name ", // Name provided as argument
    attribute: [
        {
            trait_type: "Score",
            value: patientScore, // Score provided as argument
        },
        {
            trait_type: "Tokens",
            value: totalTokens, // Tokens provided as argument
        },
        {
            trait_type: "Address",
            value: args[1], // Address provided as argument
        }
    ]
};

const apiurlPatientNft = 'https://ipfs-api-production-4146.up.railway.app/setNftData'; // Replace with the actual API URL
console.log("HTTP POST Request to", apiurlPatientNft);

const patientRequest = Functions.makeHttpRequest({
    url: apiurlPatientNft,
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    data: JSON.stringify(patientData),
});

// Execute the API request (Promise)
const patientResponse = await patientRequest;
if (patientResponse.error) {
    console.error(
        patientResponse.response
            ? `${patientResponse.response.status}, ${patientResponse.response.statusText}`
            : ""
    );
    throw Error("Request failed");
}

const responseData = patientResponse.data;

if (!responseData || !responseData.uri) {
    throw Error("Invalid response data");
}

console.log("patient response", responseData);

// Extract the URI from the response
const uri = responseData.uri;

// ABI encoding
const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "uint256", "string"],
    [patientScore, tokensToProvide, uri]
);

// return the encoded data as Uint8Array
return ethers.getBytes(encoded);
// return Functions.encodeUint256(20);
