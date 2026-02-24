import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, BookOpen, HelpCircle, Plus, User } from 'lucide-react';

const SkillsHub = () => {
    const [activeTab, setActiveTab] = useState('skills'); // 'skills' or 'requests'
    const [items, setItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchItems();
    }, [activeTab, searchQuery]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            let response;
            if (activeTab === 'skills') {
                const endpoint = searchQuery
                    ? `/search/skills?q=${searchQuery}`
                    : `/search/skills`;
                response = await api.get(endpoint);
            } else {
                // Show all open requests from other users
                const endpoint = searchQuery
                    ? `/search/requests?q=${searchQuery}`
                    : `/search/requests`;
                response = await api.get(endpoint);
            }
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>Skill Exchange Hub</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Find experts or help others with their requests.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <a href="/offer-skill" className="btn btn-primary">
                        <Plus size={18} /> Offer Skill
                    </a>
                    <a href="/request-help" className="btn btn-secondary">
                        <HelpCircle size={18} /> Request Help
                    </a>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    className={`btn ${activeTab === 'skills' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('skills')}
                >
                    Find Skills
                </button>
                <button
                    className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => {
                        setActiveTab('requests');
                        setSearchQuery(''); // Clear search when switching tabs
                    }}
                >
                    Open Requests
                </button>
            </div>

            <div style={{ position: 'relative', marginBottom: '2rem' }}>
                <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                <input
                    type="text"
                    className="input-field"
                    placeholder={activeTab === 'skills' ? "Search skills (e.g. Python)..." : "Search requests..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '3rem' }}
                />
            </div>

            {loading ? (
                <div className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading...</div>
            ) : (
                <div className="grid-layout">
                    {items.length > 0 ? (
                        items.map((item) => (
                            <div key={item.id} className="card">
                                {activeTab === 'skills' ? (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <h3 style={{ fontSize: '1.25rem' }}>{item.name}</h3>
                                            <span className="badge badge-primary">
                                                {item.category}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Available Providers:</h4>
                                            {item.providers?.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    {item.providers.map(provider => (
                                                        <div key={provider.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', padding: '0.5rem', background: '#f1f5f9', borderRadius: '0.5rem' }}>
                                                            <div style={{ width: '30px', height: '30px', background: 'var(--secondary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                                                {provider.full_name ? provider.full_name[0].toUpperCase() : '?'}
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontWeight: '600' }}>{provider.full_name || 'Anonymous'}</div>
                                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{provider.UserSkill?.proficiency || 'Beginner'}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No providers currently offering this.</p>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <span className="badge badge-accent">
                                                {item.status || 'Open'}
                                            </span>
                                            {item.requester && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    <User size={14} />
                                                    {item.requester.full_name}
                                                </div>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '1rem', lineHeight: '1.5' }}>{item.description}</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {item.skill && (
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <BookOpen size={16} />
                                                    Related Skill: {item.skill.name}
                                                </div>
                                            )}
                                            <button className="btn btn-primary btn-sm" style={{ width: 'fit-content', marginTop: '0.5rem' }}>
                                                Offer to Help
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <p>{activeTab === 'skills' ? 'No skills found matching your search.' : 'No open requests found. Check back later!'}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SkillsHub;
