'use client'
import styles from "styles/pages/minrect.module.css"
import { useRef, useEffect, useState } from "react";
import { camera, controls, init, scene } from "./initThree.js";
import { setInitValues, showPartition, switchDegSet, zoomCameraToSelection, createListeners, removeListeners, lengthDegSet } from "./threeUI.js";
import GraphCarousel from "@/components/layout/GraphCarousel";
import { ArrowRightIcon, ArrowLeftIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link.js";
import Footer from "@/components/layout/Footer";
import { reset, crvPoints, curves } from "./drawCurve.js";
import { Mdx } from '@/components/mdx-components';
import { allComputationalProjects } from 'contentlayer/generated';
import Spinner from "@/components/layout/Spinner";
import dotenv from 'dotenv';

dotenv.config();

// Configure the Lambda function parameters
// const params = {
//     FunctionName: functionName,
//     InvocationType: 'RequestResponse', // Can be 'Event' for asynchronous invocation
//     Payload: JSON.stringify(payload),
// };


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
    const [applied, setApplied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [nonDegIndex, setNonDegIndex] = useState(0);
    const [degIndex, setDegIndex] = useState(0);
    const [groupLength, setGroupLength] = useState(0);
    const prevNonDegRef = useRef<number>(nonDegIndex);
    const [isMounted, setIsMounted] = useState(false);
    const [isDegenerate, setIsDegenerate] = useState(true);
    const [openGraphs, setOpenGraphs] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const stageThree = async () => {
            await init(); // Call the init function when the component mounts
            // await spinUpSocket();
        }
        stageThree();
        setIsMounted(true);
        handleApply();
    }, []);

    
    useEffect(() => {
        async function applyPart() {
            const payload = {
                'action': 'stage',
                'params': {
                    'crvPoints': crvPoints,
                    'k': 4,
                },
            };
            scene.remove(curves);
            setInitValues();
            const response = await fetch('https://7dp7thzz3icorfu6uzpv4gfyza0fixth.lambda-url.us-east-2.on.aws/', {
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify(payload)
            })
            const response_data = await response.json()
            bipartite_figures = response_data.bipartite_figures
            
            // console.log(bipartite_figures)
            // let response

            // : AWS.Lambda.InvocationResponse;

            // // Wrap the Lambda invocation in a Promise
            // const config = {
            //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            //     region: 'us-east-2',
            //   };
              
            //   AWS.config.update(config);
            //   const lambda = new AWS.Lambda();
              
            //   console.log('AWS Configuration:', AWS.config);
            //   console.log('Environment Variables:', process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
              
            // const lambdaInvocation = new Promise((resolve, reject) => {
            //     console.log('keys:',process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY)
            //     lambda.invoke(params, (err, data) => {
            //         if (err) {
            //             console.error('Error invoking Lambda:', err);
            //             reject(err);
            //         } else {
            //             const payloadBuffer = data.Payload;
            //             if (payloadBuffer) {
            //                 response = JSON.parse(payloadBuffer.toString('utf-8') || '{}');
            //                 bipartite_figures = JSON.parse(response.body).bipartite_figures
            //             } else {
            //                 response = {}; // Fallback in case payloadBuffer is undefined
            //             }
            //             resolve(response);
            //         }
            //     });
            // });

            try {
                // await lambdaInvocation; // Wait for the Lambda invocation to complete
                if (bipartite_figures.length === 0) {
                    setIsDegenerate(false);
                }

                await showPartition(0);
                setGroupLength(lengthDegSet);
                zoomCameraToSelection(camera, controls);
                removeListeners();
                controls.enableRotate = true;
                setLoading(false);
            } catch (error) {
                setHasError(true);
            }
        }

        async function applyReset() {
            setInitValues();
            createListeners();
            controls.enableRotate = false;
            reset();
            init();
            setIsDegenerate(true);
            setLoading(false);
        }

        if (isMounted) {
            if (applied) {
                applyPart();
            } else {
                applyReset();
            }
        }
    }, [applied]);

    const handleApply = (): void => {
        if(hasError){
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
            change();
        }
    }, [degIndex])

    const handleDegChange = (index: number): void => {
        setDegIndex(index);
        setLoading(true);
    }

    useEffect(() => {

        async function change() {
            if (nonDegIndex != prevNonDegRef.current) {
                let dir = (nonDegIndex - prevNonDegRef.current) > 0;
                await showPartition(dir ? 1 : -1);
                prevNonDegRef.current = nonDegIndex;
                setLoading(false);
            }
        }

        if (applied) {
            change();
        }
    }, [nonDegIndex])

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
            <div className={styles.directionContainer}>
                <div className={`${styles.bubble} ${styles.desktop}`}>
                    <div className={styles.bubbleTitle}> Directions: </div>
                    <ul>
                        <li> - Draw a polygon by clicking on the canvas to place vertices </li>
                        <li> - Press the escape key to undo </li>
                        <li> - Return to your original point to close the shape </li>
                        <li> - Add any number of polygonal holes by drawing curves inside the polygon </li>
                        <li> - Click on &quot;Apply Partition&quot; </li>
                        <li> - Drag to rotate </li>
                        <li> - Drag two-fingers to zoom</li>
                    </ul>
                </div>
                <div className={`${styles.bubble} ${styles.mobile}`}>
                    <div className={styles.bubbleTitle}> Directions: </div>
                    <ul>
                        <li> - You won&apos;t be able to draw a new shape on a touch screen </li>
                        <li> - If you are on a device with a mouse, make the screen large </li>
                        <li> - For the example below, drag to rotate, use two-fingers to zoom, change sets from the &quot;Explore Degenegeracies&quot; tab</li>
                    </ul>
                </div>
            </div>
            <div className={styles.contentContainer}>
                <button className={styles.toggleGraphs} onClick={() => toggleGraphs()}>
                    {openGraphs ?
                        'Close'
                        :
                        'Explore degeneracies'
                    }
                </button>
                {(applied && isDegenerate) &&
                    (
                        <GraphCarousel
                            dataType="data:image/svg+xml;base64,"
                            images={bipartite_figures}
                            onImageChange={handleDegChange}
                            openGraphs={openGraphs}
                        />
                    )
                }
                <div className={`${styles.canvasContainer} ${openGraphs ? styles.closed : styles.open}`} id='canvas-container'>
                    {loading && <Spinner />}
                    {hasError &&
                        <div className={styles.blockCanvas}> 
                            <p> There was an error partitioning your input. Here are some things to keep in mind. 
                                <ul>
                                    <li> - You can apply a partition to a shape with holes but not to multiple shapes.</li>
                                    <li> - Holes cannot be nested. </li>
                                </ul>
                            </p>
                        </div>
                    }
                    <canvas className={styles.mainCanvas} id='canvas'> </canvas>

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
                </div>
            </div>
            <button
                // onClick={handleComputeClick}
                // disabled={true}
                className={styles.computeButton}
                // id='computeButton'
                onClick={handleApply}
            >
                {hasError ? 'Try again': !applied ? 'Apply partition' : 'Create a new shape'}
            </button>
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

