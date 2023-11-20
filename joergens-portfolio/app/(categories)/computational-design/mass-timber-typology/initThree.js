'use client'
import * as THREE from 'three';
import { ArcballControls } from 'three/addons/controls/ArcballControls.js';
import { Rhino3dmLoader } from 'three/examples/jsm/loaders/3DMLoader';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import rhino3dm from 'rhino3dm';
import { PMREMGenerator } from 'three/src/extras/PMREMGenerator.js'; // Import PMREMGenerator
import { onMouseMove, onClick, removeCassette, removeUnit, setFullOpacity } from './interact.js'

// import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
export var scene, camera, renderer, controls
let exrCubeRenderTarget;

let rhino;

const origin = new THREE.Vector3(0,0,0)


const loader = new Rhino3dmLoader()
loader.setLibraryPath("https://cdn.jsdelivr.net/npm/rhino3dm@8.0.0/")
// const ambientLight = new THREE.AmbientLight(0xCD7F32, 0.2); // Color, Intensity

export async function init() {
  rhino = await rhino3dm();
  // Create the scene, camera, and renderer
  scene = new THREE.Scene();

  const container = document.getElementById('canvas-container');
  let width = container.clientWidth;
  let height = container.clientHeight;

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: document.getElementById('canvas') });
  renderer.setSize(width, height);

  function updateCanvasSize() {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    renderer.setSize(containerWidth, containerHeight);
    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();
  }

  updateCanvasSize();
  window.addEventListener('resize', updateCanvasSize, false);

  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.useLegacyLights = false;

  const pmremGenerator = new PMREMGenerator(renderer);
  pmremGenerator.compileCubemapShader();

  const exrCubeRenderTargetPromise = new Promise((resolve, reject) => {
    new EXRLoader().load('/textures/kloofendal/studioSmall.exr', function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
      resolve(); // Resolve the promise when the loading is complete
    });
  });


  await exrCubeRenderTargetPromise;
  camera.position.set(0, 0, 50);
  camera.up.set(0,1,0)
  camera.lookAt(new THREE.Vector3(0,0,0))
  renderer.toneMappingExposure = 1.0;
  controls = new ArcballControls(camera, renderer.domElement);
  controls.enableRotate = true;
  controls.cursorZoom = true;
  controls.enablePan = true;
  controls.rotateSpeed = 0.2;
  // controls.enableZoom = true;
  controls.update();
  controls.saveState();
  animate()
}

function animate() {
  requestAnimationFrame(animate)

  // controls.target.copy(sceneCenter)
  // controls.update()
  // camera.lookAt(sceneCenter)
  renderer.render(scene, camera)
}

export function createListeners(){
  if(renderer){
  renderer.domElement.addEventListener('mousemove', onMouseMove);
  renderer.domElement.addEventListener('mouseup', onClick);
  document.addEventListener('keydown', function(event) {
    if (event.key === 'o' || event.key === 'O') {
      removeCassette();
    }
    if (event.key === 'r' || event.key === 'R') {
      removeUnit();
    }
  })
}
}

export function removeListeners(){
  if(renderer){
  renderer.domElement.removeEventListener('mousemove', onMouseMove);
  renderer.domElement.removeEventListener('mouseup', onClick);
  document.removeEventListener('keydown', function(event) {
    if (event.key === 'o' || event.key === 'O') {
      removeCassette();
    }
    if (event.key === 'r' || event.key === 'R') {
      removeUnit();
    }
  })
}
}

// function onWindowResize() {
//   camera.aspect = window.innerWidth / window.innerHeight
//   camera.updateProjectionMatrix()
//   animate()
// }

export async function compute(paramValues, displayValues, points=[origin], scenery=new THREE.Group()) {
  let data = JSON.stringify({ values: paramValues, bucketKey: 'clt-typology-refactored.gh' })
  try {
    const response = await fetch('/api/loadGrasshopper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data
    });
    const responseData = await response.text();
    const responseJson = JSON.parse(responseData);
    return (await collectResults(responseJson, paramValues, displayValues, points, scenery));
  } catch (error) {
    console.error(error);
    return true;
  }
};


