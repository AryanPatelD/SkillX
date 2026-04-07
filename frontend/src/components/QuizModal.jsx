import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const QuizModal = ({ isOpen, onClose, user, onQuizComplete }) => {
    const { updateUser } = useAuth();
    const [step, setStep] = useState('eligibility'); // eligibility, categories, quiz, results
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [quizStatus, setQuizStatus] = useState(null);
    const [quizData, setQuizData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [results, setResults] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            checkQuizEligibility();
        }
    }, [isOpen]);

    const checkQuizEligibility = async () => {
        try {
            setLoading(true);
            const response = await api.get('/quiz/status');
            setQuizStatus(response.data);

            if (response.data.isEligible && !response.data.isCooldownActive) {
                setStep('categories');
                fetchCategories();
            } else {
                setStep('eligibility');
            }
        } catch (err) {
            setError('Failed to check quiz status');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/quiz/categories');
            setCategories(response.data);
        } catch (err) {
            setError('Failed to fetch quiz categories');
            console.error(err);
        }
    };

    const startQuiz = async (categoryId) => {
        try {
            setLoading(true);
            const response = await api.get(`/quiz/${categoryId}/questions`);
            setQuizData(response.data);
            setSelectedCategory(categoryId);
            setAnswers({});
            setStep('quiz');
        } catch (err) {
            if (err.response?.status === 403) {
                setError(err.response.data.message);
                setStep('eligibility');
            } else {
                setError('Failed to load quiz');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer,
        }));
    };

    const submitQuiz = async () => {
        try {
            // Check if all questions are answered
            const answeredCount = Object.keys(answers).length;
            if (answeredCount < quizData.totalQuestions) {
                setError(`Please answer all ${quizData.totalQuestions} questions`);
                return;
            }

            setSubmitting(true);
            const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
                questionId,
                answer,
            }));

            const response = await api.post('/quiz/submit', {
                categoryId: selectedCategory,
                answers: formattedAnswers,
            });

            setResults(response.data);
            setStep('results');
            
            // Update user credits in context if quiz was passed
            if (response.data.passed) {
                updateUser({
                    credits: user.credits + response.data.creditsEarned,
                });
            }
            
            onQuizComplete?.();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit quiz');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            padding: '1rem',
        }}>
            <div style={{
                background: 'white',
                borderRadius: '1.25rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                animation: 'slideUp 0.3s ease-out',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.5rem',
                    borderBottom: '1px solid #e2e8f0',
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {step === 'eligibility' && '💰 Credits Quiz'}
                        {step === 'categories' && '📚 Select a Category'}
                        {step === 'quiz' && '❓ Quiz'}
                        {step === 'results' && '📊 Results'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.5rem',
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '2rem' }}>
                    {error && (
                        <div style={{
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}>
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    {/* Eligibility Check */}
                    {step === 'eligibility' && (
                        <div>
                            {quizStatus?.isCooldownActive ? (
                                <div style={{ textAlign: 'center' }}>
                                    <Clock size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
                                    <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Cooldown Active</h3>
                                    <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                                        You can retake the quiz on:
                                    </p>
                                    <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#4f46e5' }}>
                                        {new Date(quizStatus.cooldownUntil).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                    <p style={{ color: '#64748b', marginTop: '1rem', fontSize: '0.9rem' }}>
                                        You need to score at least 60% to pass. Try again in 7 days if you failed.
                                    </p>
                                </div>
                            ) : quizStatus?.isEligible ? (
                                <div style={{ textAlign: 'center' }}>
                                    <AlertCircle size={48} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
                                    <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>
                                        You have 0 credits!
                                    </h3>
                                    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                                        Take the quiz to earn 10 credits. You need to score at least 60% to pass.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setStep('categories');
                                            fetchCategories();
                                        }}
                                        style={{
                                            background: '#4f46e5',
                                            color: 'white',
                                            padding: '0.75rem 1.5rem',
                                            border: 'none',
                                            borderRadius: '0.75rem',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontSize: '1rem',
                                        }}
                                    >
                                        Start Quiz
                                    </button>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    <CheckCircle2 size={48} style={{ color: '#10b981', marginBottom: '1rem' }} />
                                    <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>
                                        You have {quizStatus?.credits} credits
                                    </h3>
                                    <p style={{ color: '#64748b' }}>
                                        You only need to take the quiz when your credits reach 0.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Category Selection */}
                    {step === 'categories' && (
                        <div>
                            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                                Choose a category to test your knowledge across 10 MCQs (5 easy, 4 medium, 1 hard).
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {categories.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => startQuiz(category.id)}
                                        disabled={loading}
                                        style={{
                                            padding: '1rem',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '0.75rem',
                                            background: 'white',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s',
                                            textAlign: 'left',
                                        }}
                                        onMouseEnter={e => !loading && (e.target.style.borderColor = '#4f46e5')}
                                        onMouseLeave={e => (e.target.style.borderColor = '#e2e8f0')}
                                    >
                                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                                            {category.name}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                            {category.description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quiz Display */}
                    {step === 'quiz' && quizData && (
                        <div>
                            <div style={{
                                background: '#f0f9ff',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                marginBottom: '1.5rem',
                                fontSize: '0.875rem',
                                color: '#0369a1',
                            }}>
                                Question {Object.keys(answers).length} of {quizData.totalQuestions}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {quizData.questions.map((question, idx) => (
                                    <div key={question.id} style={{ paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                                        <p style={{ fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
                                            {idx + 1}. {question.question}
                                        </p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {['A', 'B', 'C', 'D'].map(option => {
                                                const optionKey = `option_${option.toLowerCase()}`;
                                                const isSelected = answers[question.id] === option;
                                                return (
                                                    <label
                                                        key={option}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.75rem',
                                                            padding: '0.75rem',
                                                            border: isSelected ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                                                            borderRadius: '0.5rem',
                                                            cursor: 'pointer',
                                                            background: isSelected ? 'rgba(79, 70, 229, 0.05)' : 'white',
                                                            transition: 'all 0.2s',
                                                        }}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`q-${question.id}`}
                                                            value={option}
                                                            checked={isSelected}
                                                            onChange={() => handleAnswer(question.id, option)}
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                        <span style={{ flex: 1 }}>{option}. {question[optionKey]}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                marginTop: '2rem',
                                justifyContent: 'space-between',
                            }}>
                                <button
                                    onClick={() => setStep('categories')}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: '#f1f5f9',
                                        color: '#475569',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                    }}
                                >
                                    Back
                                </button>
                                <button
                                    onClick={submitQuiz}
                                    disabled={submitting || Object.keys(answers).length < quizData.totalQuestions}
                                    style={{
                                        padding: '0.75rem 2rem',
                                        backgroundColor: '#4f46e5',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        cursor: submitting ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        opacity: Object.keys(answers).length < quizData.totalQuestions ? 0.5 : 1,
                                    }}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {step === 'results' && results && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '4rem',
                                fontWeight: 'bold',
                                marginBottom: '1rem',
                            }}>
                                {results.passed ? '🎉' : '❌'}
                            </div>
                            <h3 style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: results.passed ? '#10b981' : '#ef4444',
                                marginBottom: '1rem',
                            }}>
                                {results.passed ? 'Congratulations!' : 'Try Again Later'}
                            </h3>
                            <div style={{
                                background: '#f8fafc',
                                padding: '1.5rem',
                                borderRadius: '0.75rem',
                                marginBottom: '1.5rem',
                            }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>Score</p>
                                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                                        {results.score}/{results.totalQuestions} ({results.percentage}%)
                                    </p>
                                </div>
                                {results.creditsEarned > 0 && (
                                    <div>
                                        <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>Credits Earned</p>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                                            +{results.creditsEarned} Credits
                                        </p>
                                    </div>
                                )}
                            </div>
                            {!results.passed && results.nextAttemptAllowedAt && (
                                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                                    You can retake the quiz on{' '}
                                    <strong>
                                        {new Date(results.nextAttemptAllowedAt).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </strong>
                                </p>
                            )}
                            <button
                                onClick={onClose}
                                style={{
                                    padding: '0.75rem 2rem',
                                    backgroundColor: '#4f46e5',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                }}
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizModal;
