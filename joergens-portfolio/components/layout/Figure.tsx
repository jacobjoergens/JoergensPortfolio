import Image from "next/image";

interface props {
    src: string,
    width: number,
    height: number,
    alt: string,
    caption: string
}
const Figure = ({ src, width, height, alt, caption }: props) => {
    return (
        <figure>
            <img src={src} width={width} height={height} alt={alt} />
            {caption && <figcaption>{caption}</figcaption>}
        </figure>
    )
}

export default Figure;