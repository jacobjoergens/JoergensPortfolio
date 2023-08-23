'use client'
import { useState, useEffect, useRef } from "react";
import { allComputationalProjects } from "contentlayer/generated";
import styles from "styles/pages/computational.module.css"
import Link from "next/link";
import { ArrowUturnLeftIcon, ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import rhino3dm from "rhino3dm";
import { Mdx } from "@/components/mdx-components";
import Footer from "components/layout/Footer";

export let rhino: any;

interface ProjectProps {
    params: {
        category: string;
        project: string;
    };
}

interface LabelProps {
    label: string;
}

function formatLinkLabel(label: LabelProps["label"]) {
    const words = label.split(" ");
    return words.join("\n");
}

export default function GrasshopperPage({ params }: ProjectProps) {
    const [loading, setLoading] = useState(true);
    const canvasRef = useRef(null);

    const currentProjectIndex = allComputationalProjects.findIndex((project) => project.slugAsParams === 'sculptural-language');

    const project = allComputationalProjects[currentProjectIndex]
    const nextProject = currentProjectIndex < allComputationalProjects.length - 1 ? allComputationalProjects[currentProjectIndex + 1] : null;
    const previousProject = currentProjectIndex > 0 ? allComputationalProjects[currentProjectIndex - 1] : null;

    if (!project) {
        return null;
    } else {
        var href = '/computational-design/'
    }

    // useEffect(() => {
    //     setLoading(true);
    //     const stageThree = async () => {
    //         await rhino3dm().then(async (m) => {
    //             console.log('Loaded rhino3dm.');
    //             rhino = m; // global
    //         });

    //         if (canvasRef.current) {
    //             await init(canvasRef.current);
    //         }

    //         setLoading(false);
    //     };
    //     stageThree();
    // }, []);



    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>{formatLinkLabel(project.title)}</h1>
                <Link className={`noSelect backButton`} href={href}>
                    <ArrowUturnLeftIcon className="h-8 w-8" /> Back
                </Link>
            </div>
            <div className={styles.mainContainer} id='mainContainer'>
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
            <Footer style={styles.footer} />
        </div>
    );
}