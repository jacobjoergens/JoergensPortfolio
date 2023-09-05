'use client'
import styles from "styles/pages/minrect.module.css"
// import * as THREE from "three";
import { useRef, useEffect, useState } from "react";
import { init } from "./initThree.js";
import { setInitValues, showPartition, switchDegSet, zoomToFit, createListeners } from "./threeUI.js";
import GraphCarousel from "@/components/layout/GraphCarousel";
import { ArrowRightIcon, ArrowLeftIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
// import { onMouseDown, onMouseMove, onMouseUp, crvPoints } from "./drawCurve.js";
import Link from "next/link.js";
import Footer from "@/components/layout/Footer";
import stagePartitioning from "@/components/fetching/stagePartitioning";
import getPartition from "@/components/fetching/getPartition";
import spinUpSocket from "@/components/fetching/spinUpSocket";
import { reset, crvPoints } from "./drawCurve.js";

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

export default function ProjectPage() {
    const [applied, setApplied] = useState(0);
    const [loading, setLoading] = useState(0);
    const [nonDegIndex, setNonDegIndex] = useState(0);
    const [degIndex, setDegIndex] = useState(0);
    const [groupLength, setGroupLength] = useState(0);
    const prevNonDegRef = useRef<number>(nonDegIndex);

    useEffect(() => {

        async function applyPart() {
            setInitValues();
            const part_out = await stagePartitioning(crvPoints);
            bipartite_figures = part_out.bipartite_figures;
            setGroupLength(part_out.setLength);
            // setLoading(0);
            await showPartition(0);
            zoomToFit();
            setLoading(0);
        }

        async function applyReset() {
            setInitValues();
            reset();
            init();
            setLoading(0);
        }

        if (applied) {
            applyPart();
        } else {
            applyReset();
        }

    }, [applied]);

    const handleApply = (state: number): void => {
        setApplied(state);
        setLoading(1);
    }

    useEffect(() => {
        async function change(){
            await switchDegSet(degIndex);
            setLoading(0);
        }

        if(applied){
            change();
        }
    }, [degIndex])

    const handleDegChange = (index: number): void => {
        setDegIndex(index);
        setLoading(1);
    }

    useEffect(() => {

        async function change(){
            let dir = (nonDegIndex-prevNonDegRef.current)>0;
            await showPartition(dir ? 1 : -1);
            prevNonDegRef.current = nonDegIndex;
            setLoading(0);
        }

        if(applied){
            change();
        }
    }, [nonDegIndex])

    const handleNonDegChange = (dir: number) => {
        setLoading(1);
        let newIndex = nonDegIndex + dir
        if (newIndex >= groupLength) {
            newIndex = 0;
        } else if (newIndex < 0) {
            newIndex = groupLength - 1;
        }
        setNonDegIndex(newIndex);
    }

    useEffect(() => {
        const stageThree = async () => {
            await init(); // Call the init function when the component mounts
            await spinUpSocket();
            await createListeners();
        }
        stageThree();
    }, []);

    const href = '/computational-design/'

    return (
        <div className={styles.mainContainer} id='mainContainer'>
            <div className={styles.header}>
                <h1 className={styles.title}>{formatLinkLabel('Minimum Rectangular Partitioning')}</h1>
                <Link className={`noSelect backButton`} href={href}>
                    <ArrowUturnLeftIcon className="h-8 w-8" /> Back
                </Link>
            </div>
            <div className={styles.directionContainer}>
                <div className={styles.bubble}>
                    <div className={styles.bubbleTitle}> Description: </div>
                    <p>
                        The basic idea of this model is to determine the minimum number of rectangles
                        required to tile an orthogonal (right-angle only) polygon. You can
                        read the fuller explanation below to see why I came across this question, why I found it more
                        difficult than it first appeared, and what I am trying currently working to extend it to.
                    </p>
                </div>
                <div className={styles.bubble}>
                    <div className={styles.bubbleTitle}> Directions: </div>
                    <ul>
                        <li> - Click anywhere on the canvas to place points </li>
                        <li> - Return to your original point to close a shape </li>
                        <li> - Snaplines will help you match endpoints </li>
                        <li> - Intersections are not allowed and will be highlighted</li>
                        <li> - Polygonal holes (shapes within shapes) are permitted </li>
                        <li> - Shapes within holes are not understood </li>
                    </ul>
                </div>
            </div>
            <div className={styles.contentContainer}>
                {applied ?
                    (
                        <GraphCarousel
                            dataType="data:image/svg+xml;base64,"
                            images={bipartite_figures}
                            onImageChange={handleDegChange}
                        />
                    )
                    :
                    <div />
                }
                <div className={styles.canvasContainer} id='canvas-container'>
                    {loading ?
                        (<div className={styles.loadingContainer}>
                            <div className={styles.loader} />
                        </div>
                        ): ''}
                    <canvas className={styles.mainCanvas} id='canvas'> </canvas>
                    <div>
                        {applied ?
                            (<div className={styles.nav}>
                                <button
                                    type='button'
                                    id='prevButton'
                                    aria-label="Previous Partition"
                                    onClick={() => handleNonDegChange(-1)}
                                >
                                    <ArrowLeftIcon className="noSelect h-6 w-12" />
                                </button>
                                <p>
                                    Partition {nonDegIndex + 1} of {groupLength} under {getCardinalAbbreviation(degIndex + 1)} nondegenerate set
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
                            :
                            <div />
                        }
                    </div>
                </div>
            </div>
            <button
                // onClick={handleComputeClick}
                // disabled={true}
                className={styles.computeButton}
                // id='computeButton'
                onClick={() => handleApply((applied+1)%2)}
            >
                {!applied ? 'Apply Partition' : 'Reset'}
            </button>
            <Footer style={styles.footer} />
        </div>
    )
}

