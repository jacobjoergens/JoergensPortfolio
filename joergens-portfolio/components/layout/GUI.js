// GUI.js

import React, { useState, useEffect, useRef } from "react";
import styles from 'styles/pages/computational.module.css';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { compute, rhinoToThree } from "@/app/(categories)/computational-design/protein-earrings/initThree";
import PdbSearchBar from "../fetching/pdbSearch";

export default function GUI({atomData}) {
  const [openGUI, setOpenGui] = useState(true);
  const [openSection, setOpenSection] = useState({ 'Parameters': true, 'Display': true });
  const [contentHeight, setContentHeight] = useState(0);
  const buttonRef = useRef(null);
  const controlsRef = useRef(null);
  const GUIRef = useRef(null);
  const [parameterSliderValues, setParameterSliderValues] = useState(
    {
      'Radius': { value: 16, min: 0, max: 20, step: 0.5, multiplier: 2 },
      'Charge Strength': { value: 0.5, min: 0, max: 1, step: 0.1, multiplier: 10 },
      'Trim Tolerance': { value: 8.6, min: 0, max: 10, step: 0.2, multiplier: 5 }
    }); // Initial Parameter slider values

  const [displaySliderValues, setDisplaySliderValues] = useState(
    {
      'Metalness': { value: 1.00, min: 0, max: 1, step: 0.01, multiplier: 100 },
      'Roughness': { value: 0.00, min: 0, max: 1, step: 0.01, multiplier: 100 },
      'Exposure': { value: 1, min: 0, max: 2, step: 0.01, multiplier: 100} 
    }); //Inital Display slider values


  const toggleGUI = () => {
    setOpenGui(!openGUI);
  };

  const toggleSection = (sectionHeader) => {
    setOpenSection(prevState => ({
      ...prevState,
      [sectionHeader]: !openSection[sectionHeader]
    }))
  }

  useEffect(() => {
    if (openGUI) {
      const calculateContentHeight = () => {
        const controlsHeight = controlsRef.current.scrollHeight;
        setContentHeight(buttonRef.current.offsetHeight + controlsHeight);
      };

      // Delay the height calculation to allow rendering of the content
      const timeoutId = setTimeout(calculateContentHeight, 0);
      handleParamSliderMouseUp();
      return () => clearTimeout(timeoutId);
    } else {
      setContentHeight(buttonRef.current.offsetHeight);
    }
  }, [openGUI, openSection]);

  const handleParamSliderChange = (sliderName, value) => {
    const { min, max } = parameterSliderValues[sliderName];
    const adjustedValue = Math.min(Math.max(value, min), max);
    setParameterSliderValues(prevState => ({
      ...prevState,
      [sliderName]: { ...prevState[sliderName], value: adjustedValue }
    }));
  };

  useEffect(() => {
    console.log('change!!!')
    const computeData = async () => {
      handleParamSliderMouseUp(); 
    };

    computeData();
  }, [atomData]);

  const handleParamSliderMouseUp = async () => {
    // const sliderList = Object.keys(sliderValues).map(name => ({
    //   [name]: sliderValues[name].value
    // }));
    const extractedParamValues = {};
    Object.entries(parameterSliderValues).forEach(([sliderName, sliderData]) => {
      extractedParamValues[sliderName] = sliderData.value;
    });

    const extractedDisplayValues = {};
    Object.entries(displaySliderValues).forEach(([sliderName, sliderData]) => {
      extractedDisplayValues[sliderName] = sliderData.value;
    })
    extractedParamValues['pdbID'] = atomData;
    await compute(extractedParamValues, extractedDisplayValues);
  };

  const parameterSliders = Object.keys(parameterSliderValues).map(sliderName => {
    const slider = parameterSliderValues[sliderName];

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
          />
          <span className={styles.currentValue}>{slider.value}</span>
        </div>
      </div>
    )
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
    const extractedDisplayValues = {};
    Object.entries(displaySliderValues).forEach(([sliderName, sliderData]) => {
      extractedDisplayValues[sliderName] = sliderData.value;
    })
    await rhinoToThree(extractedDisplayValues)
  };

  const displaySliders = Object.keys(displaySliderValues).map(sliderName => {
    const slider = displaySliderValues[sliderName];

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
          />
          <span className={styles.currentValue}>{slider.value}</span>
        </div>
      </div>
    )
  });

  // console.log(contentHeight, document.getElementById('canvas').offsetHeight*.8)
  const containerStyle = {
    // height: `${Math.min(contentHeight,document.getElementById('canvas')).offsetHeight*.8}px`,
    // overflow: 'auto',
    transition: 'height 0.3s ease',
  };

  return (
    <div className={styles.GUI} style={containerStyle} ref={GUIRef}>
      <div className={styles.titleGUI} ref={buttonRef}>
        <button aria-label="Toggle Section" onClick={toggleGUI}>
          {openGUI ?
            (<ChevronDownIcon className='h-6 w-12' />)
            :
            (<ChevronRightIcon className="h-6 w-12" />)
          }
          Controls
        </button>
      </div>
      <div className={styles.GUISections} ref={controlsRef}>
        <div className={styles.sectionHeader}>
          {openGUI && (
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
          )}
        </div>
        <div>
          {openSection['Parameters'] &&
            <>
            <PdbSearchBar />
            {[parameterSliders]}
            </>
          }
        </div>
        <div className={styles.sectionHeader}>
          <button className={styles.section} aria-label="Toggle Section" onClick={() => toggleSection('Display')}>
            {openGUI && openSection['Display'] ?
              (
                <ChevronDownIcon className="h-6 w-12" />
              )
              :
              (<ChevronRightIcon className="h-6 w-12" />)
            }
            Display
          </button>
          <div>
            {openSection['Display'] && 
              [displaySliders]
            }
          </div>
        </div>
      </div>
    </div>
  );
}
