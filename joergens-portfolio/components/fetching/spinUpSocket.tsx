export default async function spinUpSocket() {
    const response = await fetch('/api/startServer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });

    console.log('RESPONSE: ', response)

    if (response.ok) {
        const data = await response.text();
        console.log(data);
        if (data === 'Connection established!') {
            // showSpinner(false);
        }
    } else {
        console.error('Failed to spin up socket:', response.status);
    }
}