import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Ensure you have react-router-dom installed
import './JobList.css'; // Import the CSS file for styling
import BASE_API_URL from '../utils/apiConfig';

const JobList = () => {
    const [jobs, setJobs] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch jobs from API
    const fetchJobs = async () => {
        try {
            const response = await fetch(`${BASE_API_URL}/api/jobs`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Error fetching jobs');
            }

            const data = await response.json();
            setJobs(data.jobs);
        } catch (err) {
            setError(err.message);
        }
    };

    // Delete job function
    const deleteJob = async (jobId) => {
        try {
            const response = await fetch(`${BASE_API_URL}/api/jobs/${jobId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Error deleting job');
            }

            // Refresh the job list after deletion
            fetchJobs();
        } catch (err) {
            setError(err.message);
        }
    };

    // Navigate to update job page
    const editJob = (jobId) => {
        navigate(`/update-job/${jobId}`); // Pass job ID as a URL parameter
    };

    useEffect(() => {
        fetchJobs(); // Fetch jobs on component mount
    }, []);

    return (
        <div className="job-list-container">
            <h1 className="title">Job Listings</h1>
            {error && <p className="error-message">{error}</p>}
            <table className="job-table">
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Company</th>
                        <th>Location</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.map((job) => (
                        <tr key={job._id}>
                            <td>{job.positionName}</td>
                            <td>{job.company}</td>
                            <td>{job.location}</td>
                            <td>
                                <button
                                    className="edit-button"
                                    onClick={() => editJob(job._id)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="delete-button"
                                    onClick={() => deleteJob(job._id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default JobList;
