'use client'
import { useEffect, useState } from "react";
import { useWindowSize } from "@/hooks/useWindowSize";
import { notFound } from "next/navigation"
import { allWoodworkingProjects } from "contentlayer/generated"
import Navigation from "@/components/layout/Navigation"
import { ArrowUturnLeftIcon, Bars4Icon } from "@heroicons/react/24/outline"
import Link from "next/link"
import Layout from "@/components/layout/Layout";

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

export default async function projectPage() {
  const href = '/'

  return (
    <div>
      <Layout>
        <Navigation listStyle='sidebar-items' linkStyle='sidebar-item' category='woodwork' allItems={allWoodworkingProjects}/>
      </Layout>
    </div>
  )
}