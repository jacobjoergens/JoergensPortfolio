import { NextResponse } from 'next/server'
import RhinoCompute from 'compute-rhino3d';
import path from 'path'
import fs from 'fs'
import '../../deps';

async function runCompute(definition, params) {
    let data = {}
    // data.definition = definition
    data.inputs = params
    // console.log(data.inputs.keys());
    try {
        // let definitionPath = path.join(process.cwd(), 'app/(categories)/computational-design/sculptural-language/BranchNodeRnd.gh');
        RhinoCompute.url = 'http://18.222.210.44:80/';
        RhinoCompute.apiKey = 'TMqHt.2h;4q8cakYAroEMD&KmXUKw5qB';
        // RhinoCompute.url = 'http://localhost:8081/'
        // set parameters
        let trees = []
        if (data.inputs !== undefined) { //TODO: handle no inputs
            for (let [key, value] of Object.entries(data.inputs)) {
                let param = new RhinoCompute.Grasshopper.DataTree(key)
                param.append([0], Array.isArray(value) ? value : [value])
                trees.push(param)
            }
        }
        // if (data.values !== undefined) {
        //     for (let index = 0; index < res.locals.params.values.length; index++) {
        //         let param = new compute.Grasshopper.DataTree('')
        //         param.data = res.locals.params.values[index]
        //         trees.push(param)
        //     }
        // }

        // call compute server
        try{
            const definition = 'https://joergens.blob.core.windows.net/grasshopper-definitions/stringPDB.gh'
            const response = await RhinoCompute.Grasshopper.evaluateDefinition(definition, trees, false);
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

    const res = await runCompute(null, request.values);
    return new NextResponse(JSON.stringify(res), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}

