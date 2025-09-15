// frontend/src/components/PollDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = 'http://localhost:5001';
const socket = io(API_URL);

function PollDetail() {
    const [poll, setPoll] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        // Fetch initial poll data
        axios.get(`${API_URL}/polls/${id}`)
            .then(response => setPoll(response.data))
            .catch(error => console.error('Error fetching poll:', error));
        
        // Join the specific poll room
        socket.emit('joinPoll', id);

        // Listen for updates
        socket.on('pollUpdate', (updatedPoll) => {
            setPoll(updatedPoll);
        });

        // Cleanup on component unmount
        return () => {
            socket.off('pollUpdate');
        };
    }, [id]);

    const handleVote = (optionIndex) => {
        axios.post(`${API_URL}/polls/${id}/vote`, { optionIndex })
            .catch(error => console.error('Error voting:', error));
    };

    if (!poll) return <div>Loading...</div>;

    const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

    return (
        <div className="poll-detail">
            <h2>{poll.question}</h2>
            <div className="options">
                {poll.options.map((option, index) => (
                    <div key={index} className="option-result">
                        <div className="option-text">{option.text}</div>
                        <div className="bar-container">
                             <div 
                                className="bar" 
                                style={{ width: `${totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0}%` }}
                             ></div>
                        </div>
                        <div className="votes">{option.votes} votes</div>
                         <button onClick={() => handleVote(index)}>Vote</button>
                    </div>
                ))}
            </div>
            <p className="total-votes">Total Votes: {totalVotes}</p>
        </div>
    );
}

export default PollDetail;