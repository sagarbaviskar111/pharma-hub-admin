import React, { useState } from 'react';
import BASE_API_URL from '../utils/apiConfig';

const DepartmentForm = () => {
    const [departmentName, setDepartmentName] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccessMessage('');

        const token = localStorage.getItem('token'); // Retrieve the token from local storage

        // Validate department name
        if (!departmentName) {
            setError('Department name is required');
            return;
        }

        try {
            const response = await fetch(`${BASE_API_URL}/api/departments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Include the token in the authorization header
                },
                body: JSON.stringify({ name: departmentName }), // Adjust based on your API requirements
            });

            if (!response.ok) {
                throw new Error('Failed to add department');
            }

            const result = await response.json();
            setSuccessMessage('Department added successfully');
            setDepartmentName(''); // Clear the input field
        } catch (error) {
            console.error('Error adding department:', error);
            setError(error.message);
        }
    };

    return (
        <div>
            <h2>Add Department</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="departmentName">Department Name:</label>
                    <input
                        type="text"
                        id="departmentName"
                        value={departmentName}
                        onChange={(e) => setDepartmentName(e.target.value)}
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                <button type="submit">Add Department</button>
            </form>
        </div>
    );
};

export default DepartmentForm;
