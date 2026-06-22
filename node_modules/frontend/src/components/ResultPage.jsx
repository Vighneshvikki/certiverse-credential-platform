import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import { Award, Download, RotateCcw, Check, X, ShieldCheck, Flame, Zap, Award as AwardIcon, Calendar } from 'lucide-react';

export default function ResultPage({ resultData, onRestart }) {
  const {
    userName,
    categoryName,
    score,
    totalQuestions,
    percentage,
    date,
    verificationHash,
    breakdown
  } = resultData;

  const [popupActive, setPopupActive] = useState(true);

  // Trigger Confetti Celebration and Fireworks Effect on mount
  useEffect(() => {
    // 1. Initial big blast
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.65 },
      colors: ['#8b5cf6', '#ec4899', '#f97316', '#3b82f6', '#06b6d4']
    });

    // 2. Continuous fireworks duration (3 seconds)
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1100 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 40 * (timeLeft / duration);
      // Shoot from left side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      // Shoot from right side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // Performance rating tiers
  let rating = {
    label: 'Needs Review',
    color: 'var(--danger)',
    accentBg: 'var(--danger-light)',
    textColor: 'var(--danger-text)',
    desc: 'Consider reviewing the question solutions below and retaking the assessment to earn your credentials.'
  };

  if (percentage >= 80) {
    rating = {
      label: 'Excellent (Honors)',
      color: 'var(--success)',
      accentBg: 'var(--success-light)',
      textColor: 'var(--success-text)',
      desc: 'Mastery verified! You demonstrated outstanding comprehension of the assessed domain.'
    };
  } else if (percentage >= 60) {
    rating = {
      label: 'Certified Specialist',
      color: 'var(--primary)',
      accentBg: 'var(--primary-light)',
      textColor: 'var(--primary)',
      desc: 'Competency verified! You have successfully passed the assessment criteria and met certification standards.'
    };
  } else if (percentage >= 40) {
    rating = {
      label: 'Pass Status',
      color: 'var(--warning)',
      accentBg: 'var(--warning-light)',
      textColor: 'var(--warning-text)',
      desc: 'Minimum criteria met. We recommend reading through the conceptual explanations below to polish your skills.'
    };
  }

  // Draw & Download High-Fidelity A4 Landscape PDF Certificate
  const downloadPDFCertificate = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // A4 Dimensions: 297mm x 210mm
    // 1. Draw Royal Gold Outer Border
    doc.setDrawColor(201, 176, 55); // Rich Gold
    doc.setLineWidth(1.8);
    doc.rect(10, 10, 277, 190);

    // Fine Gold Inner Line
    doc.setDrawColor(212, 175, 55); 
    doc.setLineWidth(0.4);
    doc.rect(13, 13, 271, 184);

    // Decorative Royal Gold Corner Pieces
    doc.setDrawColor(201, 176, 55);
    doc.setLineWidth(1.0);
    // Top Left Corner Bracket
    doc.line(16, 16, 28, 16);
    doc.line(16, 16, 16, 28);
    // Top Right Corner Bracket
    doc.line(281, 16, 269, 16);
    doc.line(281, 16, 281, 28);
    // Bottom Left Corner Bracket
    doc.line(16, 194, 28, 194);
    doc.line(16, 194, 16, 182);
    // Bottom Right Corner Bracket
    doc.line(281, 194, 269, 194);
    doc.line(281, 194, 281, 182);

    // 2. Draw Soft Background Watermark
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(55);
    doc.setTextColor(245, 245, 250); // extremely light gray/blue
    doc.text('QUIZMINT ACADEMY', 148, 105, { align: 'center', angle: 10 });

    // 3. Branding Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(99, 102, 241); // Indigo color
    doc.text('QUIZMINT ACADEMY', 148, 32, { align: 'center' });

    // Gold divider ribbon line
    doc.setDrawColor(201, 176, 55);
    doc.setLineWidth(0.7);
    doc.line(118, 36, 178, 36);

    // 4. Main Body Text
    doc.setFont('times', 'italic');
    doc.setFontSize(23);
    doc.setTextColor(71, 85, 105);
    doc.text('Certificate of Achievement', 148, 52, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(148, 163, 184);
    doc.text('THIS IS PROUDLY PRESENTED TO', 148, 68, { align: 'center' });

    // Name - Large bold serif
    doc.setFont('times', 'bold');
    doc.setFontSize(32);
    doc.setTextColor(15, 23, 42); // deep charcoal
    doc.text(userName, 148, 86, { align: 'center' });

    // Line under recipient name
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(80, 92, 217, 92);

    // Paragraph
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text('for demonstrating outstanding cognitive competency and successfully completing the professional credentials assessment in the domain of', 148, 104, { align: 'center', maxWidth: 200 });

    // Subject/Category Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241);
    doc.text(categoryName, 148, 122, { align: 'center' });

    // Score specs
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(`Achieved a final score of ${percentage}% (${score}/${totalQuestions} Correct Options)`, 148, 134, { align: 'center' });

    // 5. Issuance details and validation ID
    // Left side seal metadata
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('ASSESSMENT REGISTRAR', 55, 156);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('QuizMint Assessment Board', 55, 161);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date of Issue: ${date}`, 55, 166);
    doc.text(`Verification ID: ${verificationHash}`, 55, 171);

    // Right side signatures
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('AUTHORIZED SIGNATURE', 242, 156, { align: 'right' });
    
    // Decorative Director signature
    doc.setFont('times', 'italic');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text('Sarah Jenkins', 242, 164, { align: 'right' });

    doc.setDrawColor(201, 176, 55);
    doc.setLineWidth(0.5);
    doc.line(195, 167, 242, 167);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Director of Certification', 242, 171, { align: 'right' });

    const filename = `QuizMint_${categoryName.replace(/\s+/g, '_')}_Credentials.pdf`;
    doc.save(filename);
  };

  return (
    <div className="results-grid" id="results-dashboard">
      
      {/* 1. Congratulations popup trigger */}
      {popupActive && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)' }}>
              <Award size={36} />
            </div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.75rem' }}>Congratulations!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
              Your payment of ₹29 was successfully verified. Your official score report is unlocked, and your cryptographic certificate is ready for download!
            </p>
            <button 
              onClick={() => setPopupActive(false)} 
              className="btn btn-primary"
              style={{ width: '100%' }}
              id="confirm-popup-btn"
            >
              View Report & Certificate
            </button>
          </motion.div>
        </div>
      )}

      {/* Results Header with animated radial gauge */}
      <div className="results-header-card glass-card">
        <div className="gauge-container">
          <svg className="gauge-svg">
            <circle className="gauge-bg" cx="90" cy="90" r="78" />
            <motion.circle 
              className="gauge-fill" 
              cx="90" 
              cy="90" 
              r="78" 
              style={{
                strokeDasharray: `${2 * Math.PI * 78}`,
                stroke: rating.color
              }}
              initial={{ strokeDashoffset: `${2 * Math.PI * 78}` }}
              animate={{ strokeDashoffset: `${2 * Math.PI * 78 * (1 - percentage / 100)}` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>
          <div className="gauge-text">
            <motion.div 
              className="gauge-score"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {percentage}%
            </motion.div>
            <div className="gauge-total" style={{ color: rating.textColor }}>
              {score} / {totalQuestions} Correct
            </div>
          </div>
        </div>

        <div className="breakdown-badge" style={{ backgroundColor: rating.accentBg, color: rating.textColor, fontSize: '0.95rem', padding: '0.4rem 1.25rem', border: `1px solid ${rating.textColor}`, marginBottom: '1.25rem', fontWeight: 800 }}>
          {rating.label}
        </div>

        <h2>Assessment Results Resolved</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '550px', marginBottom: '2.5rem' }}>{rating.desc}</p>

        <div className="action-buttons-row">
          <motion.button 
            onClick={downloadPDFCertificate} 
            className="btn btn-primary"
            id="download-pdf-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download size={18} /> Download Certificate PDF
          </motion.button>
          <motion.button 
            onClick={onRestart} 
            className="btn btn-secondary"
            id="restart-quiz-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw size={18} /> Take Another Test
          </motion.button>
        </div>
      </div>

      {/* Certificate Live Preview overhaul with Gold Framing and Watermark */}
      <div className="certificate-preview-card" id="certificate-live-preview">
        {/* Borders */}
        <div className="certificate-border"></div>

        {/* Watermark in visual background */}
        <div className="certificate-watermark">QUIZMINT</div>

        <div className="certificate-badge">
          <AwardIcon size={48} style={{ color: '#d4af37' }} />
        </div>
        <h2 className="cert-title">Certificate of Achievement</h2>
        <p className="cert-subtitle" style={{ color: '#64748b' }}>This credential verifies achievement of</p>
        
        <div className="cert-recipient">{userName}</div>
        
        <p className="cert-body">
          for successfully meeting all criteria and demonstrating subject-matter competence in the professional evaluation domain of <strong style={{ color: 'var(--primary)' }}>{categoryName}</strong>.
        </p>

        <div className="cert-meta-row">
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', fontWeight: 'bold' }}>ISSUED BY</span>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>QuizMint Assessment Board</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
              <Calendar size={12} /> {date}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', fontWeight: 'bold' }}>VERIFICATION ID</span>
            <div className="cert-verification-code">{verificationHash}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--success-text)', fontWeight: 'bold', marginTop: '0.2rem' }}>Cryptographically Verified</div>
          </div>
        </div>
      </div>

      {/* Detailed answers breakdown cards */}
      <div className="breakdown-card glass-card">
        <h3>Question Analysis & Explanations</h3>
        <div className="breakdown-list">
          {breakdown.map((item, index) => (
            <div key={item.id} className="breakdown-item" id={`breakdown-item-${item.id}`} style={{ paddingBottom: '2.5rem', marginBottom: '2.5rem' }}>
              <div className="breakdown-question-header" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                {item.isCorrect ? (
                  <span className="breakdown-badge correct" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success-text)', border: '1px solid var(--success)', padding: '0.25rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Check size={12} /> Correct
                  </span>
                ) : (
                  <span className="breakdown-badge incorrect" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger-text)', border: '1px solid var(--danger)', padding: '0.25rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <X size={12} /> Incorrect
                  </span>
                )}
                <h4 className="breakdown-question-text" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)' }}>{index + 1}. {item.question}</h4>
              </div>

              <div className="breakdown-options-grid">
                {item.options.map((option, optIdx) => {
                  const isUserSelection = item.userAnswer === optIdx;
                  const isCorrectSelection = item.correctAnswer === optIdx;

                  let optClass = '';
                  if (isUserSelection && !isCorrectSelection) optClass = 'user-selected';
                  if (isCorrectSelection) optClass = 'correct-choice';

                  return (
                    <div key={optIdx} className={`breakdown-option ${optClass}`}>
                      {option}
                      {isUserSelection && <span style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginTop: '0.25rem' }}>(Your Answer)</span>}
                      {isCorrectSelection && <span style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginTop: '0.25rem' }}>(Correct Answer)</span>}
                    </div>
                  );
                })}
              </div>

              <div className="breakdown-explanation-box">
                <strong>Explanation:</strong>
                <p>{item.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
