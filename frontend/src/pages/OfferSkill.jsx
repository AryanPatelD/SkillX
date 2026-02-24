import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Check } from 'lucide-react';

const OfferSkill = () => {
    const [skills, setSkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState('');
    const [proficiency, setProficiency] = useState('Beginner');
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillCategory, setNewSkillCategory] = useState('Other');
    const [isNewSkill, setIsNewSkill] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const response = await api.get('/skills');
            setSkills(response.data);
        } catch (error) {
            console.error('Error fetching skills:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let skillId = selectedSkill;

            if (isNewSkill) {
                // Create new skill first
                const skillResponse = await api.post('/skills', {
                    name: newSkillName,
                    category: newSkillCategory
                });
                skillId = skillResponse.data.id;
            }

            await api.post('/skills/offer', {
                skillId,
                proficiency
            });

            navigate('/profile');
        } catch (error) {
            console.error('Error offering skill:', error);
        }
    };

    return (
        <div className="auth-container" style={{ alignItems: 'flex-start', paddingTop: '4rem' }}>
            <div className="auth-card" style={{ maxWidth: '600px' }}>
                <div className="auth-header">
                    <BookOpen className="auth-icon" size={32} />
                    <h2>Offer a Skill</h2>
                    <p>Share your expertise with the community</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isNewSkill ? (
                        <div className="form-group">
                            <label>Select Skill</label>
                            <select
                                value={selectedSkill}
                                onChange={(e) => {
                                    if (e.target.value === 'new') {
                                        setIsNewSkill(true);
                                    } else {
                                        setSelectedSkill(e.target.value);
                                    }
                                }}
                                style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                                required
                            >
                                <option value="">-- Select a skill --</option>
                                {skills.map(skill => (
                                    <option key={skill.id} value={skill.id}>{skill.name}</option>
                                ))}
                                <option value="new">+ Add new skill</option>
                            </select>
                        </div>
                    ) : (
                        <>
                            <div className="form-group">
                                <label>Skill Name</label>
                                <input
                                    type="text"
                                    value={newSkillName}
                                    onChange={(e) => setNewSkillName(e.target.value)}
                                    placeholder="e.g. Machine Learning"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={newSkillCategory}
                                    onChange={(e) => setNewSkillCategory(e.target.value)}
                                    style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                                >
                                    <option value="Programming">Programming</option>
                                    <option value="Design">Design</option>
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="Science">Science</option>
                                    <option value="Language">Language</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsNewSkill(false)}
                                style={{ background: 'transparent', border: 'none', color: '#4f46e5', cursor: 'pointer', textAlign: 'left' }}
                            >
                                Back to select list
                            </button>
                        </>
                    )}

                    <div className="form-group">
                        <label>Proficiency Level</label>
                        <select
                            value={proficiency}
                            onChange={(e) => setProficiency(e.target.value)}
                            style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Expert">Expert</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-primary">Offer Skill</button>
                </form>
            </div>
        </div>
    );
};

export default OfferSkill;
