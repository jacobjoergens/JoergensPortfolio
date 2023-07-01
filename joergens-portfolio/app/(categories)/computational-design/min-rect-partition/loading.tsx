import styles from "styles/pages/min-rect.module.css"

const Spinner = () => {
    return(
    <div className={styles.loader}></div>
    )
}
export default function Loader() {
    return (
        <>{<Spinner/>}</>
        
    )
}