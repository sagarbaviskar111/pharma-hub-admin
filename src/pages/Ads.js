import React, { useEffect, useState } from 'react';
import BASE_API_URL from '../utils/apiConfig';
import './AddJob.css'; // Reusing form styles
import './JobList.css'; // Reusing table styles

const emptyForm = {
    title: '',
    description: '',
    placement: 'popup',
    link: '',
    imageUrl: '',
    isActive: true,
};

const Ads = () => {
    const [ads, setAds] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const authHeaders = () => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
    });

    const fetchAds = async () => {
        try {
            const response = await fetch(`${BASE_API_URL}/api/ads`, {
                headers: authHeaders(),
            });
            if (!response.ok) throw new Error('Error fetching ads');
            const data = await response.json();
            setAds(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchAds();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (form.placement !== 'popup' && form.placement !== 'inline') {
            setError('Placement must be either "popup" or "inline".');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${BASE_API_URL}/api/ads`, {
                method: editingId ? 'PUT' : 'POST',
                headers: authHeaders(),
                body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
            });

            if (!response.ok) {
                const responseData = await response.json().catch(() => ({}));
                throw new Error(responseData.message || responseData.error || 'Failed to save ad');
            }

            setMessage(editingId ? 'Ad updated successfully!' : 'Ad created successfully!');
            resetForm();
            fetchAds();
        } catch (err) {
            setError(err.message || 'An error occurred while saving the ad');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (ad) => {
        setEditingId(ad.id);
        setForm({
            title: ad.title || '',
            description: ad.description || '',
            placement: ad.placement || 'popup',
            link: ad.link || '',
            imageUrl: ad.imageUrl || '',
            isActive: ad.isActive !== undefined ? ad.isActive : true,
        });
        setMessage('');
        setError('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this ad?')) return;
        setError('');
        setMessage('');
        try {
            const response = await fetch(`${BASE_API_URL}/api/ads`, {
                method: 'DELETE',
                headers: authHeaders(),
                body: JSON.stringify({ id }),
            });

            if (!response.ok) throw new Error('Failed to delete ad');

            setMessage('Ad deleted successfully!');
            if (editingId === id) resetForm();
            fetchAds();
        } catch (err) {
            setError(err.message || 'Error deleting ad');
        }
    };

    return (
        <div className="job-list-container">
            <h1 className="title">Ads Management</h1>

            {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
            {error && <p className="error-message">{error}</p>}

            <div className="formContainer" style={{ maxWidth: '100%', marginBottom: '30px' }}>
                <h2 className="title">{editingId ? 'Edit Ad' : 'Add New Ad'}</h2>
                <form onSubmit={handleSubmit} className="form">
                    <label className="label">Title:
                        <input type="text" name="title" value={form.title} onChange={handleChange} className="input" disabled={loading} />
                    </label>

                    <label className="label">Description:
                        <textarea name="description" value={form.description} onChange={handleChange} className="textarea" disabled={loading}></textarea>
                    </label>

                    <label className="label">Placement: *
                        <select name="placement" value={form.placement} onChange={handleChange} className="select" disabled={loading}>
                            <option value="popup">popup</option>
                            <option value="inline">inline</option>
                        </select>
                    </label>

                    <label className="label">Link:
                        <input type="text" name="link" value={form.link} onChange={handleChange} className="input" placeholder="https://example.com/offer" disabled={loading} />
                    </label>

                    <label className="label">Image URL:
                        <input type="text" name="imageUrl" value={form.imageUrl} onChange={handleChange} className="input" placeholder="https://example.com/banner.jpg" disabled={loading} />
                    </label>

                    <label className="label" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                        <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} disabled={loading} />
                        Active
                    </label>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="submit" className="submitButton" disabled={loading} style={{ flex: 1 }}>
                            {loading ? 'Saving...' : editingId ? 'Update Ad' : 'Add Ad'}
                        </button>
                        {editingId && (
                            <button type="button" className="addButton" onClick={resetForm} disabled={loading}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <table className="job-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Placement</th>
                        <th>Link</th>
                        <th>Active</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {ads.map((ad) => (
                        <tr key={ad.id}>
                            <td>{ad.title}</td>
                            <td>{ad.placement}</td>
                            <td>{ad.link ? <a href={ad.link} target="_blank" rel="noreferrer">Link</a> : '-'}</td>
                            <td>{ad.isActive ? 'Yes' : 'No'}</td>
                            <td>
                                <button className="edit-button" onClick={() => handleEdit(ad)}>Edit</button>
                                <button className="delete-button" onClick={() => handleDelete(ad.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    {ads.length === 0 && (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center' }}>No ads found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Ads;
