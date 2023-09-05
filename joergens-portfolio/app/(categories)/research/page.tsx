'use client'
import { allResearchProjects } from "contentlayer/generated"
import Navigation from "@/components/layout/Navigation"
import Layout from "@/components/layout/Layout";

export default async function projectPage() {
  const href = '/'

  return (
    <div>
      <Layout>
        <Navigation listStyle='sidebar-items' linkStyle='sidebar-item' category='research' allItems={allResearchProjects}/>
      </Layout>
    </div>
  )
}