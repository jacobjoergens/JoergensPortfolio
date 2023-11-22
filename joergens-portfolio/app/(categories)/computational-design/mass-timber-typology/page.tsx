'use client'
import { useEffect, useState } from 'react';
import { init, compute, scene, createListeners, camera, controls, zoomCameraToSelection } from './initThree.js'
import styles from "styles/pages/typology.module.css"
import Spinner from '@/components/layout/Spinner';
import GUI from '@/components/layout/CLTgui.js'
import { ArrowUturnLeftIcon, ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Mdx } from '@/components/mdx-components';
import { allComputationalProjects } from 'contentlayer/generated';
import Link from 'next/link';
import { removeCassette, removeUnit, setMapUpdateCallback } from './interact.js';
import * as THREE from 'three'

interface LabelProps {
  label: string;
}

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

function formatLinkLabel(label: LabelProps["label"]) {
  const words = label.split(" ");
  return words.join("\n");
}

export default function GrasshopperPage() {
  const [loading, setLoading] = useState(true);
  const [openGUI, setOpenGUI] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState(0);
  const [firstRender, setFirstRender] = useState(true);
  const [paramValues, setParamValues] = useState<modelParameters>({
    'Unit Width': [13],
    'Unit Length': [10],
    'Story Height':13, 
    'Structural': false,
  });
  const [displayValues, setDisplayValues] = useState<displayParameters>({
    'Stories': 3,
    'Grid Width': [3],
    'Grid Length': [3],
    'displayType': 'Textured'
  });

  const handleGUIChange = (modelParams: any, displayParams: any) => { 
    modelParams['Unit Width'] = [modelParams['Unit Width']]
    modelParams['Unit Length'] = [modelParams['Unit Length']]
    displayParams['Grid Width'] = [displayParams['Grid Width']]
    displayParams['Grid Length'] = [displayParams['Grid Length']]


    setParamValues(modelParams);
    setDisplayValues(displayParams);
  }

  setMapUpdateCallback((updatedMap: any) => {
    setSelectedMaterials(updatedMap.size);
  });

  useEffect(() => {
    const callCompute = async () => {
      const point = new THREE.Vector3(
        -paramValues['Unit Width'][0]*displayValues['Grid Width'][0]/2,
        -paramValues['Unit Length'][0]*displayValues['Grid Length'][0]/2,
        -paramValues['Story Height']*displayValues['Stories']/2,)
      await compute(paramValues, displayValues, [point]);
      if (scene) {
        setLoading(false);
        zoomCameraToSelection(camera, controls, scene, 0.5, 6)
      } else {
        callCompute();
      }
    };

    // const stageThree = async () => {
    //   await init();
    // };

    const runEffect = async () => {
      if(!firstRender){
        setLoading(true);
        await callCompute(); // Wait for callCompute to complete
      }
    };

    runEffect(); // Run the async function
  }, [paramValues]);

  useEffect(() => {
    const stageThree = async () => {
      await init();
      createListeners();
    };
    stageThree();
    setFirstRender(false)
  },[]);

  const toggleGUI = () => {
    if (openGUI == false) {
      document.body.style.overflowY = 'hidden';
    } else {
      document.body.style.overflowY = 'auto';
    }
    setOpenGUI(!openGUI);
  }

  const currentProjectIndex = allComputationalProjects.findIndex((project) => project.slugAsParams === 'mass-timber-typology');
  const nextProject = currentProjectIndex < allComputationalProjects.length - 1 ? allComputationalProjects[currentProjectIndex + 1] : null;
  const previousProject = currentProjectIndex > 0 ? allComputationalProjects[currentProjectIndex - 1] : null;
  const project = allComputationalProjects[currentProjectIndex]

  const href = '/computational-design/'

  return (
      <div className={styles.mainContainer} id='mainContainer'>
        <div className={styles.header}>
        <h1 className={styles.title}>{formatLinkLabel(project.title)}</h1>
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
            <div className={styles.canvasContainer} id='canvas-container'>
              {loading && <Spinner />}
              {selectedMaterials>0 &&
              <div className={styles.toggleState}>
                  Edit
                  <div className={styles.stateButtonContainer}>
                    <button onClick={() => removeCassette()}> Open/Close </button>
                    <button onClick={() => removeUnit()}> Add/Remove </button>
                  </div>
              </div>
              }
              <button className={styles.toggleGUI} onClick={() => toggleGUI()}>Controls</button>
              <canvas className={styles.mainCanvas} id='canvas' />
              {/* {`$visibility: loading ? 'visible' : 'hidden' }`} */}
            </div>
            <GUI
              handleGUIChange={handleGUIChange}
              openGUI={openGUI}
              toggle={toggleGUI}
            />
          </div>
        </div>
        <div className={styles.content}>
          <h1> <strong>Directions</strong></h1>
            <ol type="1">
                <li>In the control panel, use the buttons and sliders to change the model and display parameters.</li>
                <li>Add floor units (also known as &quot;cassettes&quot;) to a selection by clicking or tapping on them. </li>
                <li>Add, remove, open, or close the cassettes in the selection with the &quot;Edit&quot; buttons. You can undo any selecting or editing by following the reverse action. </li>
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
      </div>
  );
}
