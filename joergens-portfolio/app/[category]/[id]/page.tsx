'use client'
import { notFound } from "next/navigation";
import { allProjects, Project } from "contentlayer/generated";
import Footer from "@/components/layout/Footer";
import styles from "@/styles/pages/project.module.css";
import React, { useState, useEffect } from "react";
import Carousel from "@/components/layout/Carousel";
import { ArrowUturnLeftIcon, ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";


interface ProjectProps {
  params: {
    id: string;
    category: string; 
  };
}

interface LabelProps {
  label: string;
}

function formatLinkLabel(label: LabelProps["label"]) {
  const words = label.split(" ");
  return words.join("\n");
}

async function getProjectFromParams(params: ProjectProps["params"]) {
  const slug = params?.id;
  const project = allProjects.findIndex((project) => project.slugAsParams === slug);

  // if (project) {
  //   return -1;
  // }

  return project;
}

export async function generateStaticParams(): Promise<ProjectProps["params"][]> {
  return allProjects.map((project) => ({
    id: project.slugAsParams,
    category: project.category,
  }));
}

export default function ProjectPage({ params }: ProjectProps) {
  const filteredProjects = allProjects.filter((project) => project.category === params.category);
  const currentProjectIndex = filteredProjects.findIndex((project) => project.slugAsParams === params.id);
  console.log('filtered length: ',filteredProjects.length);
  console.log('current index: ',currentProjectIndex);
  const project = filteredProjects[currentProjectIndex]

  const nextProject = currentProjectIndex < filteredProjects.length - 1 ? filteredProjects[currentProjectIndex + 1] : null;
  const previousProject = currentProjectIndex > 0 ? filteredProjects[currentProjectIndex - 1] : null;

  if (!project) {
    return null;
  } else {
    var href = '/' + project?.category
  }


  return (
    <div>
      <div className={styles.header}>
        <h1 className={formatLinkLabel(styles.title)}>{project.title}</h1>
        <Link className={`noSelect ${styles.backButton}`} href={href}>
          <ArrowUturnLeftIcon className="h-8 w-8" /> Back
        </Link>
      </div>
      <Carousel project={project} />
      <h2 className={styles.sectionHeader}> Material: </h2>
      <p className={styles.section}>  {project.material}</p>
      <h2 className={styles.sectionHeader}> Dimensions: </h2>
      <p className={styles.section}>  {project.dimensions}</p>
      <h2 className={styles.sectionHeader}> Description: </h2>
      <p className={styles.section}> {project.description}</p>
      <div className={styles.pagination}>
        {previousProject &&
          <Link className={`noSelect ${styles.pageButton}`} href={'/' + project.category + '/' + previousProject?.slugAsParams}>
            <ArrowLeftIcon className='h-8 w-8' /> {previousProject.title}
          </Link>
        }
        <div className="flex-grow" />
        {nextProject &&
          <Link className={`noSelect ${styles.pageButton} ${styles.nextPage}`} href={'/' + project.category + '/' + nextProject?.slugAsParams}>
            {nextProject.title} <ArrowRightIcon className='h-8 w-8' />
          </Link>
        }
      </div>
      <Footer />
    </div>
  );

}
