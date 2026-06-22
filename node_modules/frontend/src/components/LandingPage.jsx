import React from 'react';
import { motion } from 'framer-motion';
import { Award, Zap, CheckCircle2, Download, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LandingPage({ onStart }) {
  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Hero Section */}
      <section className="hero-section">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="hero-badge">
            <Zap size={14} style={{ fill: 'currentColor' }} />
            <span>Official Skills Assessment 2026</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 variants={itemVariants} className="hero-title">
            Validate Your Skills. <br />
            Get <span>Certified</span> Instantly.
          </motion.h1>

          {/* Description */}
          <motion.p variants={itemVariants} className="hero-subtitle">
            Take our premium technical assessments in Web Development, DBMS, OS, AI, or Aptitude. Validate your knowledge, unlock detailed performance analyses, and download verified PDF certificates to boost your career.
          </motion.p>

          {/* Buttons */}
          <motion.div variants={itemVariants} className="hero-cta">
            <motion.button 
              onClick={onStart} 
              className="btn btn-primary" 
              id="hero-start-quiz-btn"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Free Quiz
              <ArrowRight size={16} />
            </motion.button>
            <motion.a 
              href="#features" 
              className="btn btn-secondary"
              id="hero-learn-more-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Learn More
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Hero Card Preview with Tilt float effect */}
        <motion.div 
          className="hero-image-wrapper"
          initial={{ opacity: 0, scale: 0.92, rotateY: -10 }}
          animate={{ opacity: 1, scale: 1, rotateY: -5 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <div className="hero-circle-bg"></div>
          
          <motion.div 
            className="hero-card-preview"
            whileHover={{ 
              rotateY: 0, 
              rotateX: 0, 
              scale: 1.03,
              boxShadow: "0 30px 60px rgba(139, 92, 246, 0.2)"
            }}
            transition={{ duration: 0.5, cubicBezier: [0.16, 1, 0.3, 1] }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Award size={20} color="var(--primary)" />
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-dark)' }}>Verified Certificate</strong>
              </div>
              <span className="meta-pill" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success-text)', borderColor: 'rgba(16,185,129,0.2)' }}>Active Status</span>
            </div>
            
            <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>Web Development Specialist</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Issued to: <strong style={{ color: 'var(--text-dark)' }}>Jane Doe</strong></p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.15rem' }}>Score Achieved</span>
                <strong style={{ color: 'var(--text-dark)', fontSize: '0.95rem' }}>92% (Excellent)</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.15rem' }}>Verification ID</span>
                <strong style={{ color: 'var(--text-dark)', fontFamily: 'monospace', fontSize: '0.9rem' }}>QM-WEBDEV-980121</strong>
              </div>
            </div>
            
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldCheck size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
              Secure cryptographic signature attached.
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Engineered for Modern Professionals</h2>
          <p>Assess your concepts across high-demand computer science fields with zero fluff and maximum efficiency.</p>
        </div>

        <motion.div 
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={itemVariants} className="feature-card">
            <div className="feature-icon-box">
              <Zap size={22} style={{ fill: 'currentColor' }} />
            </div>
            <h3>Instant Verification</h3>
            <p>Complete the quiz, review answers, and receive your cryptographic performance breakdown instantly.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="feature-card">
            <div className="feature-icon-box">
              <Download size={22} />
            </div>
            <h3>Printable PDF Certificate</h3>
            <p>Generate highly aesthetic, shareable certificates optimized for LinkedIn, resumes, and portfolios.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="feature-card">
            <div className="feature-icon-box">
              <Award size={22} />
            </div>
            <h3>Curated Syllabus</h3>
            <p>Industry-standard questions designed by leading specialists in DBMS, AI, Web Dev, OS, and Aptitude.</p>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
