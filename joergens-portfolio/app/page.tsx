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
              width={400}
              height={400}
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
          <div className={styles.description}> I am a computational designer, coder, physicist, and woodworker based in New York City. This website is an interactive resume highlighting some of my projects.  </div>
          <div className={styles.section}>
            <div className={styles.sectionHeader}> Highlights </div>
            <div className={styles.highlights}>
              <Link className={styles.highlight} href={'/computational-design/protein-earrings'}>
                <div className={styles.highlightTitle}>Protein Earrings</div>
                <div className={styles.highlightCard}>
                  <Image
                    src='/images/sOPH-earrings.png'
                    alt='Protein Earrings'
                    width={400}
                    height={400}
                  />
                </div>
              </Link>
              <Link className={styles.highlight} href={'/woodwork/lamp'}>
                <div className={styles.highlightTitle}>Bottwin Lamp</div>
                <div className={styles.highlightCard}>
                  <Image
                    src='/images/bottwinLamp/J.Joergens.Lamp.jpg'
                    alt='Bottwin Lamp'
                    width={400}
                    height={400}
                  />
                </div>
              </Link>
              <Link className={styles.highlight} href={'/computational-design/min-rect-partition'}>
                <div className={styles.highlightTitle}>Minimum Rectangular Partitioning</div>
                <div className={styles.highlightCard}>
                  <Image
                    src='/images/min-rect-example.png'
                    alt='Minimum Rectangular Partitioning'
                    width={400}
                    height={400}
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
