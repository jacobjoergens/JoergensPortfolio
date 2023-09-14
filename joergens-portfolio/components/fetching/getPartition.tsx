export default async function getPartition(partitionCache: any, degSetIndex: number, index: number) {
    try {
        const response = await fetch('/api/getPartition', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                index: index,
                degSetIndex: degSetIndex
            })
        });

        if (response.ok) {
            const data = await response.text();
            const resData = JSON.parse(data);
            partitionCache[degSetIndex][index] = await resData.text;
        } else {
            console.error('Failed to get partition:', response.status);
        }
    } catch (error) {
        console.error('Error in getPartition:', error);
    }
}