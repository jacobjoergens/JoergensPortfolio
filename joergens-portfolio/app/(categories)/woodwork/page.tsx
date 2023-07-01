import { notFound } from "next/navigation"
import { allWoodworkingProjects } from "contentlayer/generated"
import Navigation from "@/components/layout/Navigation"
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { Metadata } from "next"
import { Mdx } from "@/components/mdx-components"
import Image from "next/image"

interface projectProps {
  params: {
    category: string | undefined
  }
}

// async function getProjectsFromParams() {
//   const projects = allProjects.filter((project) => project.category === 'woodwork')

//   if (!projects) {
//     null
//   }

//   return projects
// }

// export async function generateStaticParams(): Promise<projectProps["params"][]> {
//   return allProjects.map((project) => ({
//     category: project.category,
//   }));
// }

export default async function projectPage({ params }: projectProps) {
  const href = '/'
  return (
    <div>
      <Link className={`noSelect backButton`} href={href}>
          <ArrowUturnLeftIcon className="h-8 w-8" /> Back
      </Link>
      <Navigation listStyle='sidebar-items' linkStyle='sidebar-item' category='woodwork' allItems={allWoodworkingProjects}/>
    </div>
  )
}