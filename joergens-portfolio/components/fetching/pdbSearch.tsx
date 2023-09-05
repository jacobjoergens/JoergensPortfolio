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
    // const [menuHeight, setMenuHeight] = useState(0);

    const customStyles: StylesConfig<Option, false> = {
        control: (provided, state) => ({
            ...provided,            
            paddingLeft: '1rem',
            border: `1px solid ${primaryColor}`, // Remove focus border
            borderRadius: '1rem',
            // boxShadow: `0 0 0 1px ${primaryColor}`,
            '&:hover': {
                border: `1px solid ${secondaryColor}`
            },
            width: '100%',
            backgroundColor: darkGreen,
            color: primaryColor,
            bottom: '1rem',
            '&:focus .css-1hwfws3': {
                color: 'transparent',
              },
        }),
        input: (provided) => ({
            ...provided,
            margin: '0',
            color: primaryColor,
            //   color: '#dd6858',
        }),
        // Style the menu with a higher z-index
        menu: (provided) => ({
            ...provided,
            zIndex: 500, 
            color: primaryColor,
            // Adjust the value as needed
            // marginTop: `-${menuHeight}px`,
        }),

        singleValue: (provided) => ({
            ...provided, 
            color: primaryColor,
        }),
    
        placeholder: (provided) => ({
            ...provided,
            color: primaryColor, // Change placeholder color
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
        <div>
            <div>{option.label}</div>
            <div>{option.description}</div>
        </div>
    );

    // useEffect(() => {
    //     // Access the menu element by ID after the component mounts
    //     const menu = document.getElementById('react-select-menu');
    //     if (menu) {
    //       setMenuHeight(menu.clientHeight);
    //     }
    //   }, []);

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
            onChange={onChange}
            formatOptionLabel={formatOptionLabel} // Use custom formatOptionLabel function
            placeholder={formatOptionLabel({label: '7XHS', value: '7XHS', description:'Crystal structure of CipA crystal produced by cell-free protein synthesis'})}
            // menuPortalTarget={document.body}
        />
    );
};

export default PdbSearchBar;
