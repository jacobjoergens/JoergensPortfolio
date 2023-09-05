'use client'
import { useEffect, useState, useRef } from 'react';
import { init } from './initThree.js'
import styles from "styles/pages/computational.module.css"
import Spinner from '@/components/layout/Spinner';
import GUI from '@/components/layout/GUI.js'
import { ArrowUturnLeftIcon, ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Mdx } from '@/components/mdx-components';
import { allComputationalProjects } from 'contentlayer/generated';
import Link from 'next/link';
import PdbSearchBar from '@/components/fetching/pdbSearch';


interface ProjectProps {
  params: {
    category: string;
    project: string;
  };
}

interface LabelProps {
  label: string;
}

interface Option {
  label: string;
  value: string;
  description: string;
}

function formatLinkLabel(label: LabelProps["label"]) {
  const words = label.split(" ");
  return words.join("\n");
}

async function fetchPdbContent(pdbId: string): Promise<string | null> {
  const url = `https://files.rcsb.org/download/${pdbId}.pdb`;
  try {
    const response = await fetch(url);
    if (response.ok) {
      return await response.text();
    } else {
      console.error('Failed to fetch PDB content:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Failed to fetch PDB content:', error);
    return null;
  }
}

export default function GrasshopperPage({ params }: ProjectProps) {
  const [loading, setLoading] = useState(true);
  const [openGUI, setOpenGUI] = useState(false);
  const canvasRef = useRef(null);
  const defaultOption = { label: '1E6V', value: '1E6V', description: 'placeholder' };
  const [selectedOption, setSelectedOption] = useState<Option | null>(defaultOption);
  const [atomData, setAtomData] = useState("ATOM      1  N   LEU A   8      40.310  22.627 119.798  1.00 26.69           N" +
    "ATOM      2  CA  LEU A   8      40.324  21.151 120.037  1.00 26.66           C" +
    "ATOM      3  C   LEU A   8      41.637  20.670 120.636  1.00 26.69           C" +
    "ATOM      4  O   LEU A   8      41.650  19.814 121.533  1.00 26.53           O");

  useEffect(() => {
    async function download(entryID: string) {
      const pdbContent = await fetchPdbContent(entryID);
      if (pdbContent) {
        const atom_record = pdbContent
          .split('\n')
          .filter(line => line.trim().startsWith('ATOM'))
          .join('\n'); // Join the filtered lines back into a single string
        setAtomData(atom_record);
      }

    }
    if (selectedOption) {
      download(selectedOption.label);
    }
  }, [selectedOption]);

  const toggleGUI = () => {
    setOpenGUI(!openGUI);
  }

  const handleSelectChange = (option: Option | null) => {
    setSelectedOption(option);
  };

  const handleRenderComplete = (value: boolean) => {
    setLoading(value);
  }

  // const onCompute = async(values: any , displayParams: any) => {
  //   values['pdbID'] = `C:/Users/jacob/OneDrive/Documents/GitHub/JoergensPortfolio/joergens-portfolio/public/pdb/${selectedOption?.label}.pdb`;
  //   await compute(values, displayParams);
  // }

  const currentProjectIndex = allComputationalProjects.findIndex((project) => project.slugAsParams === 'protein-earrings');
  const nextProject = currentProjectIndex < allComputationalProjects.length - 1 ? allComputationalProjects[currentProjectIndex + 1] : null;
  const previousProject = currentProjectIndex > 0 ? allComputationalProjects[currentProjectIndex - 1] : null;

  const project = allComputationalProjects[currentProjectIndex]
  // const nextProject = currentProjectIndex < allComputationalProjects.length - 1 ? allComputationalProjects[currentProjectIndex + 1] : null;
  // const previousProject = currentProjectIndex > 0 ? allComputationalProjects[currentProjectIndex - 1] : null;


  const href = '/computational-design/'

  useEffect(() => {
    setLoading(true);
    const stageThree = async () => {
      // const m: RhinoModule = await rhino3dm(); // Wait for the promise to resolve
      // console.log('m', m, typeof m); 
      // console.log('Loaded rhino3dm.');
      // rhino = m;

      if (canvasRef.current) {
        await init(canvasRef.current);
      }

      setLoading(false);
    };
    stageThree();
  }, []);

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>{formatLinkLabel(project.title)}</h1>
        <Link className={`noSelect backButton`} href={href}>
          <ArrowUturnLeftIcon className="h-8 w-8" /> Back
        </Link>
      </div>
      <div className={styles.mainContainer} id='mainContainer'>
        <div className={styles.contentContainer}>
          <div className={styles.canvasGUI}>
            <div className={styles.canvasContainer} id='canvas-container'>
              {loading && <Spinner />}
              <button className={styles.toggleGUI} onClick={()=>toggleGUI()}>Controls</button>
              <canvas className={styles.mainCanvas} id='canvas' ref={canvasRef} />
              {/* {`$visibility: loading ? 'visible' : 'hidden' }`} */}
            </div>
            <GUI atomData={atomData} onRenderComplete={handleRenderComplete} openGUI={openGUI} toggle={toggleGUI}/>
          </div>
          <div className='searchbar'>
            <PdbSearchBar onChange={handleSelectChange} />
          </div>
        </div>
        <div className={styles.content}>
          <Mdx code={project.body.code} />
        </div>
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
