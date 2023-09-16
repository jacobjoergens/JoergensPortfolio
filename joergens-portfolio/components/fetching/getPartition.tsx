import AWS from 'aws-sdk'

AWS.config.update({
    accessKeyId: 'AKIA25HHPKOKT7DJ6JV4',
    secretAccessKey: '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',
  });

const apiGatewayURL = 'https://u0whu8vww1.execute-api.us-east-2.amazonaws.com/production/min-rect-partition'

export default async function getPartition(partitionCache: any, degSetIndex: number, index: number) {
    try {
        // const response = await fetch('/api/getPartition', {
        const response = await fetch(apiGatewayURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            body: JSON.stringify({
                'action' : 'get',
                'params' : {
                    'index': index,
                    'degSetIndex': degSetIndex
                }
            })
        });

        if (response.ok) {
            // const data = await response.text();
            // const resData = JSON.parse(data);
            partitionCache[degSetIndex][index] = await response.json();
        } else {
            console.error('Failed to get partition:', response.status);
        }
    } catch (error) {
        console.error('Error in getPartition:', error);
    }
}