import rhino3dm from "rhino3dm"
import { NextResponse } from 'next/server'
import compute from 'compute-rhino3d'
import path from 'path'
import fs from 'fs'

let rhino

async function runCompute(definitionPath, count, radius, length) {
    let data = {}
    const url = definitionPath
    const res = path.resolve('./app/(categories)/computational-design/sculptural-language/final.gh');
    const buffer = fs.readFileSync(url)
    const definition = new Uint8Array(buffer)

    data.definition = definition
    data.inputs = {
        'Size': count
    }

    console.log(data.inputs)
    try {
        // let definitionPath = path.join(process.cwd(), 'app/(categories)/computational-design/sculptural-language/BranchNodeRnd.gh');
        compute.url = 'http://localhost:8081/'
        compute.apiKey = ''

        console.log('computing')
        // set parameters
        let trees = []
        if (data.inputs !== undefined) { //TODO: handle no inputs
            for (let [key, value] of Object.entries(data.inputs)) {
                let param = new compute.Grasshopper.DataTree(key)
                param.append([0], Array.isArray(value) ? value : [value])
                trees.push(param)
            }
        }
        if (data.values !== undefined) {
            for (let index = 0; index < res.locals.params.values.length; index++) {
                let param = new compute.Grasshopper.DataTree('')
                param.data = res.locals.params.values[index]
                trees.push(param)
            }
        }

        console.log('trees', trees);
        console.log(trees[0].data.InnerTree);

        // call compute server
        const result = await compute.Grasshopper.evaluateDefinition(definition, trees, false);
        const message = await result.json();
        console.log(message.values[0].InnerTree)
        // console.log(message.values[0].InnerTree['{0;0;0;0;0}'][0].data)
        const res = JSON.parse(message.values[0].InnerTree['{0;0;0;0;0}'][0].data)
        const mesh = rhino.DracoCompression.decompressBase64String(res)
        return res
    } catch (error) {
        console.log(error)
    }

}

export async function POST(req) {
    const definitionName = 'BranchNodeRnd.gh'
    const definitionPath = path.join('app/(categories)/computational-design/sculptural-language/final.gh');
    console.log('posting');
    const request = await req.json();
    console.log(request)
    
    return rhino3dm().then(async (m) => {
        console.log('Loaded rhino3dm.')
        rhino = m // global
        console.log(request.count)
        const res = await runCompute(definitionPath, request.count, request.radius, request.length);
        const mesh = rhino.DracoCompression.decompressBase64String(res);
        const jsmesh = mesh.toThreejsJSON();
        // console.log('test:',jsmesh.data);
        // console.log('res',res)
        return new NextResponse(JSON.stringify(jsmesh), {
            status: 200,
            text:jsmesh,
            headers: { "Content-Type": "application/json" }
        });
    })
}

