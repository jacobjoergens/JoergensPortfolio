import { defineDocumentType, makeSource } from "contentlayer/source-files"
import path from 'path'
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"

/** @type {import('contentlayer/source-files').ComputedFields} */
const computedFields = {
  slug: {
    type: "string",
    resolve: (doc) => `/${doc._raw.flattenedPath}`,
  },
  slugAsParams: {
    type: "string",
    resolve: (doc) => doc._raw.flattenedPath.split("/").slice(1).join("/"),
  },
}

export const WoodworkingProject = defineDocumentType(() => ({
  name: "WoodworkingProject",
  filePathPattern: `woodworking-projects/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    images: {
      type: 'list',
      of: { type: 'string' },
      required: true,
    },
    material: {
      type: "string"
    }, 
    dimensions: {
      type: "string"
    },
    description: {
      type: "string"
    }
  },
  computedFields,
}))

export const ComputationalProject = defineDocumentType(() => ({
  name: "ComputationalProject",
  filePathPattern: `computational-projects/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string"
    }
  },
  computedFields,
}))

export const ResearchProject = defineDocumentType(() => ({
  name: "ResearchProject",
  filePathPattern: `research-projects/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    images: {
      type: 'list',
      of: { type: 'string' },
      required: true,
    },
    description: {
      type: "string"
    }
  },
  computedFields,
}))

export const CodingProject = defineDocumentType(() => ({
  name: "CodingProject",
  filePathPattern: `coding-projects/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    images: {
      type: 'list',
      of: { type: 'string' },
      required: false,
    },
    description: {
      type: "string"
    }
  },
  computedFields,
}))

export default makeSource({
  contentDirPath: path.resolve('content'),
  documentTypes: [
    WoodworkingProject,
    ComputationalProject,
    ResearchProject,
    CodingProject,
  ],
  mdx: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
})