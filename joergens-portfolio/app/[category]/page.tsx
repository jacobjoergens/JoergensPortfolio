import { notFound } from "next/navigation"
import { allProjects } from "contentlayer/generated"
import Footer from "@/components/layout/Footer"
import Navigation from "@/components/layout/Navigation"

import { Metadata } from "next"
import { Mdx } from "@/components/mdx-components"
import Image from "next/image"

interface projectProps {
  params: {
    category: string | undefined
  }
}

async function getprojectFromParams(params: projectProps['params']) {
  const slug = params
  // console.log('slug:',slug['category'])
  const projects = allProjects.filter((project) => project.category === slug['category'])

  if (!projects) {
    null
  }

  return projects
}

// export async function generateMetadata({
//   params,
// }: projectProps): Promise<Metadata> {
//   const project = await getprojectFromParams(params)

//   if (!project) {
//     return {}
//   }

//   return {
//     title: project.title,
//     category: project.category,
//   }
// }

export async function generateStaticParams(): Promise<projectProps["params"][]> {
  return allProjects.map((project) => ({
    category: project.category,
  }));
}

export default async function projectPage({ params }: projectProps) {
  const projects = await getprojectFromParams(params)
  
  if (!projects) {
    notFound()
  }

  return (
    <div>
      <Navigation listStyle='sidebar-items' linkStyle='sidebar-item' allItems={projects}/>
      <Footer/>
    </div>
  )
}