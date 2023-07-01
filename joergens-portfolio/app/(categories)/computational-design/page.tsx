import { notFound } from "next/navigation"
import { allComputationalProjects } from "contentlayer/generated"
import Navigation from "@/components/layout/Navigation"

import { Metadata } from "next"
import { Mdx } from "@/components/mdx-components"
import Image from "next/image"

interface projectProps {
  params: {
    category: string | undefined
  }
}

export default async function projectPage({ params }: projectProps) {

    return (
      <div>
        <Navigation listStyle='sidebar-items' linkStyle='sidebar-item' category='computational-design' allItems={allComputationalProjects}/>
      </div>
    )
  }