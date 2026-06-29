import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import '../styles/Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase(), password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('User logged in successfully.');
        // Redirect to login page or home page
        login(data);
        navigate('/');
      } else if (response.status === 403 && data.verified === false) {
        toast.success('Verification OTP has been sent to your email.');
        navigate('/verify-otp', { state: { email: data.email } });
      } else {
        toast.error(data.message || 'Error logging in user');
      }
    } catch (error) {
      console.error('Error logging in user:', error);
      toast.error('An error occurred during login. Please try again.');
    }
  };

  return (
    <div className='auth-container'>
      <div className='auth-card'>
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className='auth-form'>
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
              placeholder='Enter your password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type='submit' className='btn'>
            Login
          </button>
        </form>
        <div className='auth-footer'>
          <p>
            Don't have an account?{' '}
            <a href='/register' className='auth-link'>
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
