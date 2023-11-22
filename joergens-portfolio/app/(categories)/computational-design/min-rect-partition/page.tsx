'use client'
import styles from "styles/pages/minrect.module.css"
import { useRef, useEffect, useState } from "react";
import { createListeners as createSelector, removeListeners as removeSelector } from "../mass-timber-typology/initThree.js";
import { camera, compute, controls, init, zoomCameraToSelection, rhinoToThree, scene } from "../mass-timber-typology/initThree.js";
import { setInitValues, showPartition, switchDegSet, createListeners, removeListeners, lengthDegSet } from "./threeUI.js";
import { removeCassette, removeUnit, setMapUpdateCallback } from '../mass-timber-typology/interact.js';
import GraphCarousel from "@/components/layout/GraphCarousel";
import { ArrowRightIcon, ArrowLeftIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link.js";
import Footer from "@/components/layout/Footer";
import { reset, crvPoints, curves } from "./drawCurve.js";
import { Mdx } from '@/components/mdx-components';
import { allComputationalProjects } from 'contentlayer/generated';
import Spinner from "@/components/layout/Spinner";
import GUI from "@/components/layout/minrectGUI.js";
import dotenv from 'dotenv';
import * as THREE from 'three'

dotenv.config();

interface modelParameters {
    "Unit Width": number[],
    "Unit Length": number[],
    "Story Height": number,
    'Structural': boolean,
}

interface displayParameters {
    "Grid Width": number[],
    "Grid Length": number[],
    "Stories": number,
    'displayType': string,
}

let bipartite_figures: string[] = [];

function getCardinalAbbreviation(number: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const lastDigit = number % 10;
    const secondLastDigit = Math.floor(number / 10) % 10;

    let suffix = suffixes[0]; // Default to 'th'

    // Exceptions for 11th, 12th, 13th
    if (secondLastDigit !== 1) {
        if (lastDigit === 1) {
            suffix = suffixes[1]; // 'st' for 1
        } else if (lastDigit === 2) {
            suffix = suffixes[2]; // 'nd' for 2
        } else if (lastDigit === 3) {
            suffix = suffixes[3]; // 'rd' for 3
        }
    }

    return `${number}${suffix}`;
}

function formatLinkLabel(label: string) {
    const words = label.split(" ");
    return words.join("\n");
}

function calculateMinCells(gridDimension: number, maxCellDimension: number) {
    let i = 1;
    while (true) {
        if (gridDimension / i < maxCellDimension) {
            return i;
        } else {
            i += 1;
        }
    }
}

export default function ProjectPage() {
    const [applied, setApplied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [nonDegIndex, setNonDegIndex] = useState(0);
    const [degIndex, setDegIndex] = useState(0);
    const [groupLength, setGroupLength] = useState(0);
    const prevNonDegRef = useRef<number>(nonDegIndex);
    const [isMounted, setIsMounted] = useState(false);
    const [isDegenerate, setIsDegenerate] = useState(true);
    const [openGraphs, setOpenGraphs] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [openGUI, setOpenGUI] = useState(false);
    const [selectedMaterials, setSelectedMaterials] = useState(0);
    const [generateBuilding, setGenerateBuilding] = useState(true);
    const [generated, setGenerated] = useState(false);
    const [trigger, setTrigger] = useState(false)
    const [showBuilding, setShowBuilding] = useState(true);

    const [paramValues, setParamValues] = useState<modelParameters>({
        'Unit Width': [13],
        'Unit Length': [13],
        'Story Height': 13,
        'Structural': false,
    });

    const [displayValues, setDisplayValues] = useState<displayParameters>({
        'Stories': 3,
        'Grid Width': [3],
        'Grid Length': [3],
        'displayType': 'Textured'
    });

    const [currentPartition, setCurrentPartition] = useState<THREE.Group>()
    const [points, setPoints] = useState<THREE.Vector3[]>([new THREE.Vector3(0, 0, 0)]);

    useEffect(() => {
        const stageThree = async () => {
            await init(); // Call the init function when the component mounts
        }
        stageThree();
        setIsMounted(true);
        handleApply();
    }, []);

    useEffect(() => {        
        function scalePartition() {
            if(currentPartition){
                let minDimension = Infinity
                let scale = 1
                let regions = currentPartition.children as THREE.Mesh[]
                for (let i = 0; i < regions.length; i++){
                    const bufferGeometry = regions[i].geometry as THREE.BoxGeometry;
                    minDimension = Math.min(minDimension, Math.abs(bufferGeometry.parameters.width), Math.abs(bufferGeometry.parameters.height))
                }
                scale = 7/minDimension
                const scaledRegions = currentPartition.clone()
                scaledRegions.scale.set(scale, scale, 1)
                camera.position.z*=scale;
                controls.update()
                setCurrentPartition(scaledRegions);
                return scaledRegions;
            }
            return null
        }
        async function renderBuilding(currentPartition:any) {
            if (currentPartition) {
                let regions = currentPartition.children as THREE.Mesh[]
                let newDisplayValues = displayValues;
                let newParamValues = paramValues;
                let newPoints = points;

                for (let i = 0; i < regions.length; i++) {
                    const bufferGeometry = regions[i].geometry as THREE.BoxGeometry;
                    let bboxWidth = bufferGeometry.parameters.width * currentPartition.scale.x;
                    let bboxLength = bufferGeometry.parameters.height * currentPartition.scale.y;

                    const U = calculateMinCells(Math.abs(bboxWidth), 20);
                    const V = calculateMinCells(Math.abs(bboxLength), 20);

                    const point = regions[i].position.clone();
                    point.x = point.x * currentPartition.scale.x - bboxWidth / 2;
                    point.y = point.y * currentPartition.scale.y - bboxLength / 2;
                    if (bufferGeometry.boundingBox) {
                        point.z = point.z + bufferGeometry.boundingBox.max.z;
                    }


                    if (i === 0) {
                        newDisplayValues['Grid Length'] = [V]
                        newDisplayValues['Grid Width'] = [U]
                        newParamValues['Unit Length'] = [(Math.abs(bboxLength) + (Math.sqrt(2) * (V - 1))) / V]
                        newParamValues['Unit Width'] = [(Math.abs(bboxWidth) + (Math.sqrt(2) * (U - 1))) / U]
                        newPoints = [point]
                    } else {
                        newDisplayValues['Grid Length'].push(V)
                        newDisplayValues['Grid Width'].push(U)
                        newParamValues['Unit Length'].push((Math.abs(bboxLength) + (Math.sqrt(2) * (V - 1))) / V)
                        newParamValues['Unit Width'].push((Math.abs(bboxWidth) + (Math.sqrt(2) * (U - 1))) / U)
                        newPoints.push(point)
                    }
                }
                setPoints(newPoints);
                setDisplayValues((prevDictionary) => ({
                    ...prevDictionary,
                    ...newDisplayValues,
                }));

                setParamValues((prevDictionary) => ({
                    ...prevDictionary,
                    ...newParamValues,
                }));
                await compute(newParamValues, newDisplayValues, newPoints, currentPartition)
                setLoading(false);
                
                zoomCameraToSelection(camera, controls, scene, 1.4, 2)
                setGenerated(true)
            }
        }
        
        if (generateBuilding) {
            setLoading(true);
            let partition = scalePartition();
            if(partition) scene.add(partition)
            renderBuilding(partition);
            createSelector();
        } 
    }, [trigger])

    useEffect(() => {
        async function applyPart() {
            const payload = {
                'action': 'stage',
                'params': {
                    'crvPoints': crvPoints,
                    'k': 4,
                },
            };
            if (scene) {
                scene.clear();
            }
            setInitValues();
            // console.log(JSON.stringify(payload))
            const response = await fetch('https://7dp7thzz3icorfu6uzpv4gfyza0fixth.lambda-url.us-east-2.on.aws/', {
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify(payload)
            })
            const response_data = await response.json()
            // console.log('lambda data:', response_data)
            bipartite_figures = response_data.bipartite_figures

            try {
                if (bipartite_figures.length === 0) {
                    setIsDegenerate(false);
                }

                let partition = await showPartition(0,false);
                console.log('part:',partition)
                // setNonDegIndex(-nonDegIndex+1)
                camera.position.set(0, 0, 50);
                // // camera.lookAt(new THREE.Vector3(0,-15,0))
                controls.update()
                scene.add(partition)
                zoomCameraToSelection(camera, controls, scene, 1.4, 6);
                
                //camera.position.set(-150, -200, 80);
                //camera.lookAt(new THREE.Vector3(0,0,0))
                // controls.update();
                setCurrentPartition(partition);
                // scene.add(partition)
                // camera.position.set(0,0,50)
                // controls.update()
                if (generateBuilding) {
                    handleGenerate();
                }
                setGroupLength(lengthDegSet);
                removeListeners();
                controls.enableRotate = true;
                setLoading(false);
            } catch (error) {
                setHasError(true);
            }
        }

        async function applyReset() {
            scene.clear();
            camera.position.set(0,0,50)
            camera.lookAt(new THREE.Vector3(0,0,0))
            setInitValues();
            createListeners();
            removeSelector();
            setGenerateBuilding(false);
            setGenerated(false);
            controls.enableRotate = false;
            reset();
            setIsDegenerate(true);
            setLoading(false);
        }

        if (isMounted) {
            if (applied) {
                setLoading(true)
                applyPart();
            } else {
                applyReset();
            }
        }
    }, [applied]);

    const handleGenerate = (): void => {
        setLoading(true);
        scene.clear()
        setGenerateBuilding(true);
        setTrigger(!trigger);
    }

    const handleApply = (): void => {
        if (hasError) {
            setApplied(false);
            setHasError(false);
        } else {
            setApplied(!applied);
            setLoading(true);
        }
    }

    useEffect(() => {
        async function change() {
            await switchDegSet(degIndex);
            setLoading(false);
        }

        if (applied) {
            scene.clear();
            setGenerateBuilding(false);
            setGenerated(false);
            removeSelector();
            change();
            // 

            camera.position.set(0,0,50)
            controls.update()
            // zoomCameraToSelection(camera, controls, scene, 1.4)
            // renderer.render(scene, camera)
        }
    }, [degIndex])

    useEffect(() => {
        async function change() {
            if (nonDegIndex != prevNonDegRef.current) {
                let dir = (nonDegIndex - prevNonDegRef.current) > 0;
                let partition = await showPartition(dir ? 1 : -1);
                setCurrentPartition(partition)
                prevNonDegRef.current = nonDegIndex;
                setLoading(false);
            }
        }

        if (applied) {
            scene.clear();
            setGenerateBuilding(false);
            setGenerated(false);
            removeSelector();
            change();
            camera.position.set(0,0,50)
            controls.update()
            // zoomCameraToSelection(camera, controls, scene, 1.4)
        }
    }, [nonDegIndex])

    const handleDegChange = (index: number): void => {
        setDegIndex(index);
        setLoading(true);
    }

    const handleNonDegChange = (dir: number) => {
        setLoading(true);
        let newIndex = nonDegIndex + dir
        if (newIndex >= groupLength) {
            newIndex = 0;
        } else if (newIndex < 0) {
            newIndex = groupLength - 1;
        }
        setNonDegIndex(newIndex);
    }

    const toggleGraphs = () => {
        setOpenGraphs(!openGraphs);
    }

    const toggleBuilding = () => {
        function toggleGroupVisibility(group:THREE.Group, isVisible:boolean) {
            group.traverse(function (child) {
              if (child instanceof THREE.Mesh) {
                child.visible = isVisible;
              }
            });
          }

        for(let i = 1; i < scene.children.length; i++){
            toggleGroupVisibility(scene.children[i],!showBuilding);
        }
        setShowBuilding(!showBuilding)
    }

    const toggleGUI = () => {
        if (openGUI == false) {
            document.body.style.overflowY = 'hidden';
        } else {
            document.body.style.overflowY = 'auto';
        }
        setOpenGUI(!openGUI);
    }

    setMapUpdateCallback((updatedMap: any) => {
        setSelectedMaterials(updatedMap.size);
    });

    const handleGUIChange = async (modelParams: modelParameters, displayParams: displayParameters) => {
        let newParams = paramValues
        let newDisplay = displayValues

        function setNew() {
            newParams['Story Height'] = modelParams['Story Height']
            newParams['Structural'] = modelParams['Structural']
            newDisplay['Stories'] = displayParams['Stories']
            newDisplay['displayType'] = displayParams['displayType']
        }

        if (paramValues['Story Height'] != modelParams['Story Height'] ||
            paramValues['Structural'] != modelParams['Structural']) {
            setNew();
            setLoading(true);
            await compute(newParams, newDisplay, points, currentPartition)
            setLoading(false);
        } else if (displayValues['Stories'] != displayParams['Stories'] ||
            displayValues['displayType'] != displayParams['displayType']) {
            setNew();
            setLoading(true);
            await rhinoToThree(newParams, newDisplay, points, currentPartition);
            setLoading(false);
        }
        setParamValues(newParams)
        setDisplayValues(newDisplay)
    }

    const currentProjectIndex = allComputationalProjects.findIndex((project) => project.slugAsParams === 'min-rect-partition');

    const project = allComputationalProjects[currentProjectIndex]
    const nextProject = currentProjectIndex < allComputationalProjects.length - 1 ? allComputationalProjects[currentProjectIndex + 1] : null;
    const previousProject = currentProjectIndex > 0 ? allComputationalProjects[currentProjectIndex - 1] : null;

    const href = '/computational-design/'

    return (
        <div className={styles.mainContainer} id='mainContainer'>
            <div className={styles.header}>
                <h1 className={styles.title}>{formatLinkLabel('Minimum Rectangular Partitioning')}</h1>
                <Link className={`noSelect backButton`} href={href}>
                    <ArrowUturnLeftIcon className="h-8 w-8" /> Back
                </Link>
            </div>
            <div className={styles.content}>
                <h1>
                    <strong>What You&apos;re Looking At</strong>
                </h1>
                <p> {project.description} </p>
            </div>
            <div className={styles.contentContainer}>
                <div className={styles.canvasGUI}>
                    {/* {(applied && isDegenerate) &&
                    (
                        <GraphCarousel
                            dataType="data:image/svg+xml;base64,"
                            images={bipartite_figures}
                            onImageChange={handleDegChange}
                            openGraphs={openGraphs}
                        />
                    )
                } */}
                    <div className={`${styles.canvasContainer}`} id='canvas-container'>
                        {loading && <Spinner />}
                        {selectedMaterials > 0 &&
                            <div className={styles.toggleState}>
                                Edit
                                <div className={styles.stateButtonContainer}>
                                    <button onClick={() => removeCassette()}> Open/Close </button>
                                    <button onClick={() => removeUnit()}> Add/Remove </button>
                                </div>
                            </div>
                        }
                        {hasError &&
                            <div className={styles.blockCanvas}>
                                <p> There was an error partitioning your input. Here are some things to keep in mind:
                                    <ul>
                                        <li> - You can apply a partition to a shape with holes but not to multiple shapes</li>
                                        <li> - Holes cannot be nested </li>
                                    </ul>
                                </p>
                            </div>
                        }
                        
                        <GUI
                            handleGUIChange={handleGUIChange}
                            openGUI={openGUI}
                            toggle={toggleGUI}
                        />
                        <canvas className={styles.mainCanvas} id='canvas'> </canvas>
                        <div className={styles.toggles}>
                            <button className={styles.toggleGraphs} onClick={() => toggleGraphs()}>
                                {openGraphs ?
                                    'Close'
                                    :
                                    'Explore degeneracies'
                                }
                            </button>
                            {generated && <button className={styles.toggleGUI} onClick={() => toggleGUI()}>Building Parameters</button>}
                            {generated && <button className={styles.toggleGUI} onClick={() => toggleBuilding()}>Hide/Show Building</button>}
                        </div>
                        {applied &&
                            (<div className={`${styles.nav} ${isDegenerate ? '' : styles.nondeg}`}>
                                <button
                                    type='button'
                                    id='prevButton'
                                    aria-label="Previous Partition"
                                    onClick={() => handleNonDegChange(-1)}
                                >
                                    <ArrowLeftIcon className="noSelect h-6 w-12" />
                                </button>
                                <p>
                                    Partition {nonDegIndex + 1} of {groupLength} {`${isDegenerate ? `under ${getCardinalAbbreviation(degIndex + 1)} nondegenerate set` : ''}`}
                                </p>
                                <button
                                    type='button'
                                    id='nextButton'
                                    aria-label='Next Partition'
                                    onClick={() => handleNonDegChange(1)}
                                >
                                    <ArrowRightIcon className="noSelect h-6 w-12" />
                                </button>
                            </div>)
                        }
                        <div className={styles.leftToggles}>
                            <button
                                className={`${styles.computeButton} ${hasError ? styles.errorReset:''}`}
                                onClick={handleApply}
                            >
                                {hasError ? 'Try again' : !applied ? 'Apply partition' : 'Create a new shape'}
                            </button>
                            {!generateBuilding && <button onClick={handleGenerate}>Generate Building</button>}
                        </div>
                        
                    </div>
                    <div className={`${styles.GUIpanels} ${openGUI || openGraphs ? styles.open : styles.closed}`}>
                        <GraphCarousel
                            dataType="data:image/svg+xml;base64,"
                            images={bipartite_figures}
                            onImageChange={handleDegChange}
                            openGraphs={openGraphs}
                            toggle={toggleGraphs}
                        />
                    </div>
                </div>
            </div>
            <div className={`${styles.content} ${styles.desktop}`}>
                <h1> <strong>Directions</strong></h1>
                <h2> <em>Draw Floorplan</em> </h2>
                <ol type="1">
                    <li> Click &quot;Create a new shape&quot; to draw a new floorplan</li>
                    <li> Draw a shape by clicking on the canvas to place vertices (press the escape key to undo) </li>
                    <li> Return to your original point to close the shape </li>
                    <li> Add any number of polygonal holes by drawing shapes inside the polygon </li>
                    <li> Click on &quot;Apply Partition&quot; to generate every possible minimal rectangular tiling of the input shape </li>
                </ol>
                <h2> <em>In General</em> </h2>
                <ol type="1">
                    <li> Drag to rotate, use two-fingers to zoom, right-click drag to pan</li>
                    <li> Explore every minimum rectangular tiling by navigating through the partitions across all non-degenerate sets </li>
                    <li> Click &quot;Generate Building&quot; to render a building on top of the current partition</li>
                    <li> Click &quot;Building Parameters&quot; to change the display and input parameters of the building model</li>
                </ol>
            </div>
            <div className={`${styles.content} ${styles.mobile}`}>
                <h1> <strong>Directions</strong></h1>
                <h2> <em>Draw Floorplan</em> </h2>
                <ol type="1">
                    <li> You won&apos;t be able to draw a new shape on a touch screen</li>
                    <li> If you are on a device with a mouse, make the screen large</li>
                    <li> Change non-degenerate sets from the &quot;Explore Degenegeracies&quot; tab</li>
                </ol>
                <h2> <em>In General</em> </h2>
                <ol type="1">
                    <li> Drag to rotate, use two-fingers to zoom, right-click drag to pan</li>
                    <li> Explore every minimum rectangular tiling by navigating through the partitions across all non-degenerate sets </li>
                    <li> Click &quot;Generate Building&quot; to render a building on top of the current partition</li>
                    <li> Click &quot;Building Parameters&quot; to change the display and input parameters of the building model</li>
                </ol>
            </div>
            <div className={styles.content}>
                <Mdx code={project.body.code} />
            </div>
            <div className={styles.pagination}>
                {previousProject &&
                    <Link className={`noSelect ${styles.pageButton}`} href={href + previousProject?.slugAsParams}>
                        <ArrowLeftIcon className='h-8 w-8' /> {previousProject.title}
                    </Link>
                }
                <div className="flex-grow" />
                {nextProject &&
                    <Link className={`noSelect ${styles.pageButton} ${styles.nextPage}`} href={href + nextProject?.slugAsParams}>
                        {nextProject.title} <ArrowRightIcon className='h-8 w-8' />
                    </Link>
                }
            </div>
            <Footer style={styles.footer} />
        </div>
    )
}

