import * as THREE from 'three';
import { renderer, scene, camera } from './initThree.js'

let fullOpacity = 1; 
// Create a raycaster
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var originalMaterials = new Map(); // Map to store original materials of objects
var selectedMaterials = new Map();
var selectedObject = null; 

let mapUpdateCallback;

export const setMapUpdateCallback = (callback) => {
  mapUpdateCallback = callback;
};

export function setFullOpacity(number){
    fullOpacity = number
}

function revert(){
    scene.traverse((object) => {
        if (object.isMesh || object instanceof THREE.LineSegments) {
            if (selectedMaterials.has(object)) {
                object.material.copy(selectedMaterials.get(object));
            } else if (originalMaterials.has(object)) {
                object.material.copy(originalMaterials.get(object))
            }
        }
    });
}
// Update the mouse position when the user moves the cursor
export function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    const rect = renderer.domElement.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / (rect.right - rect.left)) * 2 - 1;
    mouse.y = - ((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;
   

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Perform the raycasting
    var intersects = raycaster.intersectObjects(scene.children, true);
    // Restore original materials for all objects in the scene
    revert();

    // Change color for the intersected objects
    if (intersects.length > 0) {
        selectedObject = intersects[0].object.parent;
        for (let i = 0; i < selectedObject.children.length; i++) {
            const child = selectedObject.children[i];
            if (child.isMesh || child instanceof THREE.LineSegments) {
                // Store the original material if not already stored
                if (!originalMaterials.has(child)) {
                    originalMaterials.set(child, child.material.clone());
                }
                const material = originalMaterials.get(child).clone()
                material.color.set(0xffff00);
                material.opacity = 0.5
                child.material = material
            }
        }
        renderer.render(scene, camera)
    } else {
        selectedObject = null
    }
}

export function onClick() {
    let unselect = false; 
    if(selectedObject){
        if(selectedMaterials.has(selectedObject.children[0])){
            unselect = true;
        }
        for (let i = 0; i < selectedObject.children.length; i++) {
            const child = selectedObject.children[i];
            if(unselect){
                child.material = originalMaterials.get(child).clone()
                selectedMaterials.delete(child)
            } else {
                if (child.isMesh || child instanceof THREE.LineSegments) {
                    child.material.color.set(0x800080);
                    child.material.opacity = 0.5;
                    child.material.polygonOffset = true;
                    child.material.polygonOffsetFactor = 4;
                    child.material.polygonOffsetUnits = 1;
                }
                selectedMaterials.set(child, child.material.clone())
            }
        }
        mapUpdateCallback(selectedMaterials);
        renderer.render(scene, camera)
    } 
}

export function removeCassette(){
    const objectList = [...selectedMaterials.keys()];
    const structBeam = {
        'textured' : new THREE.Color('#d1c3ab'),
        'shaded' : new THREE.Color('#acc8ba'),
        'wireframe' : new THREE.Color('#617d6f'),
    }
    const panelColor = new THREE.Color('#918391')

    let opacitySum =  0; 

    for(let i = 0; i < objectList.length; i++){
        const child = objectList[i];
        opacitySum += originalMaterials.get(child).opacity
    }
    for(let i = 0; i < objectList.length; i++){
        const child = objectList[i]
        let material = originalMaterials.get(child).clone()

        const colorMatch = material.color.equals(structBeam['textured']) 
        || material.color.equals(structBeam['shaded']) 
        || material.color.equals(structBeam['wireframe'])

        if(opacitySum==0){
            if(colorMatch){
                material.opacity = fullOpacity;
                material.depthWrite = true; 
            }
        } else {
            if(!colorMatch){
                if(material.opacity==0){
                    material.opacity = fullOpacity
                    if(fullOpacity<1 && material.color.equals(panelColor)){
                        material.depthWrite = false;
                    } else {
                        material.depthWrite = true; 
                    }
                } else {
                    material.opacity = 0
                    material.depthWrite = false; 
                }
            }
        }
        child.material = material; 
        originalMaterials.set(child, material)
    }
    selectedMaterials.clear()
    mapUpdateCallback(selectedMaterials);
    revert();
    renderer.render(scene, camera)
}

export function removeUnit(){
    const objectList = [...selectedMaterials.keys()];
    let opacitySum =  0; 
    for(let i = 0; i < objectList.length; i++){
        const child = objectList[i];
        opacitySum += originalMaterials.get(child).opacity
    }

    for(let i = 0; i < objectList.length; i++){
        const child = objectList[i]
        let material = originalMaterials.get(child).clone()
        if(opacitySum==0){
            material.opacity = fullOpacity
            material.depthWrite = true;
        } else {
            material.opacity = 0
            material.depthWrite = false;
        }
        child.material = material; 
        originalMaterials.set(child, material)
    }
    selectedMaterials.clear()
    mapUpdateCallback(selectedMaterials);
    revert();
    renderer.render(scene, camera)
}
