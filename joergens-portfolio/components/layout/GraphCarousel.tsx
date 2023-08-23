'use client'
import { useState } from "react";
import styles from "@/styles/components/graphCarousel.module.css";
import Image from "next/image";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";


function getCardinalAbbreviation(number: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const lastDigit = number % 10;
    const secondLastDigit = Math.floor(number / 10) % 10;

    let suffix = suffixes[0]; // Default to 'th'

    // Exceptions for 11th, 12th, 13th
    if (secondLastDigit !== 1) {
        if (lastDigit === 1) {
            suffix = suffixes[1]; // 'st' for 1
        } else if (lastDigit === 2) {
            suffix = suffixes[2]; // 'nd' for 2
        } else if (lastDigit === 3) {
            suffix = suffixes[3]; // 'rd' for 3
        }
    }

    return `${number}${suffix}`;
}

interface CarouselProps {
    dataType: string;
    images: string[];
    onImageChange: (index: number) => void;
}

const GraphCarousel = ({ dataType, images, onImageChange }: CarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const thumbnailIndicators = document.getElementsByClassName(styles.thumbnailIndicators)[0] as HTMLElement;
    const thumbnailWidth = document.getElementsByClassName(styles.active)[1] as HTMLElement; 

    const showImage = async (index: number) => {
        setCurrentIndex(index);
        onImageChange(index);
        let scrollPosition;
        if(index>2||index<images.length-2){
            scrollPosition = (index - 2) * thumbnailWidth.offsetWidth;
        } else {
            scrollPosition = (index) * thumbnailWidth.offsetWidth;
        }
        thumbnailIndicators.scrollTo({
            left: scrollPosition,
            behavior: 'smooth',
        });
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
        <div className={styles.carousel}>
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
