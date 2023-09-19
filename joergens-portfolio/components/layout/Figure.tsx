import Image from "next/image";
import styles from "styles/components/figure.module.css"

interface props {
    src: string,
    width: number,
    height: number,
    alt: string,
    caption: string
}
const Figure = ({ src, width, height, alt, caption }: props) => {
    return (
        <figure className={styles.fig}>
            <Image src={src} width={width} height={height} alt={alt} />
            {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
        </figure>
    )
}

export default Figure;