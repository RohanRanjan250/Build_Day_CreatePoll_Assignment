// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import PollList from './components/PollList';
import PollDetail from './components/PollDetail';
import CreatePoll from './components/CreatePoll';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/create">Create Poll</Link>
                </nav>
                <main>
                    <Routes>
                        <Route path="/" element={<PollList />} />
                        <Route path="/polls/:id" element={<PollDetail />} />
                        <Route path="/create" element={<CreatePoll />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;