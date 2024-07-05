import React, { useState, useEffect } from 'react';

const SearchBar = ({ onSearch }) => {
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    // Fetch suggestions based on the input
    useEffect(() => {
        if (input.length > 2) {  // Only fetch suggestions if the input length is more than 2 characters
            const timerId = setTimeout(() => {
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&countrycodes=dk`)
                    .then(response => response.json())
                    .then(data => {
                        setSuggestions(data);
                    })
                    .catch(err => console.error('Error fetching suggestions:', err));
            }, 500); // Add a delay of 500ms to debounce the input
            return () => clearTimeout(timerId);  // Clean up the timer
        } else {
            setSuggestions([]); // Clear suggestions if input is too short
        }
    }, [input]);

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleSelectSuggestion = (suggestion) => {
        setInput(suggestion.display_name); // Set input to the selected suggestion
        setSuggestions([]); // Clear suggestions after selection
        onSearch(suggestion.display_name); // Trigger search from the parent component
    };

    const handleSubmit = () => {
        if (input.trim() !== '') {
            onSearch(input);
            setSuggestions([]); // Clear suggestions after submitting
        }
    };

    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '10px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000 // Make sure it's on top of other map layers
        }}>
            <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Indtast adresse..."
                style={{ padding: '8px', marginRight: '8px', flex: '1' }}  // Flex 1 will allow it to take available space
            />
            <button onClick={handleSubmit} style={{ padding: '8px 12px' }}>Søg</button>
            {suggestions.length > 0 && (
                <ul style={{ listStyleType: 'none', padding: 0, margin: '10px 0 0 0', background: '#fff' }}>
                    {suggestions.map((item, index) => (
                        <li key={index} onClick={() => handleSelectSuggestion(item)} style={{ cursor: 'pointer', padding: '5px' }}>
                            {item.display_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBar;
