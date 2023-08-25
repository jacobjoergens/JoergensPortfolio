import { NextResponse } from "next/server";
import { getWebSocketConnection } from "@/components/WsClient";

export const dynamic = 'force-dynamic'

async function sendStageMessage(data: any): Promise<any> {
    const message = {
      action: 'stage',
      params: [data],
    };
  
    const ws = await getWebSocketConnection();
  
    ws.send(JSON.stringify(message));
  
    return new Promise((resolve, reject) => {
      ws.on('message', (message) => {
        const data = JSON.parse(message.toString());
  
        if (data.type === 'stage') {
          resolve(data.message); // Resolve the Promise with the received message
        }
      });
    });
  }

export async function POST(request: Request) {
    const json = await request.json();
    const res = await sendStageMessage(json);
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