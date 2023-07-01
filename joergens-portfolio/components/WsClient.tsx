import { NextResponse } from 'next/server';
import WebSocket from 'ws';

let ws: WebSocket;

export function getWebSocketConnection(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const connectClient = () => {
        console.log('Connecting client...');
        const ws = new WebSocket('ws://localhost:8765');
  
        ws.on('open', () => {
          console.log('Connection established!');
          console.log('wsclient.tsx ws:', ws.OPEN);
          resolve(ws);
        });
  
        ws.on('error', (error) => {
          console.log('WebSocket connection error:', error);
          reject(error);
        });
      };
  
      const checkServer = setInterval(() => {
        const ws = new WebSocket('ws://localhost:8765');
  
        ws.on('open', () => {
          console.log('Server is running!');
          clearInterval(checkServer);
          connectClient();
        });
  
        ws.on('error', () => {
          console.log('Server is not running yet...');
        });
      }, 500);
    });
  }

export function getWebSocketListeners() {
    console.log('listen ws:',ws)
    ws.on('message', (message) => {
        const data = JSON.parse(JSON.stringify(message));

        switch (data.type) {
            case 'stage':
                return data.message;
            case 'get':
                return data.message;
            default:
                console.log(data);
        }
    });
}
