import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HelpCircle, ArrowLeft, ChevronDown, Search,
    Check, Lightbulb, Zap, Send, Clock, Flame, CalendarClock, AlertCircle
} from 'lucide-react';

const URGENCY_LEVELS = [
    {
        value: 'low',
        icon: CalendarClock,
        label: 'Low',
        desc: 'I can wait',
        color: '#10b981',
        bg: 'rgba(16,185,129,0.08)',
        border: 'rgba(16,185,129,0.25)',
    },
    {
        value: 'normal',
        icon: Clock,
        label: 'Normal',
        desc: 'Soon would be nice',
        color: '#6366f1',
        bg: 'rgba(99,102,241,0.08)',
        border: 'rgba(99,102,241,0.25)',
    },
    {
        value: 'high',
        icon: Flame,
        label: 'High',
        desc: 'Need it ASAP',
        color: '#ef4444',
        bg: 'rgba(239,68,68,0.08)',
        border: 'rgba(239,68,68,0.25)',
    },
];

const RequestHelp = () => {
    const { user } = useAuth();
    const [skills, setSkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [urgency, setUrgency] = useState('normal');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [skillSearch, setSkillSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => { fetchSkills(); }, []);

    const fetchSkills = async () => {
        try {
            const response = await api.get('/skills');
            setSkills(response.data);
        } catch (err) {
            console.error('Error fetching skills:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/skills/request', {
                skillId: selectedSkill || null,
                description: `${title ? `Title: ${title}\n\n` : ''}${description}`,
            });
            setSuccess(true);
            setTimeout(() => navigate('/skills-hub'), 1400);
        } catch (err) {
            console.error('Error requesting help:', err);
            setError(err.response?.data?.message || 'Failed to post request. Please try again.');
            setLoading(false);
        }
    };

    const filteredSkills = skills.filter(s =>
        s.name.toLowerCase().includes(skillSearch.toLowerCase())
    );
    const selectedSkillObj = skills.find(s => String(s.id) === String(selectedSkill));
    const charCount = description.length;
    const formReady = selectedSkill && title.trim() && description.trim();

    return (
        <div style={{ padding: '2rem', maxWidth: '680px', margin: '0 auto' }}>
            <style>{`
                .rh-dropdown {
                    position: absolute;
                    top: calc(100% + 6px);
                    left: 0; right: 0;
                    background: white;
                    border: 1.5px solid rgba(99,102,241,0.2);
                    border-radius: 12px;
                    box-shadow: 0 12px 32px rgba(0,0,0,0.12);
                    z-index: 50;
                    overflow: hidden;
                    animation: rhDropIn 0.15s ease;
                }
                @keyframes rhDropIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .rh-skill-opt {
                    padding: 0.65rem 1rem;
                    cursor: pointer;
                    font-size: 0.9rem;
                    color: var(--text);
                    transition: background 0.15s;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .rh-skill-opt:hover { background: rgba(99,102,241,0.06); color: var(--primary); }
                .rh-skill-opt.selected { background: rgba(99,102,241,0.08); color: var(--primary); font-weight: 600; }
                .urgency-card {
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
                .urgency-card:hover { transform: translateY(-2px); }
                .tip-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    color: #0c4a6e;
                    line-height: 1.5;
                }
            `}</style>

            {/* Page header */}
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
                    <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800' }}>Request Help</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Post a skill you want to learn — tutors will reach out
                    </p>
                </div>
            </div>

            {/* Tips card */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(2,132,199,0.06), rgba(14,165,233,0.04))',
                border: '1.5px solid rgba(2,132,199,0.2)',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
                display: 'flex', gap: '1rem', alignItems: 'flex-start',
            }}>
                <div style={{
                    width: '36px', height: '36px', flexShrink: 0,
                    background: 'rgba(2,132,199,0.12)', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Lightbulb size={18} style={{ color: '#0284c7' }} />
                </div>
                <div>
                    <p style={{ margin: '0 0 0.6rem', fontWeight: '700', color: '#0284c7', fontSize: '0.9rem' }}>
                        Tips for getting responses
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {[
                            'Be specific about what you want to learn',
                            'Mention your current level if possible',
                            'Add context about why you want to learn this',
                            'Tutors will reach out with session recommendations',
                        ].map((tip, i) => (
                            <div key={i} className="tip-item">
                                <div style={{
                                    width: '16px', height: '16px', flexShrink: 0,
                                    background: 'rgba(2,132,199,0.15)', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginTop: '2px',
                                }}>
                                    <Check size={10} style={{ color: '#0284c7' }} />
                                </div>
                                {tip}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="error-message" style={{ marginBottom: '1.25rem' }}>
                    <AlertCircle size={17} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                </div>
            )}

            <div className="card" style={{ padding: '2rem', borderRadius: '1.25rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

                    {/* Skill selector */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.6rem', display: 'block' }}>
                            Related Skill <span style={{ color: 'var(--error)' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <button
                                type="button"
                                onClick={() => setDropdownOpen(o => !o)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '10px',
                                    border: dropdownOpen ? '2px solid var(--primary)' : '2px solid var(--border)',
                                    background: 'white',
                                    color: selectedSkillObj ? 'var(--text)' : 'var(--text-muted)',
                                    fontFamily: 'inherit', fontSize: '0.95rem',
                                    cursor: 'pointer', transition: 'border-color 0.2s',
                                    boxShadow: dropdownOpen ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
                                }}
                            >
                                <span style={{ fontWeight: selectedSkillObj ? '500' : '400', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {selectedSkillObj ? (
                                        <>
                                            {selectedSkillObj.name}
                                            <span style={{
                                                fontSize: '0.72rem', background: 'rgba(99,102,241,0.1)',
                                                color: 'var(--primary)', borderRadius: '999px',
                                                padding: '0.15rem 0.5rem', fontWeight: '600',
                                            }}>{selectedSkillObj.category}</span>
                                        </>
                                    ) : 'Choose a skill…'}
                                </span>
                                <ChevronDown size={18} style={{
                                    color: 'var(--text-muted)',
                                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                                    transition: 'transform 0.2s', flexShrink: 0,
                                }} />
                            </button>

                            {dropdownOpen && (
                                <div className="rh-dropdown">
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
                                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {filteredSkills.length === 0 && (
                                            <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                No skills found
                                            </div>
                                        )}
                                        {filteredSkills.map(skill => (
                                            <div
                                                key={skill.id}
                                                className={`rh-skill-opt ${String(selectedSkill) === String(skill.id) ? 'selected' : ''}`}
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
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.6rem', display: 'block' }}>
                            Title <span style={{ color: 'var(--error)' }}>*</span>
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Help me understand React Hooks"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Description <span style={{ color: 'var(--error)' }}>*</span></span>
                            <span style={{ fontWeight: '400', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                {charCount} chars
                            </span>
                        </label>
                        <textarea
                            className="input-field"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe what you want to learn, your current level, what you've already tried, and any specific goals…"
                            rows={5}
                            required
                            style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }}
                        />
                        <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            More detail = faster tutor responses
                        </p>
                    </div>

                    {/* Urgency cards */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.75rem', display: 'block' }}>
                            Urgency Level
                        </label>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {URGENCY_LEVELS.map(({ value, icon: Icon, label, desc, color, bg, border }) => {
                                const active = urgency === value;
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        className="urgency-card"
                                        onClick={() => setUrgency(value)}
                                        style={{
                                            background: active ? bg : 'var(--background)',
                                            borderColor: active ? border : 'var(--border)',
                                            boxShadow: active ? `0 4px 14px ${bg}` : 'none',
                                            transform: active ? 'translateY(-3px)' : 'none',
                                        }}
                                    >
                                        <div style={{
                                            width: '38px', height: '38px',
                                            background: active ? bg : 'rgba(0,0,0,0.04)',
                                            borderRadius: '10px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.18s',
                                        }}>
                                            <Icon size={19} style={{ color: active ? color : 'var(--text-muted)' }} />
                                        </div>
                                        <span style={{
                                            fontWeight: '700', fontSize: '0.8rem',
                                            color: active ? color : 'var(--text)', fontFamily: 'inherit',
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
                        disabled={loading || success || !formReady}
                        className="btn btn-primary"
                        style={{
                            width: '100%', justifyContent: 'center',
                            padding: '0.875rem', fontSize: '1rem',
                            opacity: !formReady ? 0.5 : 1, gap: '0.5rem',
                        }}
                    >
                        {success ? (
                            <><Check size={18} /> Posted!</>
                        ) : loading ? (
                            'Posting…'
                        ) : (
                            <><Send size={17} /> Post Request</>
                        )}
                    </button>
                </form>
            </div>

            {/* How it works */}
            <div style={{
                marginTop: '1.25rem',
                padding: '1rem 1.25rem',
                background: 'rgba(245,158,11,0.06)',
                border: '1.5px solid rgba(245,158,11,0.2)',
                borderRadius: '12px',
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
            }}>
                <Zap size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    <strong style={{ color: 'var(--text)' }}>How it works: </strong>
                    Once posted, tutors offering that skill will see your request.
                    When a tutor books a session with you, <strong style={{ color: 'var(--text)' }}>5 credits</strong> transfer from your account to theirs.
                </p>
            </div>
        </div>
    );
};

export default RequestHelp;
