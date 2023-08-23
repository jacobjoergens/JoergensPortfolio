import { notFound } from "next/navigation"
import { allComputationalProjects } from "contentlayer/generated"
import Navigation from "@/components/layout/Navigation"
import Link from "next/link"
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline"
import Layout from "@/components/layout/Layout"


interface projectProps {
  params: {
    category: string | undefined
  }
}

export default async function projectPage({ params }: projectProps) {

  const href = '/'
  return (

    <div>
      <Layout>
        <Navigation listStyle='sidebar-items' linkStyle='sidebar-item' category='computational-design' allItems={allComputationalProjects} />
      </Layout>
    </div>
  )
}