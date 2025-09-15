// frontend/src/components/PollList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5001';

function PollList() {
    const [polls, setPolls] = useState([]);

    useEffect(() => {
        axios.get(`${API_URL}/polls`)
            .then(response => {
                setPolls(response.data);
            })
            .catch(error => console.error('Error fetching polls:', error));
    }, []);

    return (
        <div className="poll-list">
            <h2>All Polls</h2>
            {polls.length === 0 ? <p>No polls available.</p> :
                <ul>
                    {polls.map(poll => (
                        <li key={poll._id}>
                            <Link to={`/polls/${poll._id}`}>{poll.question}</Link>
                        </li>
                    ))}
                </ul>
            }
        </div>
    );
}

export default PollList;