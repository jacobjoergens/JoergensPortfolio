import { notFound } from "next/navigation"
import { allComputationalProjects } from "contentlayer/generated"
import Navigation from "@/components/layout/Navigation"
import Link from "next/link"
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline"
import Layout from "@/components/layout/Layout"

export default async function projectPage() {

  const href = '/'
  return (

    <div>
      <Layout>
        <Navigation listStyle='sidebar-items' linkStyle='sidebar-item' category='computational-design' allItems={allComputationalProjects} />
      </Layout>
    </div>
  )
}