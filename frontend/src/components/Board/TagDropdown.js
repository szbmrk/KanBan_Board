import React, { useEffect, useState } from "react";
import Select from "react-select";
import { components } from "react-select";
import TagDropdownItem from "./TagDropdownItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const TagDropdown = ({
  tags,
  allTags,
  taskId,
  placeTagOnTask,
  removeTagFromTask,
  tagEditHandler,
  tagDeleteHandler,
}) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [options, setOptions] = useState([]);

  const closeIcon = <FontAwesomeIcon icon={faXmark} />;

  const [inputValue, setInputValue] = useState("");

  const customStyles = {
    container: (base) => ({
      ...base,
      width: "60%",
    }),
    control: (base) => ({
      ...base,
      backgroundColor: "var(--light-gray)",
      border: "none",
      borderRadius: "5px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.data.color,
      color: "var(--off-white)",
    }),
    multiValue: (base, state) => ({
      ...base,
      backgroundColor: state.data.color,
      borderRadius: "5px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "5px",
      padding: "2px 5px",
    }),
    multiValueGeneric: (base) => ({
      ...base,
      padding: "0",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "var(--off-white)",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "var(--off-white)",
      fontSize: "0.8em",
      cursor: "pointer",
      padding: "0",
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: "var(--dark-gray)",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "var(--dark-gray)",
    }),
    menuList: (base) => ({
      ...base,
      padding: "0 5px",
      borderRadius: "5px",
      backgroundColor: "var(--light-gray)",
    }),
  };

  useEffect(() => {
    const tagsAsOptions = allTags.map((option) => ({
      tagId: option.tag_id,
      value: option.name,
      label: option.name,
      color: option.color,
    }));
    setOptions(tagsAsOptions);

    const selectedTagsArray = tags.map((tag) => ({
      tagId: tag.tag_id,
      value: tag.name,
      label: tag.name,
      color: tag.color,
    }));
    setSelectedTags(selectedTagsArray);
  }, [allTags]);

  const theme = (theme) => ({
    ...theme,
    fonts: {
      ...theme.fonts,
      base: "var(--basic-font)",
    },
  });

  const handleTagToggle = (item) => {
    const updatedSelectedTags = [...selectedTags];
    const index = updatedSelectedTags.findIndex(
      (tag) => tag.value === item.value
    );

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
      const indexA = options.findIndex((option) => option.value === a.value);
      const indexB = options.findIndex((option) => option.value === b.value);
      return indexA - indexB;
    });

    handleInputChange("");

    setSelectedTags(updatedSelectedTags);
  };

  const handleEdit = (item) => {
    tagEditHandler(item);
  };

  const handleDelete = (item) => {
    tagDeleteHandler(item);
  };

  const ClearIndicator = () => {
    return null;
  };

  const handleInputChange = (newValue) => {
    setInputValue(newValue);
    return newValue;
  };

  const handleMenuClose = () => {
    setInputValue("");
  };

  const handleMultiValueRemove = (item) => {
    handleTagToggle(item);
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
    ClearIndicator,
    MultiValueRemove: (props) => {
      return (
        <components.MultiValueRemove {...props}>
          <div onClick={() => handleMultiValueRemove(props.data)}>
            <span>{closeIcon}</span>
          </div>
        </components.MultiValueRemove>
      );
    },
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
