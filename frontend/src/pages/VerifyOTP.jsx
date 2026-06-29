import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './VerifyOTP.module.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      toast.error('No email provided. Please register first.');
      navigate('/register');
    }
  }, [email, navigate]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter all 6 digits of the OTP.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase(), otp: otpString }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Email verified successfully! Please log in.');
        navigate('/login');
      } else {
        toast.error(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('An error occurred during verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2>Verify Email</h2>
        <p className={styles.authSubtitle}>
          Enter the 6-digit OTP sent to {email}
        </p>
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label>OTP Code</label>
            <div className={styles.otpContainer}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type='text'
                  className={styles.otpInput}
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  ref={(el) => (inputRefs.current[index] = el)}
                  maxLength={1}
                  required
                />
              ))}
            </div>
          </div>
          <button type='submit' className='btn' disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
        <div className={styles.authFooter}>
          <p>
            Didn't receive the code?{' '}
            <a href='/register' className={styles.authLink}>
              Register again
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
