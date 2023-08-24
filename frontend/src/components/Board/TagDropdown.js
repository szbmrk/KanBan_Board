import React, {useEffect, useState} from 'react';
import Select from 'react-select';
import {components} from "react-select";
import TagDropdownItem from "./TagDropdownItem";

const TagDropdown = ({tags, allTags, taskId, placeTagOnTask, removeTagFromTask, tagEditHandler, tagDeleteHandler}) => {
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
            color: 'white',
            fontWeight: 'bold',
            fontSize: 'small',
            marginRight: '4px'
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
            tagId: option.tag_id,
            value: option.name,
            label: option.name,
            color: option.color
        }));
        setOptions(tagsAsOptions);

        const selectedTagsArray = tags.map(tag => ({
            tagId: tag.tag_id,
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
            removeTagFromTask(taskId, item.tagId);
        } else {
            updatedSelectedTags.push(item); // Add the tag
            const selectedTag = allTags.find((tag) => {
                if (tag.tag_id === item.tagId) {
                    return true;
                }
            });
            placeTagOnTask(taskId, selectedTag);
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
        tagEditHandler(item);
    };

    const handleDelete = (item) => {
        tagDeleteHandler(item);
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

    const handleMultiValueRemove = (item) => {
        handleTagToggle(item);
    }

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
        ClearIndicator,
        MultiValueRemove: (props) => {
            return (
                <components.MultiValueRemove {...props}>
                    <div onClick={() => handleMultiValueRemove(props.data)}>x</div>
                </components.MultiValueRemove>
            )
        }
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