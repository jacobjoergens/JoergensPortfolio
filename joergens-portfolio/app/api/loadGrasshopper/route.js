import { NextResponse } from 'next/server'
import compute from 'compute-rhino3d'
import path from 'path'
import fs from 'fs'

async function runCompute(definition, params) {
    let data = {}
    data.definition = definition
    data.inputs = params

    try {
        // let definitionPath = path.join(process.cwd(), 'app/(categories)/computational-design/sculptural-language/BranchNodeRnd.gh');
        compute.url = 'http://20.231.1.123:80/'
        compute.apiKey = '44XyNqF2egQfa7m'

        // set parameters
        let trees = []
        if (data.inputs !== undefined) { //TODO: handle no inputs
            for (let [key, value] of Object.entries(data.inputs)) {
                let param = new compute.Grasshopper.DataTree(key)
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
        const response = await compute.Grasshopper.evaluateDefinition(definition, trees, false);
        const responseJson = await response.json();
        return responseJson
    } catch (error) {
        console.log(error)
    }

}

export async function POST(req) {
    // const definitionPath = path.resolve(path.join(process.cwd(), 'ghDefinitions/final.gh'));
    fs.readdir(path.join(process.cwd(),'.next/server'), (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }
        console.log('cwd:',process.cwd());
        console.log('Contents of the current working directory:');
        files.forEach((file) => {
            console.log(file);
        });
    });

    const request = await req.json();

    let buffer
    fs.readFile(path.join(process.cwd(), 'ghDefinitions/final.gh'), (err, data) => {
        if (err) {
            console.log(error);
            throw err;
        } else {
            buffer = data;
        }
    }
    );

    const definition = new Uint8Array(buffer)

    const res = await runCompute(definition, request);
    return new NextResponse(JSON.stringify(res), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}

