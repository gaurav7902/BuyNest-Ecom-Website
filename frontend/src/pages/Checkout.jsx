import React, { useState, useEffect, useContext, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { clearCart } from '../redux/cartSlice';
import toast from 'react-hot-toast';
import '../styles/Checkout.css';
import { AuthContext } from '../context/AuthContext.jsx';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hasAlerted = useRef(false);

  useEffect(() => {
    if (!user && !hasAlerted.current) {
      hasAlerted.current = true;
      toast.error('Please login to proceed to checkout');
      navigate('/login');
    }
  }, [user, navigate]);

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

    const authHeader = {
      headers: {
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo'))?.token}`,
      },
    };

    try {
      // 1. Create Razorpay Order
      const paymentResponse = await axios.post(
        '/api/payment/order',
        {
          items: cartItems.map((item) => ({
            _id: item.productId,
            quantity: item.qty,
          })),
        },
        authHeader
      );

      const {
        order: razorpayOrder,
        totalAmount,
        bypassMode,
      } = paymentResponse.data;

      // 2. Create Order in our database (with paymentId = razorpayOrder.id)
      await axios.post(
        '/api/orders',
        {
          items: cartItems.map((item) => ({
            _id: item.productId,
            quantity: item.qty,
          })),
          address,
          paymentId: razorpayOrder.id,
        },
        authHeader
      );

      if (bypassMode) {
        try {
          await axios.post(
            '/api/payment/verify',
            {
              razorpay_order_id: razorpayOrder.id,
              razorpay_payment_id: 'pay_mock_payment_id',
              razorpay_signature: 'mock_signature',
            },
            authHeader
          );

          dispatch(clearCart());
          navigate('/checkout/success');
        } catch (err) {
          setError('Mock payment verification failed.');
        }
        return;
      }

      // 3. Configure Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: totalAmount * 100,
        currency: 'INR',
        name: 'BuyNest',
        description: 'Payment for your order',
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            // 4. Verify Payment
            await axios.post(
              '/api/payment/verify',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              authHeader
            );

            dispatch(clearCart());
            navigate('/checkout/success');
          } catch (err) {
            navigate('/checkout/failure');
          }
        },
        prefill: {
          name: address.fullName,
          email: user?.email || '',
          contact: '9999999999',
        },
        theme: {
          color: '#10b981',
        },
        modal: {
          ondismiss: () => {
            setError(
              'Payment cancelled. Please try again if you wish to complete your purchase.'
            );
          },
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

  if (!user) return null;

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
