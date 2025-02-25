import { allWoodworkingProjects } from "contentlayer/generated"
import Navigation from "@/components/layout/Navigation"
import Layout from "@/components/layout/Layout";

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