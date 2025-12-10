import { useEffect, useState } from 'react';
import './AddJob.css';
import BASE_API_URL from '../utils/apiConfig';
import validators from '../utils/validators';

// File validation helper
function validateFiles(imageFile, logoFile, maxSizeBytes = 10 * 1024 * 1024) {
    if (!imageFile) throw new Error('Image file is required.');
    if (!imageFile.type.startsWith('image/')) throw new Error('Image must be an image file.');
    if (imageFile.size > maxSizeBytes) {
        const maxMB = Math.round(maxSizeBytes / (1024 * 1024));
        throw new Error(`Image exceeds max size of ${maxMB}MB. Current size: ${Math.round(imageFile.size / (1024 * 1024))}MB.`);
    }
    if (logoFile) {
        if (!logoFile.type.startsWith('image/')) throw new Error('Logo must be an image file.');
        if (logoFile.size > maxSizeBytes) {
            const maxMB = Math.round(maxSizeBytes / (1024 * 1024));
            throw new Error(`Logo exceeds max size of ${maxMB}MB. Current size: ${Math.round(logoFile.size / (1024 * 1024))}MB.`);
        }
    }
    return true;
}

// Build FormData with correct field names
function buildJobFormData(values, imageFile, logoFile) {
    const form = new FormData();
    form.append('company', values.company || '');
    form.append('positionName', values.positionName || '');
    form.append('qualification', values.qualification || '');
    form.append('experience', values.experience || '');
    form.append('salary', values.salary || '');
    form.append('location', values.location || '');
    form.append('applylink', values.applylink || '');
    form.append('tags', values.tags || '');
    form.append('companyOverview', values.companyOverview || '');
    if (values.department) form.append('department', values.department);
    form.append('email', values.email || '');
    form.append('driveLocation', values.driveLocation || '');
    form.append('driveDate', values.driveDate || '');
    form.append('driveTime', values.driveTime || '');
    form.append('driveContactPerson', values.driveContactPerson || '');
    form.append('driveContactNumber', values.driveContactNumber || '');
    if (values.applicationDeadline) form.append('applicationDeadline', values.applicationDeadline);
    form.append('type', values.type || '');
    
    // Arrays: append each entry separately
    (values.responsibilities || []).forEach(r => form.append('responsibilities', r));
    (values.skills || []).forEach(s => form.append('skills', s));
    
    // Files
    form.append('image', imageFile);
    if (logoFile) form.append('logo', logoFile);
    
    return form;
}

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
        email: '',
        driveLocation: '',
        driveDate: '',
        driveTime: '',
        driveContactPerson: '',
        driveContactNumber: '',
        applicationDeadline: '',
        type: ''
    });
    const [responsibility, setResponsibility] = useState('');
    const [skill, setSkill] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    const [inputMode, setInputMode] = useState('manual'); // 'manual' or 'json'
    const [jsonInput, setJsonInput] = useState('');

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch(`${BASE_API_URL}/api/departments`);
                const data = await response.json();
                setDepartments(data);
            } catch (error) {
                console.error('Error fetching departments:', error);
                setErrors(['Failed to fetch departments']);
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
        const file = e.target.files[0];
        if (file) {
            const validation = validators.validateFile(file, 'image/*', 5 * 1024 * 1024);
            if (validation.isValid) {
                setImageFile(file);
                setErrors(errors.filter(err => !err.includes('image')));
            } else {
                setErrors([...errors.filter(err => !err.includes('image')), validation.error]);
            }
        }
    };

    const handleFileChange2 = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validation = validators.validateFile(file, 'image/*', 5 * 1024 * 1024);
            if (validation.isValid) {
                setLogoFile(file);
                setErrors(errors.filter(err => !err.includes('logo')));
            } else {
                setErrors([...errors.filter(err => !err.includes('logo')), validation.error]);
            }
        }
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

    const handleJsonApply = () => {
        try {
            const parsedData = JSON.parse(jsonInput);
            const validation = validators.validateJobCreate(parsedData);
            
            if (!validation.isValid) {
                setErrors(validation.errors);
                return;
            }

            setJob((prev) => ({
                ...prev,
                ...parsedData
            }));
            setErrors([]);
            alert('Fields populated from JSON!');
            setInputMode('manual');
        } catch (error) {
            setErrors(['Invalid JSON format. Please check your input.']);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setLoading(true);

        try {
            // Validate job data
            const validation = validators.validateJobCreate(job);
            if (!validation.isValid) {
                setErrors(validation.errors);
                setLoading(false);
                return;
            }

            // Validate files
            validateFiles(imageFile, logoFile, 10 * 1024 * 1024);

            // Get auth token
            const token = localStorage.getItem('token');
            if (!token) {
                setErrors(['Authentication token not found. Please login again.']);
                setLoading(false);
                return;
            }

            // Build FormData with correct field names
            const formData = buildJobFormData(job, imageFile, logoFile);

            // Log file sizes for debugging
            console.log('image size:', imageFile.size, 'bytes');
            if (logoFile) console.log('logo size:', logoFile.size, 'bytes');

            // Upload with proper headers (do NOT set Content-Type manually)
            const response = await fetch(`${BASE_API_URL}/api/jobs`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // DO NOT set Content-Type - browser will set it with boundary
                },
            });

            if (response.status === 413) {
                setErrors(['File too large. Server rejected payload. Try compressing images or contact admin.']);
                setLoading(false);
                return;
            }

            if (!response.ok) {
                const responseData = await response.json().catch(() => ({}));
                const errorMsg = responseData.message || responseData.error || 'Failed to submit job details';
                setErrors([errorMsg]);
                setLoading(false);
                return;
            }

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
                email: '',
                driveLocation: '',
                driveDate: '',
                driveTime: '',
                driveContactPerson: '',
                driveContactNumber: '',
                applicationDeadline: '',
                type: ''
            });
            setImageFile(null);
            setLogoFile(null);
            setErrors([]);
        } catch (error) {
            console.error('Error:', error);
            setErrors([error.message || 'An error occurred while submitting the form']);
        } finally {
            setLoading(false);
        }
    };
            setErrors(['An error occurred while submitting job details. Please try again.']);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="formContainer">
            <h1 className="title">Job Posting Form</h1>

            <div className="modeToggle">
                <label>
                    <input
                        type="radio"
                        value="manual"
                        checked={inputMode === 'manual'}
                        onChange={() => setInputMode('manual')}
                    /> Manual Entry
                </label>
                <label style={{ marginLeft: '20px' }}>
                    <input
                        type="radio"
                        value="json"
                        checked={inputMode === 'json'}
                        onChange={() => setInputMode('json')}
                    /> Paste JSON
                </label>
            </div>

            {errors.length > 0 && (
                <div style={styles.errorContainer}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#721c24' }}>Validation Errors:</h4>
                    {errors.map((error, index) => (
                        <p key={index} style={styles.error}>• {error}</p>
                    ))}
                </div>
            )}

            {inputMode === 'json' && (
                <div className="jsonInputArea">
                    <textarea
                        rows="10"
                        className="textarea"
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder='Paste your job JSON here...'
                        disabled={loading}
                    ></textarea>
                    <button type="button" className="addButton" onClick={handleJsonApply} disabled={loading}>
                        Apply JSON Data
                    </button>
                </div>
            )}

            {inputMode === 'manual' && (
                <form onSubmit={handleSubmit} className="form">
                    <label className="label">Position Name: *
                        <input type="text" name="positionName" value={job.positionName} onChange={handleChange} className="input" disabled={loading} />
                    </label>
                    <label className="label">Company Name: *
                        <input type="text" name="company" value={job.company} onChange={handleChange} className="input" disabled={loading} />
                    </label>
                    <label className="label">Salary: *
                        <input type="text" name="salary" value={job.salary} onChange={handleChange} className="input" placeholder="e.g., 5-8 LPA" disabled={loading} />
                    </label>
                    <label className="label">Location: *
                        <input type="text" name="location" value={job.location} onChange={handleChange} className="input" disabled={loading} />
                    </label>
                    <label className="label">Qualification: *
                        <input type="text" name="qualification" value={job.qualification} onChange={handleChange} className="input" disabled={loading} />
                    </label>

                    <div className="fieldGroup">
                        <label className="label">Responsibilities:</label>
                        <div className="dynamicInput">
                            <input type="text" value={responsibility} onChange={(e) => setResponsibility(e.target.value)} className="input" disabled={loading} />
                            <button type="button" onClick={handleAddResponsibility} className="addButton" disabled={!responsibility.trim() || loading}>
                                Add Responsibility
                            </button>
                        </div>
                        <ul className="list">
                            {job.responsibilities.map((item, index) => (
                                <li key={index} className="listItem">
                                    {item}
                                    <button type="button" className="deleteButton" onClick={() => handleDeleteResponsibility(index)} disabled={loading}>
                                        &#10006;
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <label className="label">Company Overview: *
                        <textarea name="companyOverview" value={job.companyOverview} onChange={handleChange} className="textarea" disabled={loading}></textarea>
                    </label>

                    <label className="label">Application Link: *
                        <input type="text" name="applylink" value={job.applylink} onChange={handleChange} className="input" placeholder="https://example.com/apply" disabled={loading} />
                    </label>

                    <label className="label">Email (Optional):
                        <input type="email" name="email" value={job.email} onChange={handleChange} className="input" disabled={loading} />
                    </label>

                    <label className="label">Experience:
                        <input type="text" name="experience" value={job.experience} onChange={handleChange} className="input" placeholder="e.g., 2-3 years" disabled={loading} />
                    </label>

                    <label className="label">Job Type:
                        <input type="text" name="type" value={job.type} onChange={handleChange} className="input" placeholder="e.g., Full-time, Part-time" disabled={loading} />
                    </label>

                    <label className="label">Application Deadline:
                        <input type="date" name="applicationDeadline" value={job.applicationDeadline} onChange={handleChange} className="input" disabled={loading} />
                    </label>

                    <label className="label">HashTags:
                        <input type="text" name="tags" value={job.tags} onChange={handleChange} className="input" placeholder="e.g., #React #NodeJS" disabled={loading} />
                    </label>

                    <label className="label">Drive Location:
                        <input type="text" name="driveLocation" value={job.driveLocation} onChange={handleChange} className="input" disabled={loading} />
                    </label>

                    <label className="label">Drive Date:
                        <input type="date" name="driveDate" value={job.driveDate} onChange={handleChange} className="input" disabled={loading} />
                    </label>

                    <label className="label">Drive Time:
                        <input type="time" name="driveTime" value={job.driveTime} onChange={handleChange} className="input" disabled={loading} />
                    </label>

                    <label className="label">Drive Contact Person:
                        <input type="text" name="driveContactPerson" value={job.driveContactPerson} onChange={handleChange} className="input" disabled={loading} />
                    </label>

                    <label className="label">Drive Contact Number:
                        <input type="tel" name="driveContactNumber" value={job.driveContactNumber} onChange={handleChange} className="input" disabled={loading} />
                    </label>

                    <div className="fieldGroup">
                        <label className="label">Skills:</label>
                        <div className="dynamicInput">
                            <input type="text" value={skill} onChange={(e) => setSkill(e.target.value)} className="input" placeholder="e.g., React" disabled={loading} />
                            <button type="button" onClick={handleAddSkill} className="addButton" disabled={!skill.trim() || loading}>
                                Add Skill
                            </button>
                        </div>
                        <ul className="list">
                            {job.skills.map((item, index) => (
                                <li key={index} className="listItem">
                                    {item}
                                    <button type="button" className="deleteButton" onClick={() => handleDeleteSkill(index)} disabled={loading}>
                                        &#10006;
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <label className="label">Image Upload: * (max 5MB)
                        <input type="file" name="image" accept="image/*" onChange={handleFileChange} className="input" disabled={loading} />
                    </label>

                    <label className="label">Logo Upload: (max 5MB)
                        <input type="file" name="logo" accept="image/*" onChange={handleFileChange2} className="input" disabled={loading} />
                    </label>

                    <label className="label">Department: *
                        <select name="department" value={job.department} onChange={handleChange} className="input" disabled={loading}>
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                                <option key={dept._id} value={dept._id}>{dept.name}</option>
                            ))}
                        </select>
                    </label>

                    <button type="submit" className="submitButton" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Job'}
                    </button>
                </form>
            )}
        </div>
    );
};

const styles = {
    errorContainer: {
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8d7da',
        borderRadius: '4px',
        border: '1px solid #f5c6cb',
    },
    error: {
        color: '#721c24',
        margin: '5px 0',
        fontSize: '14px',
    }
};

export default AddJob;
