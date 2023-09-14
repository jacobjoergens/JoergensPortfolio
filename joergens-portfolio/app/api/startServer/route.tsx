import { spawn } from 'child_process';
import { NextResponse } from 'next/server';
import { getWebSocketConnection, getWebSocketListeners } from '@/components/WsClient';
import path from 'path';

export const dynamic = 'force-dynamic'

function startPythonServer() {

    // const command = ['C:/Users/jacob/OneDrive/Documents/GitHub/JoergensPortfolio/joergens-portfolio/app/(categories)/computational-design/min-rect-partition/min-k-partition.py'];
    const filePath =  'app/(categories)/computational-design/min-rect-partition/min-k-partition.py'

    if (filePath) {
        // The environment variable is defined, use it
        const fullPath = [path.join(process.cwd(), filePath)];
        const pythonProcess = spawn('python', fullPath);
        pythonProcess.stdout.on('data', (data) => {
            console.log(`Python stdout: ${data}`);
        });
    
        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python stderr: ${data}`);
        });
    
        pythonProcess.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
      } else {
        // The environment variable is not defined
        // Handle this case, e.g., by providing a default path or throwing an error
        console.error('PYTHON_SCRIPT_PATH environment variable is not defined.');
      }
}

export async function POST() {
    try {
        startPythonServer();

        //let ws: WebSocket | null = null;
        
        const checkServer = setInterval(async () => {
            const ws = await getWebSocketConnection();

            if (ws) {
                console.log('Server is running!');
                clearInterval(checkServer);
            } else {
                console.log('Server is not running yet...');
            }
        }, 500);

        return new NextResponse(JSON.stringify({status:200}));
    } catch (error: any) {
        let error_response = {
            status: "error",
            message: error.message,
        };
        return new NextResponse(JSON.stringify(error_response), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

