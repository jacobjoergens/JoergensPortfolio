import Link from "next/link"

const Footer = () => {
    return (
        <footer>
            <p className='copyright'> &copy; {new Date().getFullYear()} </p>
            <Link href="/"> Jacob Joergens</Link>
        </footer>
    )
}

export default Footer
