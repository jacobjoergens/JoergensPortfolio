'use client'
import { useEffect, useState } from 'react';
import { init, compute, initPDB, init3obj, collectResults, scene } from './initThree.js'
import styles from "styles/pages/computational.module.css"
import Spinner from '@/components/layout/Spinner';
import GUI from '@/components/layout/GUI.js'
import { ArrowUturnLeftIcon, ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Mdx } from '@/components/mdx-components';
import { allComputationalProjects } from 'contentlayer/generated';
import Link from 'next/link';
import PdbSearchBar from '@/components/fetching/pdbSearch';


interface LabelProps {
  label: string;
}

interface Option {
  label: string;
  value: string;
  description: string;
}

interface Parameters {
  Radius: any;
  'Charge Strength': any;
  'Trim Tolerance': any;
  'Smoothing Passes': any;
  Scale: any;
  pdbID: string;
}

function formatLinkLabel(label: LabelProps["label"]) {
  const words = label.split(" ");
  return words.join("\n");
}

export default function GrasshopperPage() {
  const [loading, setLoading] = useState(true);
  const [openGUI, setOpenGUI] = useState(false);
  const [firstRender, setFirstRender] = useState(true);
  const [paramValues, setParamValues] = useState<Parameters>({
    'Radius': 8.8,
    'Charge Strength': 0.50,
    'Trim Tolerance': 10,
    'Smoothing Passes': 0,
    'Scale': 2.0,
    'pdbID': initPDB,
  });
  const [displayValues, setDisplayValues] = useState({
    'Reflectivity': 1.00,
    'Roughness': 0.00,
    'Color': '#F7D498',
    'Material': 'metal',
  });

  const handleSelectChange = (atom_record: string) => {
    setParamValues(prevParamValues => ({
      ...prevParamValues,
      pdbID: atom_record,
    }));
  };

  const handleGUIChange = (modelParams: Parameters, displayParams: any) => {
    setParamValues(modelParams);
    setDisplayValues(displayParams);
  }

  useEffect(() => {
    const callCompute = async () => {
      await compute(paramValues, displayValues);
      if (scene && scene.children.length > 0) {
        setLoading(false);
      } else {
        callCompute();
      }
    };

    const stageThree = async () => {
      await init();
    };

    const runEffect = async () => {
      if (firstRender) {
        await stageThree(); // Wait for stageThree to complete
        collectResults(init3obj, displayValues);
        setFirstRender(false);
        setLoading(false);
      } else {
        setLoading(true);
        await callCompute(); // Wait for callCompute to complete
      }
    };

    runEffect(); // Run the async function

  }, [paramValues]);

  const toggleGUI = () => {
    if (openGUI == false) {
      document.body.style.overflowY = 'hidden';
    } else {
      document.body.style.overflowY = 'auto';
    }
    setOpenGUI(!openGUI);
  }

  const currentProjectIndex = allComputationalProjects.findIndex((project) => project.slugAsParams === 'protein-earrings');
  const nextProject = currentProjectIndex < allComputationalProjects.length - 1 ? allComputationalProjects[currentProjectIndex + 1] : null;
  const previousProject = currentProjectIndex > 0 ? allComputationalProjects[currentProjectIndex - 1] : null;
  const project = allComputationalProjects[currentProjectIndex]

  const href = '/computational-design/'

  // useEffect(() => {

  // }, []);

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
              <button className={styles.toggleGUI} onClick={() => toggleGUI()}>Controls</button>
              <canvas className={styles.mainCanvas} id='canvas' />
              {/* {`$visibility: loading ? 'visible' : 'hidden' }`} */}
            </div>
            <GUI
              atomData={paramValues['pdbID']}
              handleGUIChange={handleGUIChange}
              openGUI={openGUI}
              toggle={toggleGUI}
            />
          </div>
          <div className={styles.searchcontainer}>
            <div className={styles.currentProtein}>Protein Data Bank Search:</div>
            <div className={styles.pdbSearch}>
              <PdbSearchBar setAtomData={handleSelectChange} />
            </div>
          </div>
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
