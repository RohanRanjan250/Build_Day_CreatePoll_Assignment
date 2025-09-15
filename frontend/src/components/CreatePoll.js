// frontend/src/components/CreatePoll.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5001';

function CreatePoll() {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const navigate = useNavigate();

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, '']);
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        const pollData = {
            question,
            options: options.filter(opt => opt.trim() !== '') // Filter out empty options
        };

        if (pollData.options.length < 2) {
            alert('Please provide at least two options.');
            return;
        }

        axios.post(`${API_URL}/polls`, pollData)
            .then(response => {
                navigate(`/polls/${response.data._id}`); // Redirect to the new poll's page
            })
            .catch(error => console.error('Error creating poll:', error));
    };

    return (
        <form onSubmit={handleSubmit} className="create-poll-form">
            <h2>Create a New Poll</h2>
            <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Poll Question"
                required
            />
            {options.map((option, index) => (
                <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required
                />
            ))}
            <button type="button" onClick={addOption}>Add Option</button>
            <button type="submit">Create Poll</button>
        </form>
    );
}

export default CreatePoll;