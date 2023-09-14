import React, { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { StylesConfig } from 'react-select/dist/declarations/src';
import styles from "styles/pages/computational.module.css"

interface Option {
    label: string;
    value: string;
    description: string; // Add description property
}

interface PdbSearchBarProps {
    onChange: (option: Option | null) => void;
}

const primaryColor = '#dd6858'; 
const secondaryColor = '#d83012'

const darkGreen = '#080f0e'


const PdbSearchBar: React.FC<PdbSearchBarProps> = ({ onChange }) => {
    const [isInputFocused, setInputFocused] = useState(false);

    const customStyles: StylesConfig<Option, false> = {
        control: (provided, state) => ({
            ...provided,            
            paddingLeft: '1rem',
            border: `1px solid ${isInputFocused ? secondaryColor : primaryColor}`, // Remove focus border
            borderRadius: '1rem',
            boxShadow: `0 0 0 ${isInputFocused ? '1px':'0px'} ${primaryColor}`,
            '&:hover': {
                border: `1px solid ${secondaryColor}`
            },
            backgroundColor: darkGreen,
            color: primaryColor,
            '&:focus .css-1hwfws3': {
                color: 'transparent',
              },
            alignItems: 'center',
            marginLeft: '1rem',
            marginRight: '1rem',
        }),

        input: (provided) => ({
            ...provided,
            margin: '0',
            color: primaryColor,
            //   color: '#dd6858',
        }),

        menu: (provided) => ({
            ...provided,
            zIndex: 500, 
            color: primaryColor,
            display: 'flex',
            flexDirection: 'row',
            width: '97%',
            top: '2rem',
            left: '1rem',
        }),

        singleValue: (provided) => ({
            ...provided, 
            color: primaryColor,
            display: `${isInputFocused ? 'none' : 'flex'}`,
            whiteSpace: 'normal',
            padding: '0.5rem',
        }),
    
        placeholder: (provided) => ({
            ...provided,
            color: primaryColor, // Change placeholder color
            display: `${isInputFocused?'none':'block'}`
        }),
        
        dropdownIndicator: (provided) => ({
            ...provided,
            color: primaryColor, // Change dropdown arrow color
            '&:hover':{
                color: secondaryColor,
            },
        }),
        
        indicatorSeparator: (provided) => ({
            ...provided,
            backgroundColor: primaryColor,
        }),
    };

    const loadOptions = async (inputValue: string) => {
        try {
            const response = await fetch(`/api/searchPDB`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: inputValue }),
            });

            if (response.ok) {
                const suggestions: Option[] = await response.json(); // Parse as Option[]
                return suggestions;
            } else {
                throw new Error('Failed to fetch suggestions');
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            return [];
        }
    };

    const formatOptionLabel = (option: Option) => (
        <div className={styles.proteinInfo}>
            <div className={styles.label}> {option.label}</div>
            <div className={styles.divider}></div>
            <div className={styles.description}> {option.description}</div>
        </div>
    );

    const handleInputFocus = () => {
        setInputFocused(true);
      };
    
      // Handle input blur
    const handleInputBlur = () => {
        setInputFocused(false);
    };

    const handleChange = (option: any) => {
        handleInputBlur();
        onChange(option);
    }

    return (
        <AsyncSelect
            className={styles.searchbar}
            styles={customStyles}
            loadOptions={(inputValue, callback) => {
                loadOptions(inputValue)
                    .then((formattedSuggestions) => {
                        callback(formattedSuggestions);
                    })
                    .catch(() => {
                        callback([]);
                    });
            }}
            onChange={handleChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            formatOptionLabel={formatOptionLabel} // Use custom formatOptionLabel function
            placeholder={"Search for protein..."}
            defaultValue={{ label: '7XHS', value: '7XHS', description: 'Crystal structure of CipA crystal produced by cell-free protein synthesis' }}
                // formatOptionLabel({label: '7XHS', value: '7XHS', description:'Crystal structure of CipA crystal produced by cell-free protein synthesis'})}
            // menuPortalTarget={document.body}
        />
    );
};

export default PdbSearchBar;
