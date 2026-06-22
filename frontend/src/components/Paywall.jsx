import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, FileText, CheckCircle2, ChevronRight, HelpCircle, Loader2, Sparkles } from 'lucide-react';

export default function Paywall({ sessionId, scoreSummary, category, onPaymentSuccess, onBack }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState('idle'); // 'idle' | 'processing' | 'success'
  const [error, setError] = useState('');

  // Load Razorpay Checkout SDK Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      // Clean up script on unmount
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  // Razorpay Checkout Handler
  const handleRazorpayCheckout = async () => {
    setIsProcessing(true);
    setPaymentStep('processing');
    setError('');

    try {
      // 1. Fetch Order Details from Express Backend
      const orderRes = await fetch('/api/payment/razorpay/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
      });

      if (!orderRes.ok) {
        throw new Error('Failed to initiate order creation.');
      }

      const orderData = await orderRes.json();
      const { orderId, amount, currency, keyId, isMock } = orderData;

      // 2. If backend falls back to Mock Mode (no valid credentials)
      if (isMock) {
        console.log('Keys missing. Fallback to checkout simulation mode.');
        triggerMockVerification(true);
        return;
      }

      // 3. Otherwise trigger real Razorpay Checkout interface
      setIsProcessing(false);
      setPaymentStep('idle');

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'QuizMint Academy',
        description: 'Unlock Results & Certificate',
        order_id: orderId,
        handler: async function (response) {
          setIsProcessing(true);
          setPaymentStep('processing');
          try {
            // Send payment credentials to backend verification
            const verifyRes = await fetch('/api/payment/razorpay/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                sessionId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                isMock: false
              })
            });

            if (!verifyRes.ok) {
              throw new Error('Payment verification failed.');
            }

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setPaymentStep('success');
              setTimeout(() => {
                onPaymentSuccess(verifyData.result);
              }, 1500);
            } else {
              throw new Error('Verification data invalid.');
            }
          } catch (err) {
            setError(err.message || 'Signature verification failed. Contact support.');
            setIsProcessing(false);
            setPaymentStep('idle');
          }
        },
        prefill: {
          name: scoreSummary?.userName || 'Graduate'
        },
        theme: {
          color: '#8b5cf6' // Brand Purple
        },
        modal: {
          ondismiss: function () {
            console.log('Payment modal dismissed by candidate.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      setError(err.message || 'Error configuring payment gateway connection.');
      setIsProcessing(false);
      setPaymentStep('idle');
    }
  };

  // Direct Mock Sandbox simulation triggers
  const triggerMockVerification = (fromRazorpayFallback = false) => {
    setIsProcessing(true);
    setPaymentStep('processing');
    setError('');

    // Simulate server verification delay (2 seconds)
    setTimeout(() => {
      setPaymentStep('success');

      // Release unlocked results after checkmark animation completes (1.5 seconds)
      setTimeout(() => {
        fetch('/api/payment/razorpay/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            sessionId,
            isMock: true
          })
        })
          .then((res) => {
            if (!res.ok) throw new Error('Sandbox verification endpoint failed.');
            return res.json();
          })
          .then((data) => {
            if (data.success) {
              onPaymentSuccess(data.result);
            } else {
              throw new Error('Unlocking session failed.');
            }
          })
          .catch((err) => {
            console.error(err);
            setError('Error resolving sandbox verification. Please retry.');
            setPaymentStep('idle');
            setIsProcessing(false);
          });
      }, 1500);
    }, 2000);
  };

  return (
    <div className="paywall-container" id="paywall-wrapper">
      {/* Locked Preview / Teaser Column */}
      <div className="paywall-info">
        <div className="hero-badge" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning-text)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
          <Sparkles size={14} />
          <span>Evaluation Completed</span>
        </div>
        <h2>Unlock Results & Certificate</h2>
        <p>
          Your assessment is complete! Complete the fee to verify your profile credentials and instantly download your printable honors certificate.
        </p>

        {/* Locked Score Visual */}
        <div className="locked-score-teaser">
          <div>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Assessment Score</strong>
            <div className="locked-score-blur">95% (Excellent)</div>
          </div>
          <div className="locked-score-badge">Locked</div>
        </div>

        {/* Locked Certificate Preview with Shine effect */}
        <div className="locked-certificate-preview">
          <div className="certificate-shine-effect"></div>
          <div className="locked-certificate-overlay">
            <Award size={40} style={{ color: 'var(--accent-orange)', marginBottom: '0.5rem' }} />
            <h4 style={{ fontWeight: 800 }}>Cryptographic Certificate</h4>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', maxWidth: '220px', margin: '0.25rem auto 0 auto' }}>Watermarked credentials issued to {scoreSummary?.userName || 'Graduate'}</p>
          </div>
          {/* Transparent SVG placeholder acting as placeholder dimensions */}
          <svg viewBox="0 0 297 210" style={{ width: '100%', height: 'auto', display: 'block', background: 'rgba(255, 255, 255, 0.03)' }}></svg>
        </div>

        <ul className="benefit-list">
          <li className="benefit-item">
            <div className="benefit-icon-box">
              <Award size={18} />
            </div>
            <div className="benefit-text">
              <h4>Verified PDF Certificate</h4>
              <p>Cryptographically signed landscape assessment document for portfolios and LinkedIn.</p>
            </div>
          </li>

          <li className="benefit-item">
            <div className="benefit-icon-box" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-blue)' }}>
              <FileText size={18} />
            </div>
            <div className="benefit-text">
              <h4>Detailed Performance Diagnostics</h4>
              <p>Granular scoring showing percentile levels, subject breakdowns, and strengths.</p>
            </div>
          </li>

          <li className="benefit-item">
            <div className="benefit-icon-box" style={{ backgroundColor: 'rgba(217, 70, 239, 0.1)', color: 'var(--accent-purple)' }}>
              <HelpCircle size={18} />
            </div>
            <div className="benefit-text">
              <h4>Review Answers & Explanations</h4>
              <p>In-depth breakdowns of all questions with correct solutions and conceptual explanations.</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Payment / Checkout Card Column */}
      <div className="paywall-card">
        <div className="checkout-header">
          <span className="score-banner">Credential Verification</span>
          <h3>Order Details</h3>
        </div>

        <div className="pricing-row">
          <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-muted)' }}>Assessment Processing</span>
          <div style={{ textAlign: 'right' }}>
            <span className="price-strike">₹99</span>
            <span className="price-actual">₹29</span>
          </div>
        </div>

        <div className="checkout-details">
          <div className="detail-row">
            <span>Assessment Category:</span>
            <span>{category?.name}</span>
          </div>
          <div className="detail-row">
            <span>Candidate:</span>
            <span>{scoreSummary?.userName || 'Graduate'}</span>
          </div>
          <div className="detail-row">
            <span>Gateway Surcharge:</span>
            <span>₹0 (Waived)</span>
          </div>
          <div className="detail-row">
            <span>Total Charge:</span>
            <span>₹29 INR</span>
          </div>
        </div>

        {error && (
          <p style={{ color: 'var(--danger-text)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem', textAlign: 'center' }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Razorpay gateway CTA */}
          <motion.button
            onClick={handleRazorpayCheckout}
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', backgroundColor: 'var(--primary)' }}
            id="razorpay-checkout-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Pay ₹29 with Razorpay
            <ChevronRight size={18} />
          </motion.button>

          {/* Fallback Simulator Sandbox CTA */}
          <motion.button
            onClick={() => triggerMockVerification(false)}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.85rem' }}
            id="simulate-checkout-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Simulate Checkout (Demo Mode)
          </motion.button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center', marginTop: '2rem', color: 'var(--text-light)', fontSize: '0.78rem' }}>
          <ShieldCheck size={16} color="var(--success)" />
          <span>Secured Sandbox Environment. ₹29 test charge.</span>
        </div>
      </div>

      {/* Simulated / Gateway verification progress modal */}
      {isProcessing && (
        <div className="modal-overlay" id="checkout-modal-overlay">
          <div className="modal-content">
            {paymentStep === 'processing' ? (
              <div>
                <div className="spinner-box" style={{ width: '50px', height: '50px', border: '3px solid rgba(139, 92, 246, 0.1)', borderTopColor: 'var(--primary)', animation: 'spinner 0.8s linear infinite', borderRadius: '50%', margin: '0 auto 2rem auto' }}></div>
                <h3>Processing Checkout</h3>
                <p>Establishing secure sandbox tokens to verify transaction hashes and update certification records. Do not close this window...</p>
              </div>
            ) : (
              <div>
                <div className="payment-animation" style={{ width: '80px', height: '80px', margin: '0 auto 2rem auto', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="pulse-ring" style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'var(--success-light)', animation: 'ringPulse 1.5s infinite' }}></div>
                  <div className="success-icon-box" style={{ backgroundColor: 'var(--success)', color: 'white', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}>
                    <CheckCircle2 size={32} />
                  </div>
                </div>
                <h3 style={{ color: 'var(--success-text)' }}>Payment Approved!</h3>
                <p>Transaction ID: tx_rzp_{Math.floor(100000 + Math.random() * 900000)}. Unlocking premium assessment records and loading credentials...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
