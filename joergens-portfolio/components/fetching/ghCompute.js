import compute from 'compute-rhino3d'
import path from 'path'
import fs from 'fs'

export async function runCompute(params) {
    let data = {}
    console.log('recieved params:',params)

    // const filePath = path.join(process.cwd(),'ghDefinitions/final.gh');

    // const buffer = fs.readFileSync(filePath);
    // const definition = new Uint8Array(buffer)
    // console.log('created buffer')
    // data.definition = definition
    data.inputs = params

    // let definitionPath = path.join(process.cwd(), 'app/(categories)/computational-design/sculptural-language/BranchNodeRnd.gh');
    compute.url = 'https://20.231.1.123:443/'
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
    const response = await compute.Grasshopper.evaluateDefinition('https://joergens.blob.core.windows.net/grasshopper-definitions/final.gh', trees, false);
    console.log('got response:',response)
    return await response.json();
}

