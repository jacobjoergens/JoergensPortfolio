import { defineDocumentType, makeSource } from "contentlayer/source-files"
import path from 'path'

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

export const Project = defineDocumentType(() => ({
  name: "Project",
  filePathPattern: `projects/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    category:{
      type: "string",
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

export const Category = defineDocumentType(() => ({
  name: "Category",
  filePathPattern: `categories/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
  },
  computedFields,
}))

export default makeSource({
  contentDirPath: path.resolve('content'),
  documentTypes: [Project, Category],
})