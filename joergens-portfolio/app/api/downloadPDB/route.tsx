import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    const json = await req.json()
    const pdbID = json.id;

    try {

        const response = await fetch(`	https://files.rcsb.org/download/${pdbID}.pdb`);
        const pdbContent = await response.text();

        const filePath = path.join(process.cwd(), `./pdb/${pdbID}.pdb`);
        fs.writeFileSync(filePath, pdbContent);
        return new NextResponse(JSON.stringify({ message: `Successfully downloaded ${pdbID}.pdb` }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error('Error downloading PDB file:', error);
        return new NextResponse(JSON.stringify({ error: 'An error occurred' }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}