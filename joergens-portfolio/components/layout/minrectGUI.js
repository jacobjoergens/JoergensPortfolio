// GUI.js

import React, { useState, useEffect, useRef } from "react";
import styles from 'styles/pages/minrect.module.css';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { compute, rhinoToThree } from "@/app/(categories)/computational-design/mass-timber-typology/initThree";

function formatFeetAndInches(number) {
    // Extract feet and inches
    var feet = Math.floor(number);
    var inches = Math.round((number - feet) * 12);
    // Handle the case where inches overflow into feet
    if (inches === 12) {
        feet++;
        inches = 0;
    }

    return feet + "' " + inches + "\"";
}

export default function GUI({ handleGUIChange, openGUI, toggle }) {
    const [openSection, setOpenSection] = useState({ 'Parameters': true, 'Display': true, 'Partitions': true });
    const buttonRef = useRef(null);
    const controlsRef = useRef(null);
    const GUIRef = useRef(null);
    const [selectedDisplay, setSelectedDisplay] = useState('Textured');
    const [structural, setStructural] = useState(false);
    const [parameterSliderValues, setParameterSliderValues] = useState(
        {
            'Unit Width': { value: 13, min: 4, max: 20, step: 0.1, multiplier: 10 },
            'Unit Length': { value: 10, min: 4, max: 20, step: 0.1, multiplier: 10 },
            'Story Height': { value: 13, min: 8, max: 18, step: 0.1, multiplier: 10 }
        }); // Initial Parameter slider values

    const [displaySliderValues, setDisplaySliderValues] = useState(
        {
            'Grid Width': { value: 3, min: 1, max: 10, step: 1, multiplier: 1 },
            'Grid Length': { value: 3, min: 1, max: 10, step: 1, multiplier: 1 },
            'Stories': { value: 3, min: 1, max: 10, step: 1, multiplier: 1 },
        }); //Inital Display slider values

    const toggleSection = (sectionHeader) => {
        setOpenSection(prevState => ({
            ...prevState,
            [sectionHeader]: !openSection[sectionHeader]
        }))
    }

    const handleParamSliderChange = (sliderName, value) => {
        const { min, max } = parameterSliderValues[sliderName];
        const adjustedValue = Math.min(Math.max(value, min), max);
        setParameterSliderValues(prevState => ({
            ...prevState,
            [sliderName]: { ...prevState[sliderName], value: adjustedValue }
        }));
    };

    const handleParamSliderMouseUp = async () => {
        const extractedParamValues = {};
        const extractedDisplayValues = {};

        Object.entries(parameterSliderValues).forEach(([sliderName, sliderData]) => {
            extractedParamValues[sliderName] = sliderData.value;
        });
        Object.entries(displaySliderValues).forEach(([sliderName, sliderData]) => {
            extractedDisplayValues[sliderName] = sliderData.value;
        });

        extractedParamValues['Structural'] = structural;
        extractedDisplayValues['displayType'] = selectedDisplay;
        handleGUIChange(extractedParamValues, extractedDisplayValues);
    };

    const parameterSliders = Object.keys(parameterSliderValues).map(sliderName => {
        const slider = parameterSliderValues[sliderName];
        if (sliderName === 'Story Height') {
            return (
                <div className={styles.slider} key={sliderName}>
                    <label htmlFor={sliderName}>{sliderName}</label>
                    <div className={styles.sliderInput}>
                        <input
                            className={styles.rangeInput}
                            id={sliderName}
                            type="range"
                            step={slider.step * slider.multiplier}
                            min={slider.min * slider.multiplier}
                            max={slider.max * slider.multiplier}
                            value={slider.value * slider.multiplier}
                            onChange={e => handleParamSliderChange(sliderName, parseInt(e.target.value) / slider.multiplier)}
                            onMouseUp={handleParamSliderMouseUp}
                            onTouchEnd={handleParamSliderMouseUp}
                        />
                        {
                            sliderName === 'Unit Width' | sliderName === 'Unit Length' | sliderName === 'Story Height' ?
                                <span className={styles.currentValue}>{formatFeetAndInches(slider.value)}</span>
                                :
                                <span className={styles.currentValue}>{slider.value}</span>
                        }

                    </div>
                </div>
            )
        }
    });

    const handleDisplaySliderChange = (sliderName, value) => {
        const { min, max } = displaySliderValues[sliderName];
        const adjustedValue = Math.min(Math.max(value, min), max);
        setDisplaySliderValues(prevState => ({
            ...prevState,
            [sliderName]: { ...prevState[sliderName], value: adjustedValue }
        }));
    };

    const handleDisplayMouseUp = async () => {
        const extractedParamValues = {};
        const extractedDisplayValues = {};

        Object.entries(parameterSliderValues).forEach(([sliderName, sliderData]) => {
            extractedParamValues[sliderName] = sliderData.value;
        });
        Object.entries(displaySliderValues).forEach(([sliderName, sliderData]) => {
            extractedDisplayValues[sliderName] = sliderData.value;
        });

        extractedParamValues['Structural'] = structural;
        extractedDisplayValues['displayType'] = selectedDisplay;
        handleGUIChange(extractedParamValues, extractedDisplayValues);
        // await rhinoToThree(extractedParamValues, extractedDisplayValues, points)
    };

    const displaySliders = Object.keys(displaySliderValues).map(sliderName => {
        const slider = displaySliderValues[sliderName];
        if (sliderName === 'Stories') {
            return (
                <div className={styles.slider} key={sliderName}>
                    <label htmlFor={sliderName}>{sliderName}</label>
                    <div className={styles.sliderInput}>
                        <input
                            className={styles.rangeInput}
                            id={sliderName}
                            type="range"
                            step={slider.step * slider.multiplier}
                            min={slider.min * slider.multiplier}
                            max={slider.max * slider.multiplier}
                            value={slider.value * slider.multiplier}
                            onChange={e => handleDisplaySliderChange(sliderName, parseInt(e.target.value) / slider.multiplier)}
                            onMouseUp={handleDisplayMouseUp}
                            onTouchEnd={handleDisplayMouseUp}
                        />
                        <span className={styles.currentValue}>{slider.value}</span>
                    </div>
                </div>
            )
        }
    });

    const setDisplayType = (type) => {
        if (type === 'Wireframe' | type === 'Shaded') {
            setStructural(true);
        }
        setSelectedDisplay(type);
    }

    useEffect(() => {
        handleParamSliderMouseUp()
    }, [selectedDisplay])

    const containerStyle = {
        transition: 'height 0.3s ease',
    };

    return (
        <div className={`${styles.GUIContainer} ${openGUI ? styles.open : styles.closed}`} style={containerStyle} ref={GUIRef}>
            <div className={styles.GUI}>
                <div className={styles.GUISections} ref={controlsRef}>
                    <div className={styles.sectionHeader}>
                        <button className={styles.section} aria-label="Toggle Section" onClick={() => toggleSection('Display')}>
                            {openSection['Display'] ?
                                (
                                    <ChevronDownIcon className="h-6 w-12" />
                                )
                                :
                                (<ChevronRightIcon className="h-6 w-12" />)
                            }
                            Display
                        </button>
                        <div className={styles.exitGUI} ref={buttonRef}>
                            {openGUI && (
                                <button aria-label="Close GUI" onClick={toggle}>
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                    <div>
                        {openSection['Display'] &&
                            (
                                <div className={styles.parameterContainer}>
                                    <button
                                        className={selectedDisplay === 'Wireframe' ? styles.active : ''}
                                        onClick={() => setDisplayType('Wireframe')}>
                                        Wireframe
                                    </button>
                                    <button
                                        className={selectedDisplay === 'Shaded' ? styles.active : ''}
                                        onClick={() => setDisplayType('Shaded')}>
                                        Shaded
                                    </button>
                                    <button
                                        className={selectedDisplay === 'Textured' ? styles.active : ''}
                                        onClick={() => setDisplayType('Textured')}>
                                        Textured
                                    </button>
                                </div>
                            )}
                    </div>
                    <div className={styles.sectionHeader}>
                        <button className={styles.section} aria-label="Toggle Section" onClick={() => toggleSection('Parameters')}>
                            {openSection['Parameters'] ?
                                (
                                    <ChevronDownIcon className="h-6 w-12" />
                                )
                                :
                                (<ChevronRightIcon className="h-6 w-12" />)
                            }
                            Parameters
                        </button>
                    </div>
                    <div>
                        {openSection['Parameters'] &&
                            (
                                <>
                                    {[parameterSliders]}
                                    {[displaySliders]}
                                </>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
