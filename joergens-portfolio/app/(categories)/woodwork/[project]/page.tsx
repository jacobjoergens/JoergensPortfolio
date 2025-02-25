import { allWoodworkingProjects } from "contentlayer/generated";
import styles from "@/styles/pages/woodworking.module.css";
import Carousel from "@/components/layout/Carousel";
import { ArrowUturnLeftIcon, ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { Mdx } from '@/components/mdx-components';
import BackNavigationHandler from "@/components/BackNavigationHandler";

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
  return allWoodworkingProjects.map((project) => ({
    project: project.slugAsParams,
  }));
}

export default function ProjectPage({ params }: ProjectProps) {
  const currentProjectIndex = allWoodworkingProjects.findIndex((project) => project.slugAsParams === params.project);

  const project = allWoodworkingProjects[currentProjectIndex]
  const nextProject = currentProjectIndex < allWoodworkingProjects.length - 1 ? allWoodworkingProjects[currentProjectIndex + 1] : null;
  const previousProject = currentProjectIndex > 0 ? allWoodworkingProjects[currentProjectIndex - 1] : null;

  if (!project) {
    return null;
  } else {
    var href = '/woodwork'
  }

  // const MDXContent = useMDXComponent(project.body.code)

  return (
    <>
      <BackNavigationHandler />
      <div className={styles.mainContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>{formatLinkLabel(project.title)}</h1>
          <Link className={`noSelect backButton`} href={href}>
            <ArrowUturnLeftIcon className="h-8 w-8" /> Back
          </Link>
        </div>
        <Carousel images={project.images} />
        <div className={styles.content}>
          {/* <MDXContent /> */}
          <Mdx code={project.body.code} />
        </div>
        <div className={styles.pagination}>
          {previousProject &&
            <Link className={`noSelect ${styles.pageButton} ${styles.prevPage}`} href={'/woodwork/' + previousProject?.slugAsParams}>
              <ArrowLeftIcon className='h-8 w-8' /> {previousProject.title}
            </Link>
          }
          <div className="flex-grow" />
          {nextProject &&
            <Link className={`noSelect ${styles.pageButton} ${styles.nextPage}`} href={'/woodwork/' + nextProject?.slugAsParams}>
              {nextProject.title} <ArrowRightIcon className='h-8 w-8' />
            </Link>
          }
        </div>
        <Footer style={styles.footer} />
      </div>
    </>
  );
}

