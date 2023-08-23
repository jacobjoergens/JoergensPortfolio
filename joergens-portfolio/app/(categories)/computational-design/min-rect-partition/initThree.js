'use client'
import * as THREE from 'three';
import { ArcballControls } from 'three/addons/controls/ArcballControls.js';
import styles from 'styles/pages/computational.module.css'
export var scene, camera, renderer, controls


export async function init() {
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
    const canvas = document.getElementById('canvas');
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: canvas });
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(canvas.offsetWidth,  canvas.offsetHeight)
    // document.body.appendChild(renderer.domElement)
    // const layer_meshes = new rhino.Layer()
    // layer_meshes.name = 'Meshes'
    // layer_meshes.color = { r: 255, g: 255, b: 0, a: 255 }
    // doc.layers().add( layer_meshes )

    camera.position.set(0, 0, 50);
    camera.lookAt(0, 0, 0);
    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(0,1,0)
    scene.add( light )

    // add some controls to orbit the camera
    controls = new ArcballControls(camera, renderer.domElement);
    controls.enableRotate = false; 
    controls.cursorZoom = true;
    controls.enableGrid = true;
    window.addEventListener('resize', onWindowResize, false)
    animate()
}

function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    animate()
}