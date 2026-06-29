import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import '../styles/Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email: email.toLowerCase(), password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('User registered successfully, check your email for verification.');
        // Redirect to OTP verification page
        navigate('/verify-otp', { state: { email } });
      } else if (response.status === 403 && data.verified === false) {
        toast.success(data.message || 'Verification OTP has been resent to your email.');
        navigate('/verify-otp', { state: { email: data.email } });
      } else {
        toast.error(data.message || 'Error registering user');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      toast.error('An error occurred during registration. Please try again.');
    }
  };

  return (
    <div className='auth-container'>
      <div className='auth-card'>
        <h2>Register</h2>
        <form onSubmit={handleSubmit} className='auth-form'>
          <div className='form-group'>
            <label htmlFor='name'>Full Name</label>
            <input
              type='text'
              id='name'
              placeholder='Enter your full name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className='form-group'>
            <label htmlFor='email'>Email</label>
            <input
              type='email'
              id='email'
              placeholder='Enter your email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className='form-group'>
            <label htmlFor='password'>Password</label>
            <input
              type='password'
              id='password'
              placeholder='Create a password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className='form-group'>
            <label htmlFor='confirmPassword'>Confirm Password</label>
            <input
              type='password'
              id='confirmPassword'
              placeholder='Confirm your password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type='submit' className='btn'>
            Register
          </button>
        </form>
        <div className='auth-footer'>
          <p>
            Already have an account?{' '}
            <a href='/login' className='auth-link'>
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
