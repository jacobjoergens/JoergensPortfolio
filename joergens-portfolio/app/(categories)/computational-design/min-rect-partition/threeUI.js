import * as THREE from 'three'
import { scene, camera, renderer, controls } from './initThree.js'
import { onMouseMove, onMouseDown, onMouseUp, curves } from './drawCurve.js';
import { stagePartitioning, getPartition } from './page.tsx';

let partitionCache = {}
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

export async function createListeners(setMessage) {
    console.log("running");
    // showSpinner(false);
    renderer.domElement.addEventListener('click', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    // renderer.domElement.addEventListener('wheel', zoomToMouse);
    //computeButton.onclick = compute

    document.getElementById('computeButton').addEventListener('click', async function () {
        
        partitionCache = {}
        activePartition = null
        currentIndex = 0 
        lengthDegSet = 0
        degSetIndex = 0
        await stagePartitioning();
        // scene.add(activePartition);
        zoomToFit(canvas);
        setMessage('applied');

        // console.log('setmsg:',setMessage('applied'))
        // await setMessage('applied');
    });
}

export async function showPartition(direction) {
    if(activePartition){
        scene.remove(activePartition)
    }
    if(degSetIndex in partitionCache){
        currentIndex = (currentIndex + direction) % partitionCache[degSetIndex][0]['numNonDegParts'].length;
        if(!(currentIndex in partitionCache[degSetIndex])){
            await getPartition(partitionCache, degSetIndex, currentIndex);
            drawPartition(currentIndex);
        }
    } else {
        currentIndex = 0;
        partitionCache[degSetIndex] = {};
        await getPartition(partitionCache, degSetIndex, currentIndex);
        drawPartition(currentIndex);
    }
    activePartition = partitionCache[degSetIndex][currentIndex]['renderedRegions'];
    scene.add(activePartition);
    // scene.add(partitionCache[degSetIndex][currentIndex]['renderedRegions'])
}

export function drawPartition(currentIndex) {
    const currentPartition = partitionCache[degSetIndex][currentIndex];
    const regions = currentPartition['regions'];
    const colors = currentPartition['colors'];
    const indices = new Uint16Array([
        0,1,2, //triangle 1
        0,2,3, //triangle 2
    ]);

    const colorList = ['DarkRed','Firebrick','Crimson','IndianRed'];
    
    let renderedRegions = new THREE.Group();
    for (let j = 0; j < regions.length; j++) {
        let points = regions[j]
        const regionMaterial = new THREE.MeshBasicMaterial({ color: colorList[colors[j]] });
        // create a new Float32Array with the point data
        let vertices = new Float32Array(points.length * 3);
        for (var i = 0; i < points.length; i++) {
            vertices[i * 3] = points[i][0];
            vertices[i * 3 + 1] = points[i][1];
            vertices[i * 3 + 2] = points[i][2];
        }

        
        // create a new BufferGeometry and set the vertices attribute
        let regionGeo = new THREE.BufferGeometry();
        regionGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        regionGeo.setIndex(new THREE.BufferAttribute(indices, 1));

        const shape = new THREE.Shape();
        shape.moveTo(vertices[0], vertices[1]);
        for (var i = 1; i<points.length; i++) {
            shape.lineTo(vertices[i*3],vertices[i*3+1])
        }
        shape.closePath();

        // create a ShapeGeometry from the shape and buffer geometry
        const shapeGeometry = new THREE.ShapeGeometry(shape, 1);
        const regionLine = new THREE.Mesh(regionGeo, regionMaterial);
        regionGeo.computeVertexNormals()
        renderedRegions.add(regionLine)
    }
    currentPartition['renderedRegions'] = renderedRegions;
}

export async function switchDegSet(index) {
    degSetIndex = index;
    currentIndex = 0;
    await showPartition(0);
}

// export function addFigures(figures) {
//     lengthDegSet = figures.length;
//     addCarouselHandlers();
//     for (var i = 0; i < figures.length; i++) {
//         // Create an image element with the base64-encoded image
//         const src = "data:image/svg+xml;base64," + figures[i]
//         // var img = $("<img>").attr("src", src);
//         // Add the image to the carousel
//         addFigure(src, "Bipartite Figure " + (i + 1), (i == 0));
//     }

//     var carousel = $(".carousel");
//     var carouselHeight = carousel.outerHeight();
//     var carouselWidth = carousel.outerWidth();
//     $(".carousel-inner").css({ "height": carouselHeight, "width": carouselWidth });
//     $(".carousel").css("display", "block");

//     let canvas_container = $('canvas-container');
//     let carousel_container = $('carousel-container');
//     canvas_container.classList.remove('col-12');
//     canvas_container.classList.add('col-md-8');
//     carousel_container.classList.remove('col-0');
//     carousel_container.classList.add('col-md-4');
//     let canvas = $('mainCanvas');
//     canvas.height = canvas_container.offsetHeight;
//     canvas.width = canvas_container.offsetWidth;
//     zoomToFit(canvas, controls);
// }

// function addFigure(src, alt, active) {
//     // Create an indicator
//     var indicator = $("<li></li>").attr("data-target", "#myCarousel").attr("data-slide-to", $(".carousel-indicators li").length);
//     if (active) {
//         indicator.addClass("active");
//     }
//     $(".carousel-indicators").append(indicator);

//     // Create an SVG slide
//     var slide = $("<div></div>").addClass("carousel-item").attr("height", $(".carousel").height()).attr("width", $(".carousel").width());
//     if (active) {
//         slide.addClass("active");
//     }
//     var aspectRatio = $(".carousel").width() / $(".carousel").height();
//     var svg = $("<svg></svg>")
//         .attr("viewBox", "0 0 " + aspectRatio + " 1")
//         .attr("preserveaspectratio", "xMidYMid meet")
//         .attr("xmlns", "http://www.w3.org/2000/svg")
//         .attr("height", $(".carousel").height()).attr("width", $(".carousel").width());
//     var img = $("<img>").attr("src", src).attr("height", $(".carousel").height()).attr("width", $(".carousel").width());
//     svg.append(img)
//     slide.append(svg);

//     $(".carousel-inner").append(slide);
// }

// function addCarouselHandlers() {
//     // Handle the click event for the previous arrow
//     $(".carousel-control-prev").click(function (event) {
//         degSetIndex = (degSetIndex - 1) % lengthDegSet;
//         switchDegSet();
//         event.preventDefault();
//         var $activeItem = $(".carousel-item.active");
//         var $prevItem = $activeItem.prev(".carousel-item");
//         if (!$prevItem.length) {
//             $prevItem = $(".carousel-item:last");
//         }
//         $activeItem.removeClass("active");
//         $prevItem.addClass("active");

//         var $activeIndicator = $(".carousel-indicators li.active");
//         var $prevIndicator = $activeIndicator.prev();
//         if (!$prevIndicator.length) {
//             $prevIndicator = $(".carousel-indicators li:last");
//         }
//         $activeIndicator.removeClass("active");
//         $prevIndicator.addClass("active");
//     });

//     // Handle the click event for the next arrow
//     $(".carousel-control-next").click(function (event) {
//         degSetIndex = (degSetIndex + 1) % lengthDegSet;
//         switchDegSet();
//         event.preventDefault();
//         var $activeItem = $(".carousel-item.active");
//         var $nextItem = $activeItem.next(".carousel-item");
//         if (!$nextItem.length) {
//             $nextItem = $(".carousel-item:first");
//         }
//         $activeItem.removeClass("active");
//         $nextItem.addClass("active");

//         var $activeIndicator = $(".carousel-indicators li.active");
//         var $nextIndicator = $activeIndicator.next();
//         if (!$nextIndicator.length) {
//             $nextIndicator = $(".carousel-indicators li:first");
//         }
//         $activeIndicator.removeClass("active");
//         $nextIndicator.addClass("active");
//     });
// }

export function zoomToFit() {
    const canvasWidth = parseInt(canvas.style.width);
    const canvasHeight = parseInt(canvas.style.height);

    renderer.setSize(canvasWidth, canvasHeight);

    camera.aspect = canvasWidth / canvasHeight;

    camera.updateProjectionMatrix();

    const box = new THREE.Box3().setFromObject(curves);
    const center = box.getCenter(new THREE.Vector3());
    // calculate the distance from the camera to the center of the bounding box
    const boundingBoxSize = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(boundingBoxSize.x, boundingBoxSize.y, boundingBoxSize.z)
    console.log('BBox:',boundingBoxSize)
    var distance = maxDim / 2 / camera.aspect / Math.tan(Math.PI * camera.fov / 360);
    console.log('distance:',maxDim,camera.aspect,camera.fov, distance)
    // move the camera to the appropriate distance
    camera.position.set(center.x, center.y, center.z + distance * 2.4);
    camera.lookAt(center);
}

// function zoomCameraToSelection( camera, controls, selection, fitOffset = 1.2 ) {
  
//     const box = new THREE.Box3();
    
//     selection.traverse(function(object){
//         console.log(object)
//         box.expandByObject( object );
//     })
//     // for( const object of selection ) {
//     //   if (object.isLight) continue
//     //   box.expandByObject( object );
//     // }
    
//     const size = box.getSize( new THREE.Vector3() );
//     const center = box.getCenter( new THREE.Vector3() );
    
//     const maxSize = Math.max( size.x, size.y, size.z );
//     const fitHeightDistance = maxSize / ( 2 * Math.atan( Math.PI * camera.fov / 360 ) );
//     const fitWidthDistance = fitHeightDistance / camera.aspect;
//     const distance = fitOffset * Math.max( fitHeightDistance, fitWidthDistance );
    
//     const direction = controls.target.clone()
//       .sub( camera.position )
//       .normalize()
//       .multiplyScalar( distance );
//     controls.maxDistance = distance * 10;
//     controls.target.copy( center );
    
//     camera.near = distance / 100;
//     camera.far = distance * 100;
//     camera.updateProjectionMatrix();
//     camera.position.copy( controls.target ).sub(direction);
    
//     controls.update();
    
//   }

