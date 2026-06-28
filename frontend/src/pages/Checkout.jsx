import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { clearCart } from '../redux/cartSlice';
import '../styles/Checkout.css';

const Checkout = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create Razorpay Order
      const paymentResponse = await axios.post('/api/payments/create-order', {
        items: cartItems.map((item) => ({
          _id: item.productId,
          quantity: item.qty,
        })),
      });

      const { order: razorpayOrder, totalAmount } = paymentResponse.data;

      // 2. Create Order in our database (with paymentId = razorpayOrder.id)
      const orderResponse = await axios.post('/api/orders', {
        items: cartItems.map((item) => ({
          _id: item.productId,
          quantity: item.qty,
        })),
        address,
        paymentId: razorpayOrder.id,
      });

      // 3. Configure Razorpay Checkout
      const options = {
        key: 'YOUR_RAZORPAY_KEY', // This should ideally come from env or a config file
        amount: totalAmount * 100,
        currency: 'INR',
        name: 'BuyNest',
        description: 'Payment for your order',
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            // 4. Verify Payment
            await axios.post('/api/payments/process-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            dispatch(clearCart());
            navigate('/success');
          } catch (err) {
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: address.fullName,
          email: '', // You could get this from user context
          contact: '9999999999',
        },
        theme: {
          color: '#10b981', // Use our Emerald Green
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(
        err.response?.data?.message || 'An error occurred during checkout.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className='checkout-empty'>
        <h2>Your cart is empty</h2>
        <p>Please add some items to your cart before proceeding to checkout.</p>
      </div>
    );
  }

  return (
    <div className='checkout-container'>
      <div className='checkout-layout'>
        <div className='checkout-form-section'>
          <h2>Shipping Details</h2>
          <form onSubmit={handleCheckout}>
            <div className='form-group'>
              <label>Full Name</label>
              <input
                type='text'
                name='fullName'
                value={address.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className='form-group'>
              <label>Street Address</label>
              <input
                type='text'
                name='street'
                value={address.street}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className='form-row'>
              <div className='form-group'>
                <label>City</label>
                <input
                  type='text'
                  name='city'
                  value={address.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className='form-group'>
                <label>State</label>
                <input
                  type='text'
                  name='state'
                  value={address.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className='form-row'>
              <div className='form-group'>
                <label>Postal Code</label>
                <input
                  type='text'
                  name='postalCode'
                  value={address.postalCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className='form-group'>
                <label>Country</label>
                <input
                  type='text'
                  name='country'
                  value={address.country}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            {error && <p className='error-message'>{error}</p>}
            <button
              type='submit'
              className='btn-checkout-submit'
              disabled={loading}
            >
              {loading ? 'Processing...' : `Pay ₹${totalPrice.toFixed(2)}`}
            </button>
          </form>
        </div>
        <div className='checkout-summary-section'>
          <h2>Order Summary</h2>
          <div className='summary-items'>
            {cartItems.map((item) => (
              <div key={item.productId} className='summary-item'>
                <img src={item.imageUrl} alt={item.name} />
                <div className='item-info'>
                  <span>
                    {item.name} (x{item.qty})
                  </span>
                  <span>₹{item.price * item.qty}</span>
                </div>
              </div>
            ))}
          </div>
          <div className='summary-total'>
            <span>Total:</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
