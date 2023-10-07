import styles from "styles/pages/coding.module.css"
import { allCodingProjects } from "contentlayer/generated"
import { Mdx } from "@/components/mdx-components";
import Link from "next/link";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

function formatLinkLabel(label: string) {
    const words = label.split(" ");
    return words.join("\n");
}

export default function CodingPage() {
    const currentProjectIndex = allCodingProjects.findIndex((project) => project.slugAsParams === 'portfolio');

    const project = allCodingProjects[currentProjectIndex] 
    const href = '/'

    return (
        <div className={styles.mainContainer}>
            <div className={styles.header}>
                <div className={styles.title}>
                    {formatLinkLabel('This Website')}
                </div>
                <Link className={`noSelect backButton`} href={href}>
                    <ArrowUturnLeftIcon className="h-8 w-8" /> Back
                </Link>
            </div>
            <div className={styles.content}>
                {project.description}
                <div className={styles.stack}>
                    <Mdx code={project.body.code} />
                </div>  
            </div>
        </div>
    )
}