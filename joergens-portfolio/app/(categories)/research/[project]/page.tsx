'use client'
import { allResearchProjects } from "contentlayer/generated";
import styles from "@/styles/pages/woodworking.module.css";
import React from "react";
import Carousel from "@/components/layout/Carousel";
import { ArrowUturnLeftIcon, ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { Mdx } from '@/components/mdx-components';
import { ImageResponse } from "next/server";
import Image from "next/image";

interface ProjectProps {
  params: {
    category: string;
    project: string;
  };
}


function formatLinkLabel(label: string) {
  const words = label.split(" ");
  return words.join("\n");
}

export async function generateStaticParams() {
  return allResearchProjects.map((project) => ({
    project: project.slugAsParams,
  }));
}

export default function ProjectPage({ params }: ProjectProps) {
  const currentProjectIndex = allResearchProjects.findIndex((project) => project.slugAsParams === params.project);

  const project = allResearchProjects[currentProjectIndex]
  const nextProject = currentProjectIndex < allResearchProjects.length - 1 ? allResearchProjects[currentProjectIndex + 1] : null;
  const previousProject = currentProjectIndex > 0 ? allResearchProjects[currentProjectIndex - 1] : null;

  if (!project) {
    return null;
  } else {
    var href = '/research'
  }

  // const MDXContent = useMDXComponent(project.body.code)

  return (
    <div className={styles.mainContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>{formatLinkLabel(project.title)}</h1>
        <Link className={`noSelect backButton`} href={href}>
          <ArrowUturnLeftIcon className="h-8 w-8" /> Back
        </Link>
      </div>
      <Carousel images={project.images}/>
      <div className={styles.content}>
        {/* <MDXContent /> */}
        <Mdx code={project.body.code} />
      </div>
      <div className={styles.pagination}>
        {previousProject &&
          <Link className={`noSelect ${styles.pageButton}`} href={'/research/' + previousProject?.slugAsParams}>
            <ArrowLeftIcon className='h-8 w-8' /> {previousProject.title}
          </Link>
        }
        <div className="flex-grow" />
        {nextProject &&
          <Link className={`noSelect ${styles.pageButton} ${styles.nextPage}`} href={'/research/' + nextProject?.slugAsParams}>
            {nextProject.title} <ArrowRightIcon className='h-8 w-8' />
          </Link>
        }
      </div>
      <Footer style={styles.footer}/>
    </div>
  );
}