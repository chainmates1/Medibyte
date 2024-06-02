const ethers = await import('npm:ethers@6.10.0');
const apiUrlPatientData = 'https://test-api-production-678d.up.railway.app/getTestData';
const apiResponse = await Functions.makeHttpRequest({
    url: apiUrlPatientData
});
if (apiResponse.error) {
    throw Error('Request failed');
}
var { data } = apiResponse;
const dataArray = data.data;

const apiUrlRangeData = 'https://gateway.pinata.cloud/ipfs/bafkreiduvnqgr55z53urzp5gahqm7i2iz4yov3zkwacdxy3k4ea64od4iy';

const apiResponseR = await Functions.makeHttpRequest({
    url: apiUrlRangeData
});
if (apiResponseR.error) {
    throw Error('Request failed');
}
var { data } = apiResponseR;
const dataRangeArray = data.data;

let totalDeviation = 0;

for (let i = 0; i < dataArray.length; i++) {
    if(dataArray[i] == 0)
        continue;
    const parameter = dataArray[i];
    const normalRange = dataRangeArray[i];
    const mean = (normalRange.min + normalRange.max) / 2;

    let deviation;
    if (parameter >= normalRange.min && parameter <= normalRange.max) {
        deviation = 0;
    }
    else {
        if (Math.abs(parameter - normalRange.min) < Math.abs(parameter - normalRange.max)) {
            deviation = Math.abs((parameter - normalRange.min) / mean) * 100;
        } else {
            deviation = Math.abs((parameter - normalRange.max) / mean) * 100;
        }
    }
    totalDeviation += deviation;
}

const averageDeviation = totalDeviation / dataArray.length;

const b = 100 - averageDeviation;
const patientScore = Math.round(b);

let additionalTokens = 0;
const tokensForScore = Math.round((patientScore / 10) * parseInt(args[2]));

if(args[0] != ''){
    const apiUrlPatientData2 = args[0];
    const apiResponse2 = await Functions.makeHttpRequest({
        url: apiUrlPatientData2
    });
    if (apiResponse2.error) {
        throw Error('Request failed');
    }
    var { data } = apiResponse2;
    const previousScore = data.attributes[0].value;
    additionalTokens = Math.round(((patientScore - previousScore) / 10) * parseInt(args[2]));
}
const totalTokens = additionalTokens + tokensForScore + parseInt(args[3]);

const tokensToProvide = additionalTokens + tokensForScore;

let imgurl = 'https://gateway.pinata.cloud/ipfs/QmPt2W4tbCfdcqZ8vpUFcGgtPDvQgnsLgyM2G9xQBDkSrP';

if (patientScore > 30 && patientScore < 70) {
    imgurl = 'https://gateway.pinata.cloud/ipfs/QmfJfWM72Ge7DMmp5AJtqD3ebrXEXuMdpKTXwY4ddGQA9N';
}
else if (patientScore <= 30) {
    imgurl = 'https://gateway.pinata.cloud/ipfs/QmYg8DZBJDm7brdVsrW47hX6iR5CztYmJxLM2SMFLh5SV1';
}
const patientData = 
{
    'description': 'PatientNFT! Shows your Token Score',
    'image': imgurl,
    'name': 'PatientNFT',
    'attributes': [
        {
            'trait_type': 'Score',
            'value': patientScore,
        },
        {
            'trait_type': 'Tokens',
            'value':totalTokens,
        },
        {
            'trait_type': 'Address',
            'value': args[1],
        }
    ]
};

const apiUrlPatientNft = 'https://test-api-production-678d.up.railway.app/setNftData';
const apiResponse3 = await Functions.makeHttpRequest({
    url: apiUrlPatientNft,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    data: patientData,
});
var { data } = apiResponse3;
const abiCoder = ethers.AbiCoder.defaultAbiCoder();
const encoded = abiCoder.encode(
    ['uint256', 'uint256', 'string'],
    [patientScore, tokensToProvide, data.uri]
);
return ethers.getBytes(encoded);