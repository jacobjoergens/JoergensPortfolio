import { NextResponse } from 'next/server'
import RhinoCompute from 'compute-rhino3d';
import '../../deps';
import AWS from 'aws-sdk'

// AWS.config.update({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: 'us-east-2',
// });

async function runCompute(params) {
    let data = {}
    data.inputs = params
    try {
        RhinoCompute.url = process.env.RHINO_COMPUTE_URL;
        RhinoCompute.apiKey = process.env.RHINO_COMPUTE_API_KEY;
        // set parameters
        let trees = []
        if (data.inputs !== undefined) { //TODO: handle no inputs
            for (let [key, value] of Object.entries(data.inputs)) {
                let param = new RhinoCompute.Grasshopper.DataTree(key)
                param.append([0], Array.isArray(value) ? value : [value])
                trees.push(param)
            }
        }

        const s3 = new AWS.S3();

        const params = {
            Bucket: 'rhino.compute',
            Key: 'stringPDB.gh',
            Expires: 3600,
        }
        // call compute server
        try{
            const signedDefinitionURL = s3.getSignedUrl('getObject', params);
            // const definition = 'https://joergens.blob.core.windows.net/grasshopper-definitions/stringPDB.gh'
            const response = await RhinoCompute.Grasshopper.evaluateDefinition(signedDefinitionURL, trees, false);
            const responseJson = await response.json();
            return responseJson;
        } catch(error) {
            console.log('Grasshopper compute error:', error)
        }
        
    } catch (error) {
        console.log(error)
    }

}

export async function POST(req) {
    // const definitionPath = path.resolve(path.join(process.cwd(), 'ghDefinitions/final.gh'));

    const request = await req.json();

    // let buffer = fs.readFileSync(path.join(process.cwd(), 'public/ghDefinitions/final.gh'));

    // const definition = new Uint8Array(buffer)

    const res = await runCompute(request.values);
    return new NextResponse(JSON.stringify(res), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}

