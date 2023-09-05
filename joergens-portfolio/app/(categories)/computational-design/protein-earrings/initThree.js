'use client'
import * as THREE from 'three';
import { ArcballControls } from 'three/addons/controls/ArcballControls.js';
import { Rhino3dmLoader } from 'three/examples/jsm/loaders/3DMLoader';
// import { HDRCubeTextureLoader } from 'three/addons/loaders/HDRCubeTextureLoader.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import rhino3dm from 'rhino3dm';
import { PMREMGenerator } from 'three/src/extras/PMREMGenerator.js'; // Import PMREMGenerator
import { render } from 'react-dom';

// import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
export var scene, camera, renderer, controls
let exrCubeRenderTarget;

let rhino;

const loader = new Rhino3dmLoader()
loader.setLibraryPath("https://cdn.jsdelivr.net/npm/rhino3dm@8.0.0/")
const ambientLight = new THREE.AmbientLight(0xCD7F32, 0.2); // Color, Intensity

export async function init(canvas) {
  rhino = await rhino3dm();
  // Create the scene, camera, and renderer
  scene = new THREE.Scene();

  const container = document.getElementById('canvas-container');
  let width = container.clientWidth;
  let height = container.clientHeight;

  // console.log(width)

  camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: document.getElementById('canvas') });
  renderer.setSize(width, height);

  function updateCanvasSize() {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    renderer.setSize(containerWidth,containerHeight);
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

  // const hdrUrls = ['mistyMorning.exr'];
  // const hdrPath = path.join(process.cwd(), 'textures/kloofendal/');
  // hdrCubeMap = new THREE.CubeTextureLoader().setPath(hdrPath).load(hdrUrls, function () {
  //   hdrCubeRenderTarget = pmremGenerator.fromCubemap(hdrCubeMap);
  //   hdrCubeMap.magFilter = THREE.LinearFilter;
  //   hdrCubeMap.needsUpdate = true;
  // });

  new EXRLoader().load('/textures/kloofendal/studioSmall.exr', function (texture) {

    texture.mapping = THREE.EquirectangularReflectionMapping;

    exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
    // exrBackground = texture;

  });


  // const pmremGenerator = new THREE.PMREMGenerator(renderer);
  // pmremGenerator.compileCubemapShader();
  scene.add(ambientLight);
  camera.position.set(0, 0, 50);
  camera.lookAt(0, 0, 0);
  renderer.toneMappingExposure = 1.0;
  controls = new ArcballControls(camera, renderer.domElement);
  controls.enableRotate = true;
  controls.cursorZoom = false;
  controls.enableGrid = true;
  controls.enablePan = false;
  controls.enableZoom = true;
  // window.addEventListener('resize', onWindowResize, false)

  animate()
}

function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

// function onWindowResize() {
//   camera.aspect = window.innerWidth / window.innerHeight
//   camera.updateProjectionMatrix()
//   animate()
// }

export async function compute(values, displayParams) {
  let data = JSON.stringify({ values: values })
  try {
    const response = await fetch('/api/loadGrasshopper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data
    });
    const responseData = await response.text();
    const responseJson = JSON.parse(responseData);
    return (await collectResults(responseJson, displayParams));
  } catch (error) {
    console.error(error);
    return true;
  }
};


let doc
/**
 * Parse response
 */
export async function collectResults(responseJson, displayParams) {

  const values = responseJson.values
  //clear doc
  if (doc != undefined) {
    doc = null;
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

export async function rhinoToThree(displayParams) {
  // load rhino doc into three.js scene
  if (doc) {
    const buffer = new Uint8Array(doc.toByteArray()).buffer
    loader.parse(buffer, function (object) {
      console.log('object:', object)
      let material = new THREE.MeshStandardMaterial({
        color: displayParams['Color'],
        envMap: exrCubeRenderTarget.texture,
        metalness: displayParams['Reflectivity'],
        roughness: displayParams['Roughness'],
        flatShading: false,
        envMapIntensity: 1.0
      });

      // console.log(object);
      object.traverse(child => {
        if (child.material)
          child.material = material;
        // child.material.flatShading = false;
      }, false);

      // console.log(scene)
      // clear objects from scene. do this here to avoid blink
      // if (scene) {
      //   scene.traverse(child => {
      //     console.log('type:',child.type)
      //     // if (!child.isLight && child.name !== 'context') {
      //       if(child.type=='Mesh' || child.type=='Object3D')
      //       console.log('removing:',child)
      //       scene.remove(child)
      //     // }
      //   })
      // }

      const boundingBox = new THREE.Box3();
      boundingBox.setFromObject(object.children[0], true);
      const width = boundingBox.max.x - boundingBox.min.x;
      object.position.x = 0;
      const duplicateObject = object.clone();
      duplicateObject.scale.x = -1; // Flip horizontally
      duplicateObject.position.x = width * 2; // Move it to the right
      // add object graph from rhino model to three.js scene
      scene = new THREE.Scene();
      scene.add(ambientLight)
      scene.add(object);
      scene.add(duplicateObject);
      console.log(scene);

      // zoom to extents
      zoomCameraToSelection(camera, controls, scene.children)
    }, function (error) {
      // Error callback
      console.error(error);
    })
  }
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

