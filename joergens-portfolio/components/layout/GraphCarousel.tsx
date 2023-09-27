'use client'
import { useEffect, useState } from "react";
import styles from "@/styles/components/graphCarousel.module.css";
import Image from "next/image";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

interface CarouselProps {
    dataType: string;
    images: string[];
    onImageChange: (index: number) => void;
    openGraphs: boolean;
}

const GraphCarousel = ({ dataType, images, onImageChange, openGraphs }: CarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const showImage = async (index: number) => {
        setCurrentIndex(index);
        onImageChange(index);

        // Find the thumbnailIndicators element
        const thumbnailIndicators = document.querySelector(`.${styles.thumbnailIndicators}`) as HTMLElement;

        if (thumbnailIndicators) {
            // Find the width of one thumbnail element
            const thumbnailWidth = thumbnailIndicators.firstElementChild?.clientWidth || 0;

            let scrollPosition;
            if (index > 2 || index < images.length - 2) {
                scrollPosition = (index - 2) * thumbnailWidth;
            } else {
                scrollPosition = index * thumbnailWidth;
            }

            // Scroll the thumbnailIndicators element
            thumbnailIndicators.scrollTo({
                left: scrollPosition,
                behavior: 'smooth',
            });
        }
        // if(thumbnailIndicators){
        //     console.log(thumbnailIndicators.offsetWidth);
        //     if (index > 2 || index < images.length - 2) {
        //         scrollPosition = (index - 2) * thumbnailIndicators.offsetWidth;
        //     } else {
        //         scrollPosition = (index) * thumbnailIndicators.offsetWidth;
        //     }
        //     thumbnailIndicators.scrollTo({
        //         left: scrollPosition,
        //         behavior: 'smooth',
        //     });
        // }
    };

    const prevImage = () => {
        if (images && images.length > 1) {
            const newIndex = (currentIndex - 1 + images.length) % images.length;
            // setCurrentIndex(newIndex);
            showImage(newIndex);
        }
    };

    const nextImage = () => {
        if (images && images.length > 1) {
            const newIndex = (currentIndex + 1) % images.length;
            // setCurrentIndex(newIndex);
            showImage(newIndex);
        }
    };

    return (
        <div className={`${styles.carousel} ${openGraphs?styles.open:styles.closed}`}>
            <div className={`${styles.graphCarouselSlideContainer} ${currentIndex === 0 ? styles.start : ''}`}>
                <div className={`noSelect ${styles.carouselImageContainer} `}>
                    {images?.map((image, index) => (
                        <div
                            className={`${styles.carouselSlide} ${currentIndex === index ? styles.active : ''}`}
                            key={index}
                        >
                            <Image
                                className='image'
                                src={dataType + image}
                                alt={`Image @ ${index}`}
                                width={900}
                                height={600}
                            // fill={true}
                            />
                        </div>
                    ))}
                </div>
            </div>
            {images && images.length > 1 &&
                <ul className={styles.thumbnailIndicators}>
                    {images?.map((image, index) => (
                        <li
                            className={`${styles.thumbnailIndicator} ${currentIndex === index ? styles.active : ''}`}
                            key={index}
                        >
                            <button aria-label={`Thumbnail ${index + 1}`} onClick={() => showImage(index)}>
                                <div className={styles.thumbnailImageContainer}>
                                    <Image
                                        src={dataType + image}
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
            }
            <div className={styles.pagination}>
                <button
                    type="button"
                    aria-label="Previous"
                    className={`${styles.carouselButton}`}
                    onClick={prevImage}
                >
                    <ArrowLeftIcon className="noSelect h-6 w-12" />
                </button>
                <div> {currentIndex + 1}/{images.length}</div>
                <button
                    aria-label="Next"
                    className={`${styles.carouselButton}`}
                    onClick={nextImage}
                >
                    <ArrowRightIcon className={`noSelect h-6 w-12`} />
                </button>
            </div>
        </div>
    );
}

export default GraphCarousel; 
