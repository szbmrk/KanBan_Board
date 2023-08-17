import React, {useEffect, useState} from 'react';
import Select from 'react-select';
import TagDropdownItem from "./TagDropdownItem";

const TagDropdown = ({tags, allTags}) => {
    const [selectedTags, setSelectedTags] = useState([]);
    const [options, setOptions] = useState([]);

    const [inputValue, setInputValue] = useState('');

    const customStyles = {
        container: (base) => ({
            ...base,
            width: '60%'
        }),
        control: (base) => ({
            ...base,
            backgroundColor: 'lightGray'
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.data.color,
            color: 'white'
        }),
        multiValue: (base, state) => ({
            ...base,
            backgroundColor: state.data.color,
            borderRadius: '4px'
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: 'white'
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: 'white'
        }),
        indicatorSeparator: (base) => ({
            ...base,
            backgroundColor: 'black'
        }),
        dropdownIndicator: (base) => ({
            ...base,
            color: 'black'
        }),
        menuList: (base) => ({
            ...base,
            padding: '0 5px',
            borderRadius: '4px',
            backgroundColor: 'lightGray'
        })
    };

    useEffect(() => {
        const tagsAsOptions = allTags.map(option => ({
            value: option.name,
            label: option.name,
            color: option.color
        }));
        setOptions(tagsAsOptions);

        const selectedTagsArray = tags.map(tag => ({
            value: tag.name,
            label: tag.name,
            color: tag.color
        }));
        setSelectedTags(selectedTagsArray);
    }, [allTags]);

    const theme = theme => ({
        ...theme,
        fonts: {
            ...theme.fonts,
            base: 'Raleway, sans-serif',
        },
    });

    const handleTagToggle = (item) => {
        const updatedSelectedTags = [...selectedTags];
        const index = updatedSelectedTags.findIndex(tag => tag.value === item.value);

        if (index !== -1) {
            updatedSelectedTags.splice(index, 1); // Remove the tag
        } else {
            updatedSelectedTags.push(item); // Add the tag
        }

        // Reorder the selected tags based on the options array
        updatedSelectedTags.sort((a, b) => {
            const indexA = options.findIndex(option => option.value === a.value);
            const indexB = options.findIndex(option => option.value === b.value);
            return indexA - indexB;
        });

        handleInputChange('');

        setSelectedTags(updatedSelectedTags);
    }

    const handleEdit = (item) => {
        // Handle edit logic
        console.log('edit');
    };

    const handleDelete = (item) => {
        // Handle delete logic
        console.log('delete');
    };

    const ClearIndicator = () => {
        return null;
    }

    const handleInputChange = (newValue) => {
        setInputValue(newValue);
        return newValue;
    };

    const handleMenuClose = () => {
        setInputValue('');
    };

    const customComponents = {
        Option: (props) => (
            <TagDropdownItem
                data={props.data}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={handleTagToggle}
                selectedTags={selectedTags}
            />
        ),
        ClearIndicator
    };

    return (
        <Select
            options={options}
            isMulti
            value={selectedTags}
            onChange={setSelectedTags}
            placeholder="Select tags or create a new one..."
            styles={customStyles}
            theme={theme}
            components={customComponents}
            hideSelectedOptions={false}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onMenuClose={handleMenuClose}
        />
    );
};

export default TagDropdown;