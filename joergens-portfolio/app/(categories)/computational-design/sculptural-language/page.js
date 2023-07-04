'use client'
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import rhino3dm from 'rhino3dm';
import { init, addMesh } from './initThree.js'
import styles from "styles/pages/min-rect.module.css"

export async function loadGrasshopper(count, radius, length) {
    let data = JSON.stringify({ count: count, radius: radius, length: length })
    console.log(data);
    try {
        const response = await fetch('/api/loadGrasshopper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data
        });
        const responseData = response;
        return responseData
    } catch (error) {
        console.error(error);
        return error;
    }
};

export default async function GrasshopperPage() {
    // useEffect(() => {
    //     const count_slider = document.getElementById( 'count' );
    //     const radius_slider = document.getElementById( 'radius' )
    //     const length_slider = document.getElementById( 'length' )
    //   }, []);
    useEffect(() => {
        const stageThree = async () => {
        const data = await loadGrasshopper(14, 5, 3);
        let mesh = await data.text();
        const resdata = JSON.parse(mesh);
        init();
        addMesh(resdata);
        }
        stageThree();
    },[]);


    return (
        <div>
            <div className={styles.mainContainer} id='mainContainer'>
                <div className={styles.contentContainer}>
                    <div className={styles.canvasContainer} id='canvas-container'>
                        <canvas className={styles.mainCanvas} id='canvas'></canvas>
                    </div>
                </div>
            </div>
        </div>
    );
};

