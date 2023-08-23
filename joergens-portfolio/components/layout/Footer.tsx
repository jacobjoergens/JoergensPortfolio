import Link from "next/link"

interface StylesProp{
    style: string;
}
const Footer = ({style}:StylesProp) => {
    return (
        <footer className={style}>
            <p> &copy; {new Date().getFullYear()} </p>
            <Link href="/"> Jacob Joergens</Link>
        </footer>
    )
}

export default Footer
