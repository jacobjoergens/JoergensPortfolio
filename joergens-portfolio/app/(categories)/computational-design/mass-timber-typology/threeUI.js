import * as THREE from 'three'
import { scene, camera, renderer, controls, zoomCameraToSelection } from './initThree.js'
import { onMouseMove, onMouseDown, onMouseUp, onEsc, curves } from './drawCurve.js';
import getPartition from '@/components/fetching/getPartition';

export let partitionCache = {}
let activePartition
export let currentIndex = 0

export let lengthDegSet = 0
export let degSetIndex = 0


export async function setInitValues() {
    partitionCache = {};
    activePartition = null;
    currentIndex = 0; 
    lengthDegSet = 0;
    degSetIndex = 0; 
}

export function createListeners() {
    renderer.domElement.addEventListener('click', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
          onEsc()
        }
      });
}

export function removeListeners(){
    renderer.domElement.removeEventListener('click', onMouseDown);
    renderer.domElement.removeEventListener('mousemove', onMouseMove);
    renderer.domElement.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
          onEsc()
        }
      });
}

export async function showPartition(direction, display=true) {
    let part = false; 
    if(activePartition){
        scene.remove(activePartition)
    }
    if(degSetIndex in partitionCache){
        currentIndex = (currentIndex + direction) % partitionCache[degSetIndex][0].numNonDegParts.length;
        if(!(currentIndex in partitionCache[degSetIndex])){
            part = await getPartition(partitionCache, degSetIndex, currentIndex);
            drawPartition(currentIndex);
        }
    } else {
        currentIndex = 0;
        partitionCache[degSetIndex] = {};
        part = await getPartition(partitionCache, degSetIndex, currentIndex);
        drawPartition(currentIndex);
    }
    lengthDegSet = partitionCache[degSetIndex][0].numNonDegParts.length
    activePartition = partitionCache[degSetIndex][currentIndex]['renderedRegions'];
    if(display){
        scene.add(activePartition);
        zoomCameraToSelection(camera, controls, scene);
    }
    // scene.add(partitionCache[degSetIndex][currentIndex]['renderedRegions'])
    return activePartition;
}

// export function drawPartition(currentIndex) {
//     const currentPartition = partitionCache[degSetIndex][currentIndex];
//     const regions = currentPartition['regions'];
//     const colors = currentPartition['colors'];
//     const indices = new Uint16Array([
//         0,1,2, //triangle 1
//         0,2,3, //triangle 2
//     ]);

//     const colorList = ['DarkRed','Firebrick','Crimson','IndianRed'];
    
//     let renderedRegions = new THREE.Group();
//     for (let j = 0; j < regions.length; j++) {
//         let points = regions[j]
//         const regionMaterial = new THREE.MeshBasicMaterial({ color: colorList[colors[j]] });
//         // create a new Float32Array with the point data
//         let vertices = new Float32Array(points.length * 3);
//         for (var i = 0; i < points.length; i++) {
//             vertices[i * 3] = points[i][0];
//             vertices[i * 3 + 1] = points[i][1];
//             vertices[i * 3 + 2] = points[i][2];
//         }

        
//         // create a new BufferGeometry and set the vertices attribute
//         let regionGeo = new THREE.BufferGeometry();
//         regionGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
//         regionGeo.setIndex(new THREE.BufferAttribute(indices, 1));
        
//         // const shape = new THREE.Shape();
//         // shape.moveTo(vertices[0], vertices[1]);
//         // for (var i = 1; i<points.length; i++) {
//         //     shape.lineTo(vertices[i*3],vertices[i*3+1])
//         // }
//         // shape.closePath();

//         const regionLine = new THREE.Mesh(regionGeo, regionMaterial);
//         regionGeo.computeVertexNormals()
//         renderedRegions.add(regionLine)
//     }
//     currentPartition['renderedRegions'] = renderedRegions;
// }

function calculateBoxDimensions(points) {
    const squarecorner = points[0];
    let x, y; 
    if(points[1][0]==squarecorner[0]){
        x = (squarecorner[0]-points[2][0])
        y = (squarecorner[1]-points[1][1])
    } else {
        x = (squarecorner[0]-points[1][0])
        y = (squarecorner[1]-points[2][1])
    }

    const centroid = new THREE.Vector3(squarecorner[0]-x/2,squarecorner[1]-y/2,5);

    return [centroid, Math.abs(x), Math.abs(y)];
}

export function drawPartition(currentIndex) {
    const currentPartition = partitionCache[degSetIndex][currentIndex];
    const regions = currentPartition['regions'];
    const colors = currentPartition['colors'];
    const colorList = ['DarkRed', 'Firebrick', 'Crimson', 'IndianRed'];

    let renderedRegions = new THREE.Group();
    
    for (let j = 0; j < regions.length; j++) {
        let points = regions[j];
        const regionMaterial = new THREE.MeshBasicMaterial({ color: colorList[colors[j]] });

        const dimensions = calculateBoxDimensions(points)
        const boxGeo =  new THREE.BoxGeometry(dimensions[1],dimensions[2],5, 3, 3, 3)
        boxGeo.computeVertexNormals();
        // Create a mesh using the box geometry and material
        const boxMesh = new THREE.Mesh(boxGeo, regionMaterial);
        boxMesh.position.copy(dimensions[0])
        // Add the box to the group
        renderedRegions.add(boxMesh);
    }

    currentPartition['renderedRegions'] = renderedRegions;
}

export async function switchDegSet(index) {
    degSetIndex = index;
    currentIndex = 0;
    await showPartition(0);
}

// export function zoomToFit() {
//     const canvasWidth = parseInt(canvas.style.width);
//     const canvasHeight = parseInt(canvas.style.height);
//     canvas.width = canvasWidth;
//     canvas.height = canvasHeight;
//     renderer.setSize(canvasWidth, canvasHeight);


//     camera.aspect = canvasWidth / canvasHeight;

//     camera.updateProjectionMatrix();

//     const box = new THREE.Box3().setFromObject(curves);
//     const center = box.getCenter(new THREE.Vector3());
//     // calculate the distance from the camera to the center of the bounding box
//     const boundingBoxSize = box.getSize(new THREE.Vector3());
//     const maxDim = Math.max(boundingBoxSize.x, boundingBoxSize.y, boundingBoxSize.z)
//     var distance = maxDim / 2 / camera.aspect / Math.tan(Math.PI * camera.fov / 360);
//     // move the camera to the appropriate distance
//     camera.position.set(center.x, center.y, center.z + distance * 2.4);
//     camera.lookAt(center);
// }

// export function zoomCameraToSelection(camera, controls, fitOffset = 1.5) {
//     const box = new THREE.Box3();
//     const regions = partitionCache[degSetIndex][currentIndex]['renderedRegions']
//     box.setFromObject(regions)
//     const size = box.getSize(new THREE.Vector3());
//     const center = box.getCenter(new THREE.Vector3());
  
//     const maxSize = Math.max(size.x, size.y, size.z);
//     const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.fov / 360));
//     const fitWidthDistance = fitHeightDistance / camera.aspect;
//     const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);
  
//     const direction = controls.target.clone()
//       .sub(camera.position)
//       .normalize()
//       .multiplyScalar(distance);
//     controls.maxDistance = distance * 10;
//     controls.target.copy(center);
  
//     camera.near = distance / 100;
//     camera.far = distance * 100;
//     camera.updateProjectionMatrix();
//     camera.position.copy(controls.target).sub(direction);
  
//     controls.update();
  
//   }


