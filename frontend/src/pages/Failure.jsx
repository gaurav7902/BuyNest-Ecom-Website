import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Failure.css';

function Failure() {
  const navigate = useNavigate();

  return (
    <div className='failure-container'>
      <div className='failure-card'>
        <div className='failure-icon'>✕</div>
        <h1>Payment Failed</h1>
        <p>
          We encountered an issue while processing your payment. Please try
          again or use a different payment method.
        </p>
        <button className='btn-failure' onClick={() => navigate('/checkout')}>
          Try Again
        </button>
      </div>
    </div>
  );
}

export default Failure;
