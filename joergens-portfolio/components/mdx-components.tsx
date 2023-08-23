import Image from "next/image"
import Figure from "./layout/Figure"
import { useMDXComponent } from "next-contentlayer/hooks"

const components = {
  Image,
  Figure,
}

interface MdxProps {
  code: string
}

export function Mdx({ code }: MdxProps) {
  const Component = useMDXComponent(code)

  return <Component components={components} />
}