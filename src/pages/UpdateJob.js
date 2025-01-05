import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Use for fetching id from the URL
import './UpdateJob.css'; // Add CSS styling for the update job page
import BASE_API_URL from '../utils/apiConfig';

const UpdateJob = () => {
    const { id } = useParams(); // Extract id from the URL
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [job, setJob] = useState({
        company: '',
        positionName: '',
        email: '',
        qualification: '',
        experience: '',
        salary: '',
        location: '',
        responsibilities: [],
        tags: '',
        skills: [],
        companyOverview: '',
        department: '',
        applylink: '',
        image: '', // Add image to state
        logo: '', // Add logo to state
    });
    const [responsibility, setResponsibility] = useState('');
    const [skill, setSkill] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Fetch job details to pre-fill the form
    const fetchJobDetails = async () => {
        try {
            const response = await fetch(`${BASE_API_URL}/api/jobs/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Error fetching job details.');
            }

            const data = await response.json();
            // setJob(data);
            setJob({
                ...data,  // Spread the existing data into the state
                department: data.department._id,  // Set the department to the ID
              });

        } catch (err) {
            setError(err.message);
        }
    };

    // Fetch departments for the dropdown
    const fetchDepartments = async () => {
        try {
            const response = await fetch(`${BASE_API_URL}/api/departments`);
            const data = await response.json();
            setDepartments(data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    useEffect(() => {
        fetchJobDetails();
        fetchDepartments();
    }, []);

    const handleAddResponsibility = () => {
        if (responsibility.trim()) {
            setJob((prevState) => ({
                ...prevState,
                responsibilities: [...prevState.responsibilities, responsibility],
            }));
            setResponsibility('');
        }
    };

    const handleAddSkill = () => {
        if (skill.trim()) {
            setJob((prevState) => ({
                ...prevState,
                skills: [...prevState.skills, skill],
            }));
            setSkill('');
        }
    };

    const handleChange = (e) => {
        setJob({
            ...job,
            [e.target.name]: e.target.value,
        });
    };

    const handleDeleteResponsibility = (index) => {
        setJob({
            ...job,
            responsibilities: job.responsibilities.filter((_, i) => i !== index),
        });
    };

    const handleDeleteSkill = (index) => {
        setJob({
            ...job,
            skills: job.skills.filter((_, i) => i !== index),
        });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            const file = files[0];
            setJob({
                ...job,
                [name]: file, // Update the state with the file
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            // // Append form fields to formData
            // for (let key in job) {
            //     if (Array.isArray(job[key])) {
            //         formData.append(key, JSON.stringify(job[key]));
            //     } else {
            //         formData.append(key, job[key]);
            //     }
            // }

            for (let key in job) {
                if (key === 'responsibilities' || key === 'skills') {
                    if (Array.isArray(job[key])) {
                        job[key].forEach(item => {
                            formData.append(`${key}[]`, item);
                        });
                    } else {
                        formData.append(key, JSON.stringify(job[key]));
                    }
                } else {
                    formData.append(key, job[key]);
                }
            }
    
            // formData.append('image', imageFile);
            // formData.append('logo', logoFile);

            const response = await fetch(`${BASE_API_URL}/api/jobs/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                setSuccess(true);
                alert('Job updated successfully!');
                navigate('/list-jobs'); // Redirect to job listing after update
            } else {
                throw new Error('Failed to update job.');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="formContainer">
            <h1 className="title">Update Job Details</h1>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">Job updated successfully!</p>}
            <form onSubmit={handleSubmit} className="form">

            <label className="label">
                    Position Name:
                    <input type="text" name="positionName" value={job.positionName} onChange={handleChange} className="input" />
                </label>

                <label className="label">
                    Company Name:
                    <input type="text" name="company" value={job.company} onChange={handleChange} className="input" />
                </label>

                <label className="label">
                    Salary:
                    <input type="text" name="salary" value={job.salary} onChange={handleChange} className="input" />
                </label>

                <label className="label">
                    Location:
                    <input type="text" name="location" value={job.location} onChange={handleChange} className="input" />
                </label>

                <label className="label">
                    Qualification:
                    <input type="text" name="qualification" value={job.qualification} onChange={handleChange} className="input" />
                </label>

                <div className="fieldGroup">
                    <label className="label">Responsibilities:</label>
                    <div className="dynamicInput">
                        <input
                            type="text"
                            value={responsibility}
                            onChange={(e) => setResponsibility(e.target.value)}
                            className="input"
                        />
                        <button
                            type="button"
                            onClick={handleAddResponsibility}
                            className="addButton"
                            disabled={!responsibility.trim()}
                        >
                            Add Responsibility
                        </button>
                    </div>
                    <ul className="list">
                        {job.responsibilities.map((item, index) => (
                            <li key={index} className="listItem">
                                {item}
                                <button
                                    type="button"
                                    className="deleteButton"
                                    onClick={() => handleDeleteResponsibility(index)}
                                >
                                    &#10006; {/* Unicode for cross symbol */}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <label className="label">
                    Company Overview:
                    <textarea
                        name="companyOverview"
                        value={job.companyOverview}
                        onChange={handleChange}
                        className="textarea"
                    ></textarea>
                </label>

                <label className="label">
                    Apply Link:
                    <input
                        type="text"
                        name="applylink"
                        value={job.applylink}
                        onChange={handleChange}
                        className="input"
                    />
                </label>

                <label className="label">
                    Email:
                    <input type="text" name="email" value={job.email} onChange={handleChange} className="input" />
                </label>

               

                <label className="label">
                    Experience:
                    <input type="text" name="experience" value={job.experience} onChange={handleChange} className="input" />
                </label>

               

                <label className="label">
                   HashTags:
                    <input type="text" name="tags" value={job.tags} onChange={handleChange} className="input" />
                </label>

                

                

                <div className="fieldGroup">
                    <label className="label">Skills:</label>
                    <div className="dynamicInput">
                        <input
                            type="text"
                            value={skill}
                            onChange={(e) => setSkill(e.target.value)}
                            className="input"
                        />
                        <button
                            type="button"
                            onClick={handleAddSkill}
                            className="addButton"
                            disabled={!skill.trim()}
                        >
                            Add Skill
                        </button>
                    </div>
                    <ul className="list">
                        {job.skills.map((item, index) => (
                            <li key={index} className="listItem">
                                {item}
                                <button
                                    type="button"
                                    className="deleteButton"
                                    onClick={() => handleDeleteSkill(index)}
                                >
                                    &#10006; {/* Unicode for cross symbol */}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                

                <label className="label">
                    Department:
                    <select
                        name="department"
                        value={job.department}
                        onChange={handleChange}
                        className="input"
                    >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                </label>

                

                <label className="label">
                    Image URL:
                    <input
                        type="file"
                        name="image"
                        onChange={handleFileChange}
                        className="fileInput"
                    />
                </label>

                <label className="label">
                    Logo:
                    <input
                        type="file"
                        name="logo"
                        onChange={handleFileChange}
                        className="fileInput"
                    />
                </label>

                <button type="submit" className="submitButton">Update Job</button>
            </form>
        </div>
    );
};

export default UpdateJob;
