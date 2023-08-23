'use client'
import { useState } from "react";
import styles from "@/styles/pages/woodworking.module.css";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface CarouselProps {
    images: string[];
}

const Carousel = ({ images }: CarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const showImage = async (index: number) => {
        setCurrentIndex(index);
    };

    const prevImage = () => {
        if (images && images.length > 1) {
            const newIndex = (currentIndex - 1 + images.length) % images.length;
            setCurrentIndex(newIndex);
            showImage(newIndex);
        }
    };

    const nextImage = () => {
        if (images && images.length > 1) {
            const newIndex = (currentIndex + 1) % images.length;
            setCurrentIndex(newIndex);
            showImage(newIndex);
        }
    };

    return (
        <div className={styles.carousel}>
            <div className={`${styles.carouselSlideContainer} ${currentIndex === 0 ? styles.start : ''}`}>
                <button
                    type="button"
                    aria-label="Previous"
                    className={`${styles.carouselButton}`}
                    onClick={prevImage}
                    disabled={currentIndex === 0}
                >
                    <ChevronLeftIcon 
                        className="noSelect h-10 w-10" 
                        stroke={currentIndex === 0 ? 'transparent' : 'gray'} 
                        />
                </button>
                <div className={`noSelect ${styles.carouselImageContainer} `}>
                    {images?.map((image, index) => (
                        <div
                            className={`${styles.carouselSlide} ${currentIndex === index ? styles.active : ''}`}
                            key={index}
                        >
                            <Image
                                className='image'
                                src={image}
                                alt={`Image @ ${index}`}
                                width={900} 
                                height={600}
                                // fill={true}
                            />
                        </div>
                    ))}
                </div>
                <button
                    aria-label="Next"
                    className={`${styles.carouselButton}`}
                    onClick={nextImage}
                    disabled={currentIndex === images?.length - 1}
                >
                    <ChevronRightIcon 
                        className={`noSelect h-10 w-10`} 
                        stroke={currentIndex === images?.length - 1 ? 'transparent' : 'gray'} 
                        />
                </button>
            </div>
            <ul className={styles.thumbnailIndicators}>
                {images?.map((image, index) => (
                    <li
                        className={`${styles.thumbnailIndicator} ${currentIndex === index ? styles.active : ''}`}
                        key={index}
                    >
                        <button aria-label={`Thumbnail ${index + 1}`} onClick={() => showImage(index)}>
                            <div className={styles.thumbnailImageContainer}>
                                <Image
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    width={100}
                                    height={100}
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Carousel; 
