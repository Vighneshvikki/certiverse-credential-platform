import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ArrowLeft, ArrowRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function QuizPage({ category, userName, onSubmit, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const [submitting, setSubmitting] = useState(false);
  const [slideDirection, setSlideDirection] = useState(1); // 1 = right, -1 = left

  const timerRef = useRef(null);

  useEffect(() => {
    fetch(`/api/questions/${category.id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load questions');
        }
        return res.json();
      })
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to download questions database. Please try again.');
        setLoading(false);
      });

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [category.id]);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const submitQuizAnswers = (finalAnswers = selectedAnswers) => {
    if (submitting) return;
    setSubmitting(true);
    stopTimer();

    fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        category: category.id,
        answers: finalAnswers,
        userName: userName
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Submission failed');
        }
        return res.json();
      })
      .then((data) => {
        onSubmit(data);
      })
      .catch((err) => {
        console.error(err);
        setError('Error submitting assessment. Please retry.');
        setSubmitting(false);
      });
  };

  const handleAutoSubmit = () => {
    submitQuizAnswers();
  };

  const handleOptionSelect = (optionIndex) => {
    const questionId = questions[currentIdx].id;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setSlideDirection(1);
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setSlideDirection(-1);
      setCurrentIdx(currentIdx - 1);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0' }}>
        <Loader2 size={36} className="spinner" style={{ animation: 'spinner 1s linear infinite', color: 'var(--primary)', marginBottom: '1rem' }} />
        <p style={{ color: 'var(--text-muted)' }}>Retrieving assessment questions...</p>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div style={{ backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger-text)', borderRadius: 'var(--radius-md)', padding: '1.5rem', color: 'var(--danger-text)', maxWidth: '600px', margin: '2rem auto' }}>
        <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} /> Error
        </h4>
        <p>{error}</p>
        <button onClick={onBack} className="btn btn-secondary" style={{ marginTop: '1rem' }}>Back to Categories</button>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;
  const selectedOption = selectedAnswers[currentQuestion.id];

  // Question slide animation parameters
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  return (
    <div className="quiz-container">
      {/* Quiz Top bar card */}
      <div className="quiz-header-card">
        <div className="quiz-title-section">
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.02em' }}>{category.name} Quiz</h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Candidate: <strong>{userName || 'Anonymous'}</strong></span>
        </div>
        <motion.div 
          className={`quiz-timer ${timeLeft < 60 ? 'low-time' : ''}`} 
          id="quiz-countdown-timer"
          animate={timeLeft < 60 ? { scale: [1, 1.04, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <Timer size={16} />
          {formatTime(timeLeft)}
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question Card Wrap */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence initial={false} custom={slideDirection} mode="wait">
          <motion.div
            key={currentIdx}
            custom={slideDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="question-card"
          >
            <div className="question-number">Question {currentIdx + 1} of {questions.length}</div>
            <h3 className="question-text" id={`quiz-question-text-${currentIdx}`}>{currentQuestion.question}</h3>

            <div className="options-list">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOption === index;
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    className={`option-button ${isSelected ? 'selected' : ''}`}
                    id={`option-btn-${currentIdx}-${index}`}
                    whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span>{option}</span>
                    <span className="option-marker"></span>
                  </motion.button>
                );
              })}
            </div>

            {/* Footer Navigation */}
            <div className="quiz-navigation">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="btn btn-secondary"
                id="quiz-prev-btn"
              >
                <ArrowLeft size={16} /> Previous
              </button>

              {isLastQuestion ? (
                <motion.button
                  onClick={() => submitQuizAnswers()}
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ backgroundColor: 'var(--success)', backgroundImage: 'none' }}
                  id="quiz-submit-btn"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="spinner" style={{ animation: 'spinner 1s linear infinite' }} /> Submitting...
                    </>
                  ) : (
                    <>
                      Submit Evaluation <CheckCircle2 size={16} />
                    </>
                  )}
                </motion.button>
              ) : (
                <button
                  onClick={handleNext}
                  className="btn btn-primary"
                  id="quiz-next-btn"
                >
                  Next <ArrowRight size={16} />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
