import AWS from 'aws-sdk'
import dotenv from 'dotenv';

dotenv.config();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-2',
});

// const apiGatewayURL = 'https://u0whu8vww1.execute-api.us-east-2.amazonaws.com/production/min-rect-partition'

export default async function getPartition(partitionCache: any, degSetIndex: number, index: number) {
    // Create an AWS Lambda service object
    const lambda = new AWS.Lambda();

    // Define the Lambda function name and payload
    const functionName = 'min-rect-partition'; // Replace with your Lambda function name
    const payload = {
        'action': 'get',
        'params': {
            'index': index,
            'degSetIndex': degSetIndex,
        },
    };

    // Configure the Lambda function parameters
    const params = {
        FunctionName: functionName,
        InvocationType: 'RequestResponse', // Can be 'Event' for asynchronous invocation
        Payload: JSON.stringify(payload),
    };

    try {
        const response = await fetch('https://7dp7thzz3icorfu6uzpv4gfyza0fixth.lambda-url.us-east-2.on.aws/', {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(payload)
        })
        const response_data = await response.json()
        partitionCache[degSetIndex][index] = response_data;
        // let response;  // Declare a variable to store the Lambda response

        // // Invoke the Lambda function
        // const lambdaInvocation = new Promise((resolve, reject) => {
        //     lambda.invoke(params, (err, data) => {
        //         if (err) {
        //             console.error('Error invoking Lambda:', err);
        //             reject(err);
        //         } else {
        //             const payloadBuffer = data.Payload;
        //             if (payloadBuffer) {
        //               response = JSON.parse(payloadBuffer.toString('utf-8') || '{}');
        //               partitionCache[degSetIndex][index] = JSON.parse(response.body);
        //             } else {
        //               response = {}; // Fallback in case payloadBuffer is undefined
        //             }
                    
        //             resolve(response);
        //         }
        //     });
        // });

        // await lambdaInvocation;
    } catch (error) {
        console.error('Error in getPartition:', error);
    }
}