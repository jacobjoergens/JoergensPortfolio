'use client'
import styles from "styles/pages/min-rect.module.css"
import * as THREE from "three";
import { Suspense, useEffect, useState } from "react";
import { init, showSpinner } from "./initThree.js";
import { showPartition, switchDegSet, zoomToFit } from "./threeUI.js";
import GraphCarousel from "@/components/layout/GraphCarousel";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { onMouseDown, onMouseMove, onMouseUp, crvPoints } from "./drawCurve.js";
import { createListeners } from "./threeUI.js";


let bipartite_figures: string[] = [];
let setLength: number = 0;

export async function spinUpSocket() {
    const response = await fetch('/api/startServer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });

    console.log('RESPONSE: ', response)

    if (response.ok) {
        const data = await response.text();
        console.log(data);
        if (data === 'Connection established!') {
            showSpinner(false);
        }
    } else {
        console.error('Failed to spin up socket:', response.status);
    }
}

export async function stagePartitioning() {
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

        console.log('response:', response)
        if (response.ok) {
            const data = await response.text();
            const resData = JSON.parse(data);
            console.log('resData:', resData)
            bipartite_figures = resData.text.bipartite_figures; // addFigures(resData.bipartite_figures);
            setLength = resData.text.setLength;
            await showPartition(0);
            console.log('bipfig length:', bipartite_figures.length)
        } else {
            console.error('Failed to stage partition:', response.status);
        }
    } catch (error) {
        console.error('Error in stagePartition:', error);
    }
}

export async function getPartition(partitionCache: any, degSetIndex: number, index: number) {
    try {
        const response = await fetch('/api/getPartition', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                index: index,
                degSetIndex: degSetIndex
            })
        });

        if (response.ok) {
            const data = await response.text();
            const resData = JSON.parse(data);
            partitionCache[degSetIndex][index] = resData.text;
        } else {
            console.error('Failed to get partition:', response.status);
        }
    } catch (error) {
        console.error('Error in getPartition:', error);
    }
}

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

export default async function ProjectPage() {
    let [message, setMessage] = useState('');
    const [nonDegIndex, setNonDegIndex] = useState(0);
    const [degIndex, setDegIndex] = useState(0);

    // const handleComputeClick = async(): Promise<void> => {
    //     setInitValues();
    //     await stagePartitioning();
    //     zoomToFit();
    //     setMessage(1);
    // }

    const handleDegChange = (index: number): void => {
        switchDegSet(index);
        setDegIndex(index);
    }

    const handleNonDegChange = (dir: number) => {
        showPartition(dir)
        let newIndex = nonDegIndex + dir
        if (newIndex > setLength) {
            newIndex -= setLength + dir;
        } else if (newIndex < 0) {
            newIndex += setLength - dir;
        }
        setNonDegIndex(newIndex);
    }

    useEffect(() => {
        console.log('message value:',message)
    },[message]);

    useEffect(() => {
        const stageThree = async () => {
            await init(); // Call the init function when the component mounts
            await spinUpSocket();
            await createListeners(setMessage);
        }
        stageThree();
    }, []);
    return (
        <>
            {/* <div className={styles.loader}></div> */}
            <div className={styles.mainContainer} id='mainContainer'>
                <div className={styles.computeContainer}>
                    <p className={styles.title}> Minimum Rectangular Partitioning</p>
                    <button
                        // onClick={handleComputeClick}
                        // disabled={true}
                        className={styles.computeButton}
                        id='computeButton'
                    >
                        Apply Partition
                    </button>
                </div>
                <div className={styles.contentContainer}>
                    {message && <GraphCarousel
                        dataType="data:image/svg+xml;base64,"
                        images={bipartite_figures}
                        onImageChange={handleDegChange} />
                    }

                    <div className={styles.canvasContainer} id='canvas-container'>
                        <canvas className={styles.mainCanvas} id='canvas'></canvas>
                        {message && <div className={styles.nonDegNav}>
                            <button
                                type='button'
                                color='red'
                                id='prevButton'
                                aria-label="Previous Partition"
                                onClick={() => handleNonDegChange(-1)}
                            >
                                <ArrowLeftIcon className="noSelect h-6 w-12" />
                            </button>
                            <p>
                                Partition {nonDegIndex + 1} of {setLength + 1} under {getCardinalAbbreviation(degIndex + 1)} nondegenerate set
                            </p>
                            <button
                                type='button'
                                color='red'
                                id='nextButton'
                                aria-label='Next Partition'
                                onClick={() => handleNonDegChange(1)}
                            >
                                <ArrowRightIcon className="noSelect h-6 w-12" />
                            </button>
                        </div>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

