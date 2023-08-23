import * as THREE from "three";

export default async function stagePartitioning(crvPoints: any[]) {
    let areas: number[] = [];
    // iterate over the curves
    for (let i = 0; i < crvPoints.length; i++) {
        const curve = crvPoints[i];
        const numVertices = curve.length;
        let signedArea = 0;

        // iterate over the vertices of the curve and compute the signed area using cross products
        for (let j = 0; j < numVertices; j++) {
            const p1 = new THREE.Vector3(curve[j][0], curve[j][1], curve[j][2]);
            const p2 = new THREE.Vector3(curve[(j + 1) % numVertices][0], curve[(j + 1) % numVertices][1], curve[(j + 1) % numVertices][2]);
            signedArea += p1.x * p2.y - p2.x * p1.y;
        }

        if (signedArea < 0) {
            curve.reverse();
            signedArea *= -1;
        }
        areas.push(signedArea);
    }
    try {
        const response = await fetch('/api/stagePartition', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                crvPoints: crvPoints,
                k: 4,
                areas: areas
            })
        })

        if (response.ok) {
            const data = await response.text();
            const resData = JSON.parse(data);
            // bipartite_figures = resData.text.bipartite_figures; // addFigures(resData.bipartite_figures);
            // setLength = resData.text.setLength;
            // complete = await showPartition(0)
            return resData.text
        } else {
            console.error('Failed to stage partition:', response.status);
        }
    } catch (error) {
        console.error('Error in stagePartition:', error);
    }
    return null;
}