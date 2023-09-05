// GUI.js

import React, { useState, useEffect, useRef } from "react";
import styles from 'styles/pages/computational.module.css';
import { ChevronRightIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { compute, rhinoToThree } from "@/app/(categories)/computational-design/protein-earrings/initThree";

export default function GUI({ atomData, onRenderComplete, openGUI, toggle }) {
  // const [openGUI, setOpenGui] = useState(true);
  const [openSection, setOpenSection] = useState({ 'Parameters': true, 'Material': true });
  const [contentHeight, setContentHeight] = useState(0);
  const buttonRef = useRef(null);
  const controlsRef = useRef(null);
  const GUIRef = useRef(null);
  const [parameterSliderValues, setParameterSliderValues] = useState(
    {
      'Radius': { value: 8.5, min: 4, max: 20, step: 0.5, multiplier: 2 },
      'Charge Strength': { value: 0.5, min: 0, max: 1, step: 0.1, multiplier: 10 },
      'Trim Tolerance': { value: 10, min: 5, max: 15, step: 0.1, multiplier: 10 },
      'Smoothing Passes': { value: 0, min: 0, max: 10, step: 1, multiplier: 1 },
      'Scale': { value: 2.0, min: 1.0, max: 10, step: 0.1, multiplier: 10 },
    }); // Initial Parameter slider values

  const [displaySliderValues, setDisplaySliderValues] = useState(
    {
      'Reflectivity': { value: 1.00, min: 0, max: 1, step: 0.01, multiplier: 100 },
      'Roughness': { value: 0.00, min: 0, max: 1, step: 0.01, multiplier: 100 },
    }); //Inital Display slider values

  const [selectedMaterial, setSelectedMaterial] = useState('metal');
  const [selectedColor, setSelectedColor] = useState('#F7D498');

  // Define your preset colors for metal and plastic
  const metalColors = [
    { name: 'Silver', code: '#C0C0C0' },
    { name: 'Gold', code: '#F7D498' },
    { name: 'Bronze', code: '#CD7F32' },
  ];

  const plasticColors = [
    { name: 'Red', code: '#d83012' },
    { name: 'Blue', code: '#2e2d80' },
    { name: 'Brown', code: '#281107' },
  ];


  // const toggleGUI = () => {
  //   setOpenGui(!openGUI);
  // };

  const toggleSection = (sectionHeader) => {
    setOpenSection(prevState => ({
      ...prevState,
      [sectionHeader]: !openSection[sectionHeader]
    }))
  }

  useEffect(() => {
    handleParamSliderMouseUp();
  }, [openSection]);

  const handleParamSliderChange = (sliderName, value) => {
    const { min, max } = parameterSliderValues[sliderName];
    const adjustedValue = Math.min(Math.max(value, min), max);
    setParameterSliderValues(prevState => ({
      ...prevState,
      [sliderName]: { ...prevState[sliderName], value: adjustedValue }
    }));
  };

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

    extractedDisplayValues['Color'] = selectedColor;
    extractedParamValues['pdbID'] = atomData;
    onRenderComplete(true);
    await compute(extractedParamValues, extractedDisplayValues);
    onRenderComplete(false);
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
            onTouchEnd={handleParamSliderMouseUp}
          />
          <span className={styles.currentValue}>{slider.value}</span>
        </div>
      </div>
    )
  });

  const handleColorChange = (color) => {
    setSelectedColor(color);
  }

  useEffect(() => {
    handleDisplayMouseUp();
  }, [selectedColor])

  useEffect(() => {
    if (selectedMaterial == 'plastic') {
      setSelectedColor('#d83012');
      setDisplaySliderValues(prevState => ({
        ...prevState,
        ['Reflectivity']: { ...prevState['Reflectivity'], value: 0 }
      }));
    }
    else {
      setSelectedColor('#F7D498');
    }
  }, [selectedMaterial])
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
    extractedDisplayValues['Color'] = selectedColor;
    await rhinoToThree(extractedDisplayValues)
  };

  const displaySliders = Object.keys(displaySliderValues).map(sliderName => {
    const slider = displaySliderValues[sliderName];
    if (!(selectedMaterial == 'plastic' && sliderName == 'Reflectivity')) {
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

  // console.log(contentHeight, document.getElementById('canvas').offsetHeight*.8)
  const containerStyle = {
    // height: `${Math.min(contentHeight,document.getElementById('canvas')).offsetHeight*.8}px`,
    // overflow: 'auto',
    transition: 'height 0.3s ease',
  };

  return (
    <div className={`${styles.GUIContainer} ${openGUI ? styles.open : styles.closed}`} style={containerStyle} ref={GUIRef}>
      <div className={styles.GUI}>

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
            <div className={styles.exitGUI} ref={buttonRef}>
              {openGUI && (
                <button aria-label="Close GUI" onClick={toggle}>
                  {/* <XMarkIcon className='h-6 w-12' /> */}
                  Close
                </button>
              )}</div>
          </div>
          <div>
            {openSection['Parameters'] &&
              <>
                {[parameterSliders]}
              </>
            }
          </div>
          <div className={styles.sectionHeader}>
            <button className={styles.section} aria-label="Toggle Section" onClick={() => toggleSection('Material')}>
              {openGUI && openSection['Material'] ?
                (
                  <ChevronDownIcon className="h-6 w-12" />
                )
                :
                (<ChevronRightIcon className="h-6 w-12" />)
              }
              Material
            </button>
          </div>
          {openSection['Material'] &&
            (<div className={styles.materialSection}>
              <div className={styles.materialContainer}>
                <button
                  className={selectedMaterial === 'metal' ? styles.active : ''}
                  onClick={() => setSelectedMaterial('metal')}>Metal
                </button>
                <button
                  className={selectedMaterial === 'plastic' ? styles.active : ''}
                  onClick={() => setSelectedMaterial('plastic')}>Plastic
                </button>
              </div>
              <div className={styles.Colors}>
                {/* Colors */}
                {selectedMaterial === 'metal' && (
                  <ul>
                    {metalColors.map((color) => (
                      <li key={color.name}>
                        <span
                          className={styles.colorSwatch}
                          style={{ backgroundColor: color.code }}
                        ></span>
                        <button className={(selectedColor == color.code) ? styles.active : ''} onClick={() => handleColorChange(color.code)}> {color.name}</button>
                      </li>
                    ))}
                  </ul>
                )}
                {selectedMaterial === 'plastic' && (
                  <ul>
                    {plasticColors.map((color) => (
                      <li key={color.name}>
                        <span
                          className={styles.colorSwatch}
                          style={{ backgroundColor: color.code }}
                        ></span>
                        <button className={(selectedColor == color.code) ? styles.active : ''} onClick={() => handleColorChange(color.code)}> {color.name}</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {displaySliders}
            </div>
            )
          }
        </div>
      </div>
    </div>
  );
}
