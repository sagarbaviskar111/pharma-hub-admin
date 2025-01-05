import { useEffect, useState } from 'react';
import './AddJob.css'; // Import the CSS file
import BASE_API_URL from '../utils/apiConfig';

const AddJob = () => {
    const [departments, setDepartments] = useState([]);
    const [job, setJob] = useState({
        company: '',
        positionName: '',
        qualification: '',
        experience: '',
        salary: '',
        location: '',
        responsibilities: [],
        applylink: '',
        tags: '',
        skills: [],
        companyOverview: '',
        department: '',
        email: '' // New email field
    });
    const [responsibility, setResponsibility] = useState('');

    const [skill, setSkill] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [logoFile, setLogoFile] = useState(null);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch(`${BASE_API_URL}/api/departments`);
                const data = await response.json();
                setDepartments(data);
            } catch (error) {
                console.error('Error fetching departments:', error);
            }
        };

        fetchDepartments();
    }, []);

    const handleAddResponsibility = () => {
        if (responsibility.trim()) {
            setJob((prevState) => ({
                ...prevState,
                responsibilities: [...prevState.responsibilities, responsibility]
            }));
            setResponsibility('');
        }
    };


    const handleAddSkill = () => {
        if (skill.trim()) {
            setJob((prevState) => ({
                ...prevState,
                skills: [...prevState.skills, skill]
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

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleFileChange2 = (e) => {
        setLogoFile(e.target.files[0]);
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const requiredFields = [
            'company',
            'positionName',
            'qualification',
            'experience',
            'salary',
            'location',
            'companyOverview',
            'department',
            'applylink'
        ];
        const allFieldsFilled = requiredFields.every(field => job[field] !== '' && job[field] !== undefined);

        if (!imageFile) {
            alert('Please upload an image (PNG format).');
            return;
        }

        if (!allFieldsFilled) {
            alert('Please fill in all required fields before submitting.');
            return;
        }

        const formData = new FormData();

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

        formData.append('image', imageFile);
        formData.append('logo', logoFile);

        try {
            const token = localStorage.getItem('token'); // Adjust according to your token storage
            const response = await fetch(`${BASE_API_URL}/api/jobs`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                alert('Job details submitted successfully!');
                setJob({
                    company: '',
                    positionName: '',
                    qualification: '',
                    experience: '',
                    salary: '',
                    location: '',
                    responsibilities: [],
                    tags: '',
                    applylink: '',
                    skills: [],
                    companyOverview: '',
                    department: '',
                    email: '' // Reset email field
                });
                setImageFile(null);
            } else {
                alert('Failed to submit job details.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while submitting job details.');
        }
    };

    return (
        <div className="formContainer">
            <h1 className="title">Job Posting Form</h1>
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
                    Application Links:
                    <input
                        type="text"
                        name="applylink"
                        value={job.applylink}
                        onChange={handleChange}
                        className="input"
                    />
                </label>

                <label className="label">
                    Email (Optional):
                    <input
                        type="text"
                        name="email"
                        value={job.email}
                        onChange={handleChange}
                        className="input"
                    />
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
                    Image Upload:
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="input"
                    />
                </label>

                <label className="label">
                    Logo Upload:
                    <input
                        type="file"
                        name="logo"
                        accept="image/*"
                        onChange={handleFileChange2}
                        className="input"
                    />
                </label>

               

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

                <button type="submit" className="submitButton">
                    Submit
                </button>
            </form>
        </div>
    );
};

export default AddJob;
