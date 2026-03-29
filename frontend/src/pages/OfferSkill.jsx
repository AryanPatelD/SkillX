import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, ChevronDown, ArrowLeft, Sparkles,
    Star, Zap, Trophy, Search, Plus, Check
} from 'lucide-react';

const CATEGORIES = ['Programming', 'Design', 'Mathematics', 'Science', 'Language', 'Other'];

const PROFICIENCY_LEVELS = [
    {
        value: 'Beginner',
        icon: Star,
        label: 'Beginner',
        desc: 'Just getting started',
        color: '#10b981',
        bg: 'rgba(16,185,129,0.08)',
        border: 'rgba(16,185,129,0.25)',
    },
    {
        value: 'Intermediate',
        icon: Zap,
        label: 'Intermediate',
        desc: 'Solid understanding',
        color: '#6366f1',
        bg: 'rgba(99,102,241,0.08)',
        border: 'rgba(99,102,241,0.25)',
    },
    {
        value: 'Expert',
        icon: Trophy,
        label: 'Expert',
        desc: 'Deep expertise',
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.08)',
        border: 'rgba(245,158,11,0.25)',
    },
];

const OfferSkill = () => {
    const [skills, setSkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState('');
    const [proficiency, setProficiency] = useState('Intermediate');
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillCategory, setNewSkillCategory] = useState('Programming');
    const [isNewSkill, setIsNewSkill] = useState(false);
    const [skillSearch, setSkillSearch] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => { fetchSkills(); }, []);

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
        setSubmitting(true);
        try {
            let skillId = selectedSkill;
            if (isNewSkill) {
                const skillResponse = await api.post('/skills', {
                    name: newSkillName,
                    category: newSkillCategory,
                });
                skillId = skillResponse.data.id;
            }
            await api.post('/skills/offer', { skillId, proficiency });
            setSuccess(true);
            setTimeout(() => navigate('/profile'), 1200);
        } catch (error) {
            console.error('Error offering skill:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredSkills = skills.filter(s =>
        s.name.toLowerCase().includes(skillSearch.toLowerCase())
    );

    const selectedSkillName = skills.find(s => String(s.id) === String(selectedSkill))?.name;

    return (
        <div style={{ padding: '2rem', maxWidth: '640px', margin: '0 auto' }}>
            <style>{`
                .offer-select-dropdown {
                    position: absolute;
                    top: calc(100% + 6px);
                    left: 0; right: 0;
                    background: white;
                    border: 1.5px solid rgba(99,102,241,0.2);
                    border-radius: 12px;
                    box-shadow: 0 12px 32px rgba(0,0,0,0.12);
                    z-index: 50;
                    overflow: hidden;
                    animation: dropIn 0.15s ease;
                }
                @keyframes dropIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .skill-option {
                    padding: 0.65rem 1rem;
                    cursor: pointer;
                    font-size: 0.9rem;
                    color: var(--text);
                    transition: background 0.15s;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .skill-option:hover { background: rgba(99,102,241,0.06); color: var(--primary); }
                .skill-option.selected { background: rgba(99,102,241,0.08); color: var(--primary); font-weight: 600; }
                .prof-card {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 1rem 0.5rem;
                    border-radius: 12px;
                    border: 2px solid var(--border);
                    background: transparent;
                    cursor: pointer;
                    transition: all 0.18s ease;
                    font-family: inherit;
                }
                .prof-card:hover { transform: translateY(-2px); }
                .category-pill {
                    padding: 0.45rem 1rem;
                    border-radius: 999px;
                    border: 1.5px solid var(--border);
                    background: transparent;
                    font-size: 0.82rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s;
                    font-family: inherit;
                    color: var(--text-muted);
                }
                .category-pill.active {
                    background: linear-gradient(135deg, var(--primary), var(--secondary));
                    border-color: transparent;
                    color: white;
                    font-weight: 600;
                }
                .category-pill:not(.active):hover {
                    border-color: var(--primary);
                    color: var(--primary);
                }
            `}</style>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                        borderRadius: '10px', padding: '0.5rem', cursor: 'pointer',
                        color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800' }}>Offer a Skill</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Share your expertise with the community
                    </p>
                </div>
            </div>

            <div className="card" style={{ padding: '2rem', borderRadius: '1.25rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

                    {/* Skill selector / new skill */}
                    {!isNewSkill ? (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.6rem', display: 'block' }}>
                                Skill
                            </label>

                            {/* Custom dropdown trigger */}
                            <div style={{ position: 'relative' }}>
                                <button
                                    type="button"
                                    onClick={() => setDropdownOpen(o => !o)}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '10px',
                                        border: dropdownOpen
                                            ? '2px solid var(--primary)'
                                            : '2px solid var(--border)',
                                        background: 'white',
                                        color: selectedSkillName ? 'var(--text)' : 'var(--text-muted)',
                                        fontFamily: 'inherit', fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        transition: 'border-color 0.2s',
                                        boxShadow: dropdownOpen ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
                                    }}
                                >
                                    <span style={{ fontWeight: selectedSkillName ? '500' : '400' }}>
                                        {selectedSkillName || 'Choose a skill…'}
                                    </span>
                                    <ChevronDown
                                        size={18}
                                        style={{
                                            color: 'var(--text-muted)',
                                            transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                                            transition: 'transform 0.2s',
                                            flexShrink: 0,
                                        }}
                                    />
                                </button>

                                {dropdownOpen && (
                                    <div className="offer-select-dropdown">
                                        {/* Search */}
                                        <div style={{
                                            padding: '0.6rem 0.75rem',
                                            borderBottom: '1px solid var(--border)',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        }}>
                                            <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="Search skills…"
                                                value={skillSearch}
                                                onChange={e => setSkillSearch(e.target.value)}
                                                style={{
                                                    border: 'none', outline: 'none', width: '100%',
                                                    fontSize: '0.875rem', fontFamily: 'inherit',
                                                    background: 'transparent', color: 'var(--text)',
                                                }}
                                            />
                                        </div>
                                        {/* Options */}
                                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            {filteredSkills.length === 0 && (
                                                <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                    No skills found
                                                </div>
                                            )}
                                            {filteredSkills.map(skill => (
                                                <div
                                                    key={skill.id}
                                                    className={`skill-option ${String(selectedSkill) === String(skill.id) ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setSelectedSkill(skill.id);
                                                        setDropdownOpen(false);
                                                        setSkillSearch('');
                                                    }}
                                                >
                                                    {String(selectedSkill) === String(skill.id) && <Check size={14} />}
                                                    {skill.name}
                                                    {skill.category && (
                                                        <span style={{
                                                            marginLeft: 'auto', fontSize: '0.72rem',
                                                            background: 'rgba(99,102,241,0.1)',
                                                            color: 'var(--primary)', borderRadius: '999px',
                                                            padding: '0.15rem 0.5rem', fontWeight: '600',
                                                        }}>{skill.category}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {/* Add new */}
                                        <div
                                            className="skill-option"
                                            style={{ borderTop: '1px solid var(--border)', color: 'var(--primary)', fontWeight: '600' }}
                                            onClick={() => { setIsNewSkill(true); setDropdownOpen(false); }}
                                        >
                                            <Plus size={15} /> Add a new skill
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Back link */}
                            <button
                                type="button"
                                onClick={() => setIsNewSkill(false)}
                                style={{
                                    background: 'none', border: 'none', padding: 0,
                                    color: 'var(--primary)', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                                    fontWeight: '600', fontSize: '0.875rem', fontFamily: 'inherit',
                                    alignSelf: 'flex-start',
                                }}
                            >
                                <ArrowLeft size={14} /> Back to skill list
                            </button>

                            {/* Skill name */}
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.6rem', display: 'block' }}>
                                    Skill Name
                                </label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={newSkillName}
                                    onChange={e => setNewSkillName(e.target.value)}
                                    placeholder="e.g. Machine Learning, Figma, Calculus…"
                                    required
                                />
                            </div>

                            {/* Category pills */}
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.6rem', display: 'block' }}>
                                    Category
                                </label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            className={`category-pill ${newSkillCategory === cat ? 'active' : ''}`}
                                            onClick={() => setNewSkillCategory(cat)}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Proficiency cards */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.75rem', display: 'block' }}>
                            Proficiency Level
                        </label>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {PROFICIENCY_LEVELS.map(({ value, icon: Icon, label, desc, color, bg, border }) => {
                                const active = proficiency === value;
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        className="prof-card"
                                        onClick={() => setProficiency(value)}
                                        style={{
                                            background: active ? bg : 'var(--background)',
                                            borderColor: active ? border : 'var(--border)',
                                            boxShadow: active ? `0 4px 14px ${bg}` : 'none',
                                            transform: active ? 'translateY(-3px)' : 'none',
                                        }}
                                    >
                                        <div style={{
                                            width: '40px', height: '40px',
                                            background: active ? bg : 'rgba(0,0,0,0.04)',
                                            borderRadius: '10px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.18s',
                                        }}>
                                            <Icon size={20} style={{ color: active ? color : 'var(--text-muted)' }} />
                                        </div>
                                        <span style={{
                                            fontWeight: '700', fontSize: '0.8rem',
                                            color: active ? color : 'var(--text)',
                                            fontFamily: 'inherit',
                                        }}>{label}</span>
                                        <span style={{
                                            fontSize: '0.7rem', color: 'var(--text-muted)',
                                            fontFamily: 'inherit', textAlign: 'center',
                                        }}>{desc}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting || success || (!isNewSkill && !selectedSkill)}
                        className="btn btn-primary"
                        style={{
                            width: '100%', justifyContent: 'center',
                            padding: '0.875rem',
                            fontSize: '1rem',
                            opacity: (!isNewSkill && !selectedSkill) ? 0.5 : 1,
                            gap: '0.5rem',
                        }}
                    >
                        {success ? (
                            <><Check size={18} /> Skill Added!</>
                        ) : submitting ? (
                            'Adding…'
                        ) : (
                            <><Sparkles size={18} /> Offer This Skill</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OfferSkill;
