import Image from 'next/image'
import Layout from "../components/layout/Layout";
import styles from '../styles/pages/home.module.css'
import Link from 'next/link';

const Home = () => {
  return (
    <Layout>
      <div className={styles.mainContainer}>
        <div className={styles.contentContainer}>
          <div className={styles.header}>
            Jacob Joergens
          </div>
          <div className={styles.profilepic}>
            <Image
              src='/images/me.jpg'
              alt='Jacob Joergens'
              width={500}
              height={300}
            />
          </div>
          {/* <div className={styles.profilepic}>
            <Image
              src='/images/JacobJoergens.jpg'
              alt='Jacob Joergens'
              width={500}
              height={300}
            />
          </div> */}
          <div className={styles.description}> I am a computational designer, woodworker, and physicist. I’m currently living in New York and working as a cheese monger. In the past few months, I’ve spent my free time coding this website. It’s intended as a living resume and as a place to highlight some of the projects I’ve worked on. </div>
          <div className={styles.section}>
            <div className={styles.sectionHeader}> Highlights </div>
            <div className={styles.highlights}>
              <Link className={styles.highlight} href={'/computational-design/protein-earrings'}>
                <Image
                  src='/images/sculptural-language/vantongerloo-painting.svg'
                  alt='Protein Earrings'
                  width={400}
                  height={400}
                />
                Protein Earrings
              </Link>
              <Link className={styles.highlight} href={'/computational-design/min-rect-partition'}>
                <Image
                  src='/images/sculptural-language/vantongerloo-painting.svg'
                  alt='Minimum Rectangular Partitioning'
                  width={400}
                  height={400}
                />
                Minimum Rectangular Partitioning
              </Link>
              <Link className={styles.highlight} href={'/woodwork/lamp'}>
                <Image
                  src='/images/bottwinLamp/J.Joergens.Lamp.jpg'
                  alt='Bottwin Lamp'
                  width={400}
                  height={400}
                />
                Bottwin Lamp
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
