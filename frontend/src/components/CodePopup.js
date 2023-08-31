import React, { useState, useEffect } from 'react';
import Dropdown from 'react-dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import axios from '../api/axios';
import '../styles/popup.css';
import '../styles/CodePopup.css';
import hljs from 'highlight.js';
import ErrorWrapper from "../ErrorWrapper";

const CodePopup = ({ board_id, codeReviewOrDocumentation, reloadCodeReviewOrDocumentation, onCancel }) => {
    const SearchListForValue = (list, searchValue) => {
        return list.find((option) => option.value.toLowerCase() === searchValue.toLowerCase());
    };

    const codeOptions = [
        { value: 'Documentation', label: 'Documentation' },
        { value: 'Code review', label: 'Code review' },
    ];
    const [selectedOption, setSelectedOption] = useState(
        codeReviewOrDocumentation
            ? SearchListForValue(codeOptions, codeReviewOrDocumentation.codeReviewOrDocumentationType).value
            : codeOptions[0].value
    );

    const aiOptions = [
        { value: 'chatgpt', label: 'ChatGPT' },
        { value: 'llama', label: 'Llama' },
        { value: 'bard', label: 'Bard' },
    ];
    let [chosenAI, setChosenAI] = useState(
        codeReviewOrDocumentation
            ? SearchListForValue(aiOptions, codeReviewOrDocumentation.chosenAI).value
            : aiOptions[0].value
    );

    const [inputCode, setInputCode] = useState(
        codeReviewOrDocumentation ? codeReviewOrDocumentation.codeReviewOrDocumentationText : ''
    );
    const [output, setOutput] = useState(
        codeReviewOrDocumentation ? codeReviewOrDocumentation.codeReviewOrDocumentation : ''
    );

    const closeIcon = <FontAwesomeIcon icon={faXmark} />;

    const [error, setError] = useState(null);

    const handleRunClick = async () => {
        try {
            const token = sessionStorage.getItem('token');
            console.log('selectedOption');
            console.log(selectedOption);
            console.log(inputCode);
            const res = await axios.post(
                `/boards/${board_id}/AGI/GenerateCodeReviewOrDocumentation`,
                {
                    code: inputCode,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        agi_answer_id: codeReviewOrDocumentation ? codeReviewOrDocumentation.agi_answer_id : undefined,
                        ChosenType: `${selectedOption}`,
                        ChosenAI: `${chosenAI}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log(res);
            console.log(res.data.review);
            setOutput(res.data.review);
            reloadCodeReviewOrDocumentation();
        } catch (e) {
            setError(e.response.data);
        }
    };

    useEffect(() => {
        hljs.highlightAll();
    });

    return (
        <div className='overlay'>
            <div className='popup agi-popup'>
                <span className='close-btn' onClick={onCancel}>
                    {closeIcon}
                </span>
                <div className='gt-popup-content'>
                    <h2>Coding popup</h2>
                    <div className='coding-container'>
                        <p>Your code:</p>
                        <pre>
                            <code
                                className='code-textarea'
                                contentEditable='true'
                                spellCheck='true'
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value)}
                            />
                        </pre>
                    </div>
                    <div className='gt-action-buttons'>
                        <div className='dropdown-container'>
                            <p>Which AI do you want to use?</p>
                            <Dropdown
                                className='code-dropdown'
                                options={aiOptions}
                                value={chosenAI}
                                onChange={(selectedOption) => setChosenAI(selectedOption.value)}
                            />
                        </div>
                        <div className='dropdown-container'>
                            <p>Choose what you would like to do:</p>
                            <Dropdown
                                className='code-dropdown'
                                options={codeOptions}
                                value={selectedOption}
                                onChange={(option) => setSelectedOption(option.value)}
                                placeholder='Select an option'
                            />
                        </div>
                        <button className='generate-button' onClick={handleRunClick}>
                            Run
                        </button>
                    </div>
                    <textarea className='output-textarea' value={output} disabled />
                </div>
            </div>
            {error && (
                <ErrorWrapper originalError={error} onClose={() => {setError(null);}}/>
            )}
        </div>
    );
};

export default CodePopup;
