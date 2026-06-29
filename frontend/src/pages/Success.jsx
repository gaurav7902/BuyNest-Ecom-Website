import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Success.css';

function Success() {
  const navigate = useNavigate();

  return (
    <div className='success-container'>
      <div className='success-card'>
        <div className='success-icon'>✓</div>
        <h1>Order Placed Successfully!</h1>
        <p>
          Thank you for shopping with BuyNest. Your order has been received and
          is being processed. You will receive a confirmation email shortly.
        </p>
        <button className='btn-success' onClick={() => navigate('/')}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default Success;
