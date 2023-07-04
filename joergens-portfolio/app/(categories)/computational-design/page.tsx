import { notFound } from "next/navigation"
import { allComputationalProjects } from "contentlayer/generated"
import Navigation from "@/components/layout/Navigation"
import Link from "next/link"
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline"
import { Metadata } from "next"
import { Mdx } from "@/components/mdx-components"
import Image from "next/image"

interface projectProps {
  params: {
    category: string | undefined
  }
}

export default async function projectPage({ params }: projectProps) {

  const href = '/'
  return (

    <div>
      <Link className={`noSelect backButton`} href={href}>
        <ArrowUturnLeftIcon className="h-8 w-8" /> Back
      </Link>
      <Navigation listStyle='sidebar-items' linkStyle='sidebar-item' category='computational-design' allItems={allComputationalProjects} />
    </div>
  )
}