let doc = []
let indices

/**
 * Parse response
 */

export async function collectResults(responseJson, paramValues, displayValues, points, scenery) {
  const values = responseJson.values
  indices = Array.from({ length: Object.keys(values[0].InnerTree).length }, () => [])
  if (rhino == undefined) {
    rhino = await rhino3dm();
  }
  doc = Array.from({ length: Object.keys(values[0].InnerTree).length }, () => new rhino.File3dm());

  // for each output (RH_OUT:*)...
  let sum = Array.from({ length: Object.keys(values[0].InnerTree).length }, () => []);
  let str = ""
  for (let i = 0; i < values.length; i++) {
    str += '{\n\"ParamName\": \"' + values[i].ParamName + '\",\n\"InnerTree\":\n{'
    // ...iterate through data tree structure... 
    const paths = Object.keys(values[i].InnerTree);
   
    if(paths.length == 0){
      for(let j = 0; j<indices.length; j++){
        if(indices[j].length>0){
          indices[j].push(indices[j][indices[j].length-1]);
        } else {
          indices[j].push(0);
        }
        sum[j].push(0)
      }
    }

    for (let p = 0; p < paths.length; p++) { //const path in values[i].InnerTree) {
      str += '\"' + paths[p] + '\": \n['
      const branch = values[i].InnerTree[paths[p]]
      // ...and for each branch...
      if(isNaN(branch.length)){
        sum[p].push(0)
      } else {
        sum[p].push(branch.length)
      }

      if(i==0){
        indices[p].push(sum[p][i]);
      } else {
        indices[p].push(sum[p][i]+indices[p][i-1]);
      }
     
      for (let j = 0; j < branch.length; j++) {
        str += '{\n\"type\":\"' + branch[j].type + '\",\n\"data\":' + '\'' + 'branch[j].data' + '\'' + '\n},'
        // ...load rhino geometry into doc
        const rhinoObject = decodeItem(branch[j])
        if (rhinoObject !== null) {
          doc[p].objects().add(rhinoObject, null)
        }
      }
      str += '\n],'
    }
    str += '}\n},'
  }
  if (doc[0].objects().count < 1) {
    console.error('No rhino objects to load!')
    throw new Error('No rhino objects to load!');
  }
  // await clearScene();
  await rhinoToThree(paramValues, displayValues, points, scenery);
  
  return false;
}

async function loadTexture(url) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(url, resolve, undefined, reject);
  });
}

async function loadRhinoModel(p) {
  const buffer = new Uint8Array(doc[p].toByteArray()).buffer
  return new Promise((resolve, reject) => {
    loader.parse(buffer, function (object) {
      resolve(object)
    }, reject)
  });
}

function createMaterial(color, texture, rotate, polygonOffset, displayType) {
  let materialTexture = texture
  materialTexture.repeat.set(0.5, 0.5);
  materialTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  if (rotate) {
    materialTexture = texture.clone();
    materialTexture.rotation = Math.PI / 2;
  }
  const material = new THREE.MeshStandardMaterial({
    color: color,
    map: materialTexture,
    envMap: exrCubeRenderTarget.texture,
    metalness: 0,
    roughness: 1,
    flatShading: false,
    envMapIntensity: 0.75,
    emissive: '#000000',
    emissiveIntensity: 0.5,
    transparent: true,
  });
  
  if (polygonOffset) {
    material.polygonOffset = true;
    material.polygonOffsetFactor = -4;
    material.polygonOffsetUnits = 1;
  }

  if (displayType === 'Wireframe') {
    material.wireframe = true;
  } else if (displayType === 'Shaded') {
    material.opacity = 0.6;

    if(material.color.equals(new THREE.Color('#918391'))){
      material.depthTest = false; 
    }
  }

  return material;
}

function cloneGroup(original){
    var clonedGroup = new THREE.Group();

    // Clone objects from the base group and add them to the cloned group
    original.children.forEach(function(child) {
        var clonedObject = child.clone();
        var clonedMaterial = child.material.clone();
        clonedObject.material = clonedMaterial
        clonedGroup.add(clonedObject);
    });
    return clonedGroup;
}
export async function rhinoToThree(paramValues, displayValues, points=[origin], scenery=new THREE.Group()) {
  scene = new THREE.Scene();
  if(scenery.children.length>0){
    scene.add(scenery)
  }
  let color; 
  if(displayValues['displayType']==='Wireframe'){
    // color = ['blue', 'grey', 'green', 'pink', 'red']
    color = ['#617d6e','#617d6f','#6f617d','#7d6f61','#617d6f']
  } else if(displayValues['displayType']==='Shaded'){
    color = ['#acc8bb','#acc8ba','#918391','#7d6f61','#acc8ba']
  } else {
    color = ['#d1c3ac','#d1c3ab','#e4ddc4','#e4ddc3','#d1c3ab']
  }

  if(displayValues['displayType']==='Shaded'){
    setFullOpacity(0.6)
  } else {
    setFullOpacity(1)
  }
  let CLTtexture = await loadTexture('/textures/clt_fir.jpg');
  
  let materialColor = 'purple'

  for(let p = 0; p < doc.length; p++){
  let object = await loadRhinoModel(p);
  let base = new THREE.Group()
  let baseSkirt = new THREE.Group()
  let angle = new THREE.Group()
  let angleSkirt = new THREE.Group()
  for (let j = 0; j < object.children.length; j++) {
    let polygonOffset = false;
    let rotate = false;

    let child = object.children[j]
    if (j < indices[p][0]) {
      materialColor = color[0]
      rotate = true;
    } else if (j < indices[p][1]) {
      materialColor = color[1]
      rotate = true;
    } else if (j < indices[p][2]) {
      materialColor = color[2]
    } else if (j < indices[p][3]) {
      materialColor = color[3]
    } else if (j < indices[p][4]) {
      materialColor = color[4]
      rotate = true;
    } else if (j < indices[p][5]) {
      materialColor = color[0]
    } else if (j < indices[p][6]) {
      materialColor = color[2]
    } else if (j < indices[p][7]) {
      materialColor = color[3]
    } else if (j < indices[p][8]) {
      materialColor = color[4]
      polygonOffset = true;
    } else if (j < indices[p][9]) {
      materialColor = color[1]
    } else if (j < indices[p][10]) {
      materialColor = color[0]
    } else if (j < indices[p][11]) {
      materialColor = color[0]
    }
    if (displayValues['displayType'] === 'Wireframe') {
      child.material = new THREE.LineBasicMaterial({ color: materialColor, transparent: true, opacity: 1.0})
      let edges = null
      edges = new THREE.EdgesGeometry(child.geometry)
      if (j < indices[p][4]) {
        base.add(new THREE.LineSegments(edges, child.material))
      } else if (j < indices[p][9]){
        angle.add(new THREE.LineSegments(edges, child.material))
      } else if(j < indices[p][10]){
        baseSkirt.add(new THREE.LineSegments(edges, child.material))
      } else if(j < indices[p][11]){
        angleSkirt.add(new THREE.LineSegments(edges, child.material))
      }
    } else {
      child.material = createMaterial(materialColor, CLTtexture, rotate, polygonOffset, displayValues['displayType'])
      if (j < indices[p][4]) {
        base.add(child.clone())
      } else if(j < indices[p][9]){
        angle.add(child.clone())
      } else if (j < indices[p][10]) {
        baseSkirt.add(child.clone())
      } else if(j < indices[p][11]){
        angleSkirt.add(child.clone())
      }
    }

  }

  const U = displayValues['Grid Width'][p]
  const V = displayValues['Grid Length'][p]
  
  for (let i = 0; i < U; i++) {
    for (let j = 0; j < V; j++) {
      for (let k = 0; k < displayValues['Stories']; k++) {
        let gridObject
        if ((i + j) % 2 == 0) {
          gridObject = cloneGroup(base)
          if(i==0){
            gridObject.add(baseSkirt.children[0].clone())
          } 
          if(i==U-1){
            gridObject.add(baseSkirt.children[1].clone())
          }
          if(j==0){
            gridObject.add(baseSkirt.children[3].clone())
          } 
          if(j==V-1){
            gridObject.add(baseSkirt.children[2].clone())
          }
        } else {
          gridObject = cloneGroup(angle)
          if(i==0){
            gridObject.add(angleSkirt.children[2].clone())
          } 
          if(i==U-1){
            gridObject.add(angleSkirt.children[3].clone())
          }
          if(j==0){
            gridObject.add(angleSkirt.children[0].clone())
          } 
          if(j==V-1){
            gridObject.add(angleSkirt.children[1].clone())
          }
        }
        gridObject.position.x += points[p].x + i * paramValues['Unit Width'][p] - Math.sqrt(2)*i
        gridObject.position.y += points[p].y + j * paramValues['Unit Length'][p] - Math.sqrt(2)*j
        gridObject.position.z += points[p].z + (k+1) * paramValues['Story Height']
        scene.add(gridObject)
      }
    }
  }
}

  zoomCameraToSelection(camera, controls, scene)
  // // console.log('scenepostzoom:',scene)
  // var sceneJSON = JSON.stringify(building.toJSON());
  // console.log(sceneJSON)
  // Save the JSON data to a file or store it where you need
  // For example, you can use localStorage to store it locally

}


