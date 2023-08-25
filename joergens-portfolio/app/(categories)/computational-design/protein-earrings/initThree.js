'use client'
import * as THREE from 'three';
import { ArcballControls } from 'three/addons/controls/ArcballControls.js';
import { Rhino3dmLoader } from 'three/examples/jsm/loaders/3DMLoader';
import { HDRCubeTextureLoader } from 'three/addons/loaders/HDRCubeTextureLoader.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import rhino3dm from 'rhino3dm';

import styles from 'styles/pages/computational.module.css'
// import { rhino } from './page.tsx';
import path from 'path'
import { PMREMGenerator } from 'three/src/extras/PMREMGenerator.js'; // Import PMREMGenerator
import { runCompute } from '@/app/api/loadGrasshopper/route';

// import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
export var scene, camera, renderer, controls, count_slider
let hdrCubeMap, exrCubeRenderTarget;

let rhino; 

const loader = new Rhino3dmLoader()
loader.setLibraryPath("https://cdn.jsdelivr.net/npm/rhino3dm@8.0.0/")

// let light = new THREE.DirectionalLight(0xffffff, 1)

export async function init(canvas) {
  rhino = await rhino3dm(); 
  count_slider = document.getElementById('count')
  // Create the scene, camera, and renderer
  scene = new THREE.Scene();

  let width = 800;
  let height = 600;

  if (typeof window !== 'undefined') {
    // Running in a browser environment
    width = window.innerWidth;
    height = window.innerHeight;
  }

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  // const canvas = document.getElementById('canvas');
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: canvas });
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.useLegacyLights = false;

  const pmremGenerator = new PMREMGenerator(renderer); 
  pmremGenerator.compileCubemapShader();
  
  // const hdrUrls = ['mistyMorning.exr'];
  // const hdrPath = path.join(process.cwd(), 'textures/kloofendal/');
  // hdrCubeMap = new THREE.CubeTextureLoader().setPath(hdrPath).load(hdrUrls, function () {
  //   hdrCubeRenderTarget = pmremGenerator.fromCubemap(hdrCubeMap);
  //   hdrCubeMap.magFilter = THREE.LinearFilter;
  //   hdrCubeMap.needsUpdate = true;
  // });

  new EXRLoader().load( '/textures/kloofendal/studioSmall.exr', function ( texture ) {

    texture.mapping = THREE.EquirectangularReflectionMapping;

    exrCubeRenderTarget = pmremGenerator.fromEquirectangular( texture );
    // exrBackground = texture;

  } );


  // const pmremGenerator = new THREE.PMREMGenerator(renderer);
  // pmremGenerator.compileCubemapShader();

  camera.position.set(0, 0, 50);
  camera.lookAt(0, 0, 0);
  renderer.toneMappingExposure = 1.0;
  controls = new ArcballControls(camera, renderer.domElement);
  controls.enableRotate = true;
  controls.cursorZoom = false;
  controls.enableGrid = true;
  controls.enablePan = false;
  controls.enableZoom = true;
  window.addEventListener('resize', onWindowResize, false)

  animate()
}

function calculateOffsetVector(camera, offsetDistance) {
  const offsetVector = new THREE.Vector3();
  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);
  offsetVector.copy(cameraDirection);
  offsetVector.multiplyScalar(-offsetDistance);
  offsetVector.setY(offsetVector.y + offsetDistance);
  return offsetVector;
}

function animate() {
  requestAnimationFrame(animate)
  // const offsetVector = calculateOffsetVector(camera, 100);
  // light.position.copy(camera.position)
  // light.position.add(offsetVector);
  renderer.render(scene, camera)
  // render();
  
}

function render() {
  torusMesh.material.roughness = params.roughness;
  torusMesh.material.metalness = params.metalness;

  if (hdrCubeRenderTarget) {
    torusMesh.material.envMap = hdrCubeRenderTarget.texture;
    torusMesh.material.needsUpdate = true;
  }

  torusMesh.rotation.y += 0.005;
  planeMesh.visible = params.debug;

  renderer.toneMappingExposure = params.exposure;
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  animate()
}

export async function compute(values, displayParams) {
  // return new Promise(async (resolve, reject) => {
  let data = JSON.stringify(values)
  try {
    // const response = await fetch('/api/loadGrasshopper', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: data
    // });
    // const responseData = await response.text();
    // const responseJson = JSON.parse(responseData);
    const responseJson= runCompute("",values);
    return (await collectResults(responseJson, displayParams));
    // resolve();
  } catch (error) {
    console.error(error);
    return true;
    // return error
  }
  // });
};


let doc
/**
 * Parse response
 */
export async function collectResults(responseJson, displayParams) {

  const values = responseJson.values
  // clear doc
  if (doc != undefined) {
    doc.delete()
  }

  doc = new rhino.File3dm()

  // for each output (RH_OUT:*)...
  for (let i = 0; i < values.length; i++) {
    // ...iterate through data tree structure...
    for (const path in values[i].InnerTree) {
      const branch = values[i].InnerTree[path]
      // ...and for each branch...
      for (let j = 0; j < branch.length; j++) {
        // ...load rhino geometry into doc
        const rhinoObject = decodeItem(branch[j])
        if (rhinoObject !== null) {
          doc.objects().add(rhinoObject, null)
        }
      }
    }
  }

  if (doc.objects().count < 1) {
    console.error('No rhino objects to load!')
    throw new Error('No rhino objects to load!');
  }

  await rhinoToThree(displayParams);

  return false;
}

export async function rhinoToThree(displayParams){
  // load rhino doc into three.js scene
  const buffer = new Uint8Array(doc.toByteArray()).buffer
  loader.parse(buffer, function (object) {
    // debug 
    let material = new THREE.MeshStandardMaterial( {
      color: 0xF7D498, //0xffffff,
      envMap: exrCubeRenderTarget.texture,
      metalness: displayParams['Metalness'],
      roughness: displayParams['Roughness'],
      flatShading: false,
      envMapIntensity: 1.0
    } );

    object.traverse(child => {
      if (child.material)
        child.material = material;
        // child.material.flatShading = false;
    }, false)


    // clear objects from scene. do this here to avoid blink
    scene.traverse(child => {

      if (!child.isLight && child.name !== 'context') {
        scene.remove(child)
      }
    })

    // add object graph from rhino model to three.js scene
    scene.add(object)

    // zoom to extents
    zoomCameraToSelection(camera, controls, scene.children)
  })
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

/**
 * Helper function that behaves like rhino's "zoom to selection", but for three.js!
 */
function zoomCameraToSelection(camera, controls, selection, fitOffset = 1.2) {

  const box = new THREE.Box3();

  for (const object of selection) {
    if (object.isLight) continue
    box.expandByObject(object);
  }

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxSize = Math.max(size.x, size.y, size.z);
  const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.fov / 360));
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);

  const direction = controls.target.clone()
    .sub(camera.position)
    .normalize()
    .multiplyScalar(distance);
  controls.maxDistance = distance * 10;
  controls.target.copy(center);

  camera.near = distance / 100;
  camera.far = distance * 100;
  camera.updateProjectionMatrix();
  camera.position.copy(controls.target).sub(direction);

  controls.update();

}

