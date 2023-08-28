'use client'
import { useEffect, useState, useRef } from 'react';
import rhino3dm, { RhinoModule } from 'rhino3dm';
import { init, compute, count_slider } from './initThree.js'
import styles from "styles/pages/computational.module.css"
import Spinner from '@/components/layout/Spinner';
import GUI from '@/components/layout/GUI.js'
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { Mdx } from '@/components/mdx-components';
import { allComputationalProjects } from 'contentlayer/generated';
import Link from 'next/link';
import PdbSearchBar from '@/components/fetching/pdbSearch';
// import { downloadPDB } from '@/components/fetching/pdbDownload';
import path from 'path';

// export let rhino: RhinoModule | null = null;


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

interface AtomInfo {
  atomName: string;
  residueName: string;
  x: number;
  y: number;
  z: number;
}

function extractAtomsFromPdbContent(pdbContent: string): AtomInfo[] {
  const atoms: AtomInfo[] = [];

  const lines = pdbContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('ATOM')) {
      const atom: AtomInfo = {
        atomName: line.slice(12, 16).trim(),
        residueName: line.slice(17, 20).trim(),
        x: parseFloat(line.slice(30, 38).trim()),
        y: parseFloat(line.slice(38, 46).trim()),
        z: parseFloat(line.slice(46, 54).trim()),
      };
      atoms.push(atom);
    }
  }

  return atoms;
}

function formatAtomInfo(atom: AtomInfo): string {
  const formattedInfo = `${atom.atomName} [${atom.residueName}] ` +
    `(${atom.x.toFixed(3)}, ${atom.y.toFixed(3)}, ${atom.z.toFixed(3)})`;
  return formattedInfo;
}

export default function GrasshopperPage({ params }: ProjectProps) {
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);
  const defaultOption = {label: '1E6V', value: '1E6V', description: 'placeholder'};
  const [selectedOption, setSelectedOption] = useState<Option | null>(defaultOption);
  const [atomData, setAtomData] = useState("");
  
  useEffect(() => {
    async function download(entryID: string){
      // await downloadPDB(entryID);
      // setFilePath(path.join(process.cwd(),`pdb/${entryID}.pdb`))
      const pdbContent = await fetchPdbContent(entryID);
      if(pdbContent){
        const atom_record = pdbContent
        .split('\n')
        .filter(line => line.trim().startsWith('ATOM'))
        .splice(0,30)
        .join('\n'); // Join the filtered lines back into a single string
        setAtomData(atom_record);
      }

    }
    if(selectedOption){
      download(selectedOption.label);
    }
  }, [selectedOption]);

  const handleSelectChange = (option: Option | null) => {
    setSelectedOption(option);
  };

  // const onCompute = async(values: any , displayParams: any) => {
  //   values['pdbID'] = `C:/Users/jacob/OneDrive/Documents/GitHub/JoergensPortfolio/joergens-portfolio/public/pdb/${selectedOption?.label}.pdb`;
  //   await compute(values, displayParams);
  // }

  const currentProjectIndex = allComputationalProjects.findIndex((project) => project.slugAsParams === 'protein-earrings');

  const project = allComputationalProjects[currentProjectIndex]
  // const nextProject = currentProjectIndex < allComputationalProjects.length - 1 ? allComputationalProjects[currentProjectIndex + 1] : null;
  // const previousProject = currentProjectIndex > 0 ? allComputationalProjects[currentProjectIndex - 1] : null;

  
  const href = '/computational-design'

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
          <div className={styles.canvasContainer}>
            {loading && <Spinner />}
            <canvas className={styles.mainCanvas} id='canvas' ref={canvasRef} />
            <GUI atomData={atomData}/>
            {/* {`$visibility: loading ? 'visible' : 'hidden' }`} */}
            <PdbSearchBar onChange={handleSelectChange} />
          </div>
        </div>
        <div className={styles.content}>
          <Mdx code={project.body.code} />
        </div>
      </div>
    </div>
  );
}