/**
 * Attempt to decode data tree item to rhino geometry
 */
function decodeItem(item) {
  const data = JSON.parse(item.data)
  if (item.type === 'System.String') {
    // hack for draco meshes
    try {
      return rhino.DracoCompression.decompressBase64String(data)
    } catch { } // ignore errors (maybe the string was just a string...)
  } else if (typeof data === 'object') {
    return rhino.CommonObject.decode(data)
  }
  return null
}


function animateRotation(ztarget, ytarget) {
  const zstep = (camera.position.z-ztarget)/5
  const ystep = (camera.position.y+ytarget)/5
  // Render the scene
  camera.position.z-=zstep
  camera.position.y-=ystep
  controls.update()
  renderer.render(scene, camera);

  // Continue the animation until the desired rotation is achieved
  if (Math.abs(camera.position.z - ztarget)>1) {
    requestAnimationFrame(function () {
      animateRotation(ztarget, ytarget);
    })
  }
}

/**
 * Helper function that behaves like rhino's "zoom to selection", but for three.js!
 */
export function zoomCameraToSelection(camera, controls, selection, fitOffset = 1.4, offsetY = 0) {
  const box = new THREE.Box3();
  for(let i = 0; i<selection.children.length; i++){
    const child = selection.children[i]
    if(child instanceof THREE.Group){
      box.expandByObject(child);
    }
  }
  // const helper = new THREE.Box3Helper(box)
  // scene.add(helper)
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z);
  const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.fov / 360));
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);
  // controls.target.copy(center)

  const direction = center.clone()
  .sub(camera.position)
  .normalize()
  .multiplyScalar(distance);
  controls.maxDistance = distance * 10;
  
  camera.position.copy(center).sub(direction)
  if(offsetY==2){
    camera.position.x=0;
    // camera.position.y=-300;
    // camera.position.z=80;
    animateRotation(80, 300);
  } else if(offsetY==6){
    controls.target.copy(center)
    camera.position.x = center.x; 
    camera.position.y-=100;
    camera.position.z+=15;
  }
  camera.near = distance / 100;
  camera.far = distance * 100;
  
  // camera.position.copy(center).sub(direction);

  // camera.lookAt(center)
  // camera.up = new THREE.Vector3(0,1,0)
  // camera.updateProjectionMatrix();
  controls.camera = camera
  controls.cursorZoom = true;
  controls.update()

  return center;
}