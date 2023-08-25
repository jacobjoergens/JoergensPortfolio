import { NextResponse } from "next/server";
import WebSocket from "ws";
import { getWebSocketConnection} from "@/components/WsClient";

export const dynamic = 'force-dynamic'

async function sendGetMessage(data: any): Promise<any> {
    const message = {
      action: 'get',
      params: [data],
    };
  
    const ws = await getWebSocketConnection();
  
    ws.send(JSON.stringify(message));
  
    return new Promise((resolve, reject) => {
      ws.on('message', (message) => {
        const data = JSON.parse(message.toString());
        // console.log('Received message:', data);
  
        if (data.type === 'get') {
          resolve(data.message); // Resolve the Promise with the received message
        }
      });
    });
  }

export async function POST(request: Request) {
    const json = await request.json();
    const res = await sendGetMessage(json);
    try {
        return new NextResponse(JSON.stringify({text: res, status:"success"}), {
            status:200,  
            headers: { "Content-Type": "application/json" },
        });
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