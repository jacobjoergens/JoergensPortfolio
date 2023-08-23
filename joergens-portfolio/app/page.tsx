import Image from 'next/image'
import Layout from "../components/layout/Layout";
import styles from '../styles/pages/home.module.css'
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';

const Home = () => {
  return (
    <Layout>
      <div className={styles.mainContainer}>
        {/* <div className={styles.sidebar}>
        <ul className={styles.sidebarItems}>
          <li>
            <Link className={styles.sidebarItem} href={'/'}>
              About{'\n'}Me
            </Link>
          </li>
          <li>
            <Link className={styles.sidebarItem} href={'woodwork'}>
              Woodworking
            </Link>
            <Link className={styles.sidebarItem} href={'computational-design'}>
              Computational{'\n'}Design
            </Link>
          </li>
        </ul>
      </div> */}
        <div className={styles.contentContainer}>
          <div className='header'>
            Jacob Joergens
          </div>
          <div className={styles.profilepic}>
            <Image
              src='/images/JacobJoergens.jpg'
              alt='Jacob Joergens'
              width={500}
              height={300}
            />
          </div>
          <div className={styles.profilepic}>
            <Image
              src='/images/JacobJoergens.jpg'
              alt='Jacob Joergens'
              width={500}
              height={300}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
