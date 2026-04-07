import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [offeredSkills, setOfferedSkills] = useState([]);
    const [stats, setStats] = useState({ totalRequests: 0, activeSessions: 0 });
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
    const [editingRequest, setEditingRequest] = useState(null);
    const [editingSkill, setEditingSkill] = useState(null);
    const [showEditRequestModal, setShowEditRequestModal] = useState(false);
    const [showEditSkillModal, setShowEditSkillModal] = useState(false);
    const [editFormData, setEditFormData] = useState({ title: '', description: '', deadline: '' });
    const [editSkillData, setEditSkillData] = useState({ proficiency: 'Intermediate' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [requestsRes, skillsRes] = await Promise.all([
                api.get('/skills/my-requests'),
                api.get('/skills/my-skills')
            ]);
            const openRequests = requestsRes.data.filter(r => r.status === 'Open');
            setRequests(openRequests);
            setOfferedSkills(skillsRes.data);
            setStats({
                totalRequests: requestsRes.data.length,
                activeSessions: requestsRes.data.filter(r => r.status === 'In_Progress').length
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            showAlert('Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (message, type = 'success') => {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleEdit = (request) => {
        const [title, ...descParts] = request.description.split('\n\n');
        setEditingRequest(request);
        setEditFormData({
            title: title.replace('Title: ', ''),
            description: descParts.join('\n\n'),
            deadline: request.deadline ? request.deadline.split('T')[0] : ''
        });
        setShowEditRequestModal(true);
    };

    const handleUpdate = async () => {
        try {
            const description = editFormData.title 
                ? `Title: ${editFormData.title}\n\n${editFormData.description}`
                : editFormData.description;
            
            await api.put(`/skills/requests/${editingRequest.id}`, {
                description,
                deadline: editFormData.deadline || null
            });
            showAlert('Request updated successfully', 'success');
            setShowEditRequestModal(false);
            fetchData();
        } catch (error) {
            console.error('Error updating request:', error);
            showAlert('Failed to update request', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this request?')) {
            try {
                await api.delete(`/skills/requests/${id}`);
                showAlert('Request deleted successfully', 'success');
                fetchData();
            } catch (error) {
                console.error('Error deleting request:', error);
                showAlert('Failed to delete request', 'error');
            }
        }
    };

    const handleEditSkill = (skill) => {
        setEditingSkill(skill);
        setEditSkillData({ proficiency: skill.proficiency });
        setShowEditSkillModal(true);
    };

    const handleUpdateSkill = async () => {
        try {
            await api.put(`/skills/offered/${editingSkill.id}`, {
                proficiency: editSkillData.proficiency
            });
            showAlert('Skill updated successfully', 'success');
            setShowEditSkillModal(false);
            fetchData();
        } catch (error) {
            console.error('Error updating skill:', error);
            showAlert('Failed to update skill', 'error');
        }
    };

    const handleDeleteSkill = async (id) => {
        if (window.confirm('Are you sure you want to delete this skill?')) {
            try {
                await api.delete(`/skills/offered/${id}`);
                showAlert('Skill deleted successfully', 'success');
                fetchData();
            } catch (error) {
                console.error('Error deleting skill:', error);
                showAlert('Failed to delete skill', 'error');
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No deadline';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Alert */}
            {alert.show && (
                <div className="alert-notification" style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    padding: '1rem 1.5rem',
                    borderRadius: 'var(--radius)',
                    background: alert.type === 'success' ? '#d1fae5' : '#fee2e2',
                    color: alert.type === 'success' ? '#047857' : '#dc2626',
                    border: `1px solid ${alert.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    animation: 'slideInUp 0.3s ease-out'
                }}>
                    {alert.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {alert.message}
                </div>
            )}

            <style>{`
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                    Welcome back, <span className="text-gradient">{user?.full_name?.split(' ')[0]}</span>!
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Here's what's happening with your skill exchange.</p>
            </div>

            {/* Action Cards - Side by Side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'white' }}>Ready to learn?</h3>
                    <p style={{ marginBottom: '1.5rem', opacity: '0.9' }}>Find a tutor or request help for a specific skill.</p>
                    <a href="/skills-hub" className="btn" style={{ background: 'white', color: 'var(--primary)', border: 'none', width: '100%', justifyContent: 'center' }}>
                        Explore Skills Hub
                    </a>
                </div>

                <div className="card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'white' }}>Share your knowledge</h3>
                    <p style={{ marginBottom: '1.5rem', opacity: '0.9' }}>Offer your skills to help others and earn teaching experience.</p>
                    <a href="/offer-skill" className="btn" style={{ background: 'white', color: '#059669', border: 'none', width: '100%', justifyContent: 'center' }}>
                        Offer a Skill
                    </a>
                </div>
            </div>

            {/* Bottom Section - Requests and Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem', marginBottom: '2rem', alignItems: 'start' }}>
                {/* Main Content */}
                <div>
                    {/* My Learning Requests */}
                    <div className="card">
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>My Learning Requests</h3>
                        {loading ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading requests...</p>
                        ) : requests.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: 'var(--radius)', border: '2px dashed var(--border)' }}>
                                <p>No open learning requests yet.</p>
                                <a href="/request-help" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                                    Create Request
                                </a>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {requests.map(request => (
                                    <div key={request.id} style={{
                                        padding: '1.5rem',
                                        border: `1px solid var(--border)`,
                                        borderRadius: 'var(--radius)',
                                        background: '#f8fafc'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                                    Open · Due {formatDate(request.deadline)}
                                                </p>
                                                <h4 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                                                    {request.skill?.name || 'Custom Request'}
                                                </h4>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                    {request.description.split('\n\n')[0]}
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleEdit(request)}
                                                    className="btn btn-secondary"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                                >
                                                    <Edit2 size={16} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(request.id)}
                                                    className="btn"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}
                                                >
                                                    <Trash2 size={16} /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Stats Sidebar */}
                <div className="card glass-panel">
                    <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Stats</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Requests</p>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalRequests}</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Active Sessions</p>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>{stats.activeSessions}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Offered Skills Section */}
            <div className="card">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Skills I'm Offering</h3>
                {loading ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading skills...</p>
                ) : offeredSkills.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: 'var(--radius)', border: '2px dashed var(--border)' }}>
                        <p>No skills offered yet.</p>
                        <a href="/offer-skill" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                            Offer a Skill
                        </a>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {offeredSkills.map(skill => (
                            <div key={skill.id} style={{
                                padding: '1.5rem',
                                border: `1px solid var(--border)`,
                                borderRadius: 'var(--radius)',
                                background: '#f8fafc'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                            {skill.category}
                                        </p>
                                        <h4 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                                            {skill.name}
                                        </h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            Proficiency: <strong>{skill.proficiency}</strong>
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleEditSkill(skill)}
                                            className="btn btn-secondary"
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                        >
                                            <Edit2 size={16} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSkill(skill.id)}
                                            className="btn"
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}
                                        >
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Request Modal */}
            {showEditRequestModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Edit Request</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Title</label>
                                <input
                                    type="text"
                                    value={editFormData.title}
                                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontFamily: 'inherit' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Description</label>
                                <textarea
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                    rows="5"
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontFamily: 'inherit' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Deadline</label>
                                <input
                                    type="date"
                                    value={editFormData.deadline}
                                    onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontFamily: 'inherit' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setShowEditRequestModal(false)}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.75rem 1.5rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="btn"
                                    style={{ padding: '0.75rem 1.5rem' }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Skill Modal */}
            {showEditSkillModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Edit Skill</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Skill Name</label>
                                <input
                                    type="text"
                                    value={editingSkill?.name || ''}
                                    disabled
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontFamily: 'inherit', background: '#f8fafc', cursor: 'not-allowed' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Proficiency Level</label>
                                <select
                                    value={editSkillData.proficiency}
                                    onChange={(e) => setEditSkillData({ ...editSkillData, proficiency: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontFamily: 'inherit' }}
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Expert">Expert</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setShowEditSkillModal(false)}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.75rem 1.5rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateSkill}
                                    className="btn"
                                    style={{ padding: '0.75rem 1.5rem' }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
