import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Profile.module.css';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchMyOrders = async () => {
      try {
        const res = await fetch('/api/orders/myorders', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setOrders(Array.isArray(data) ? data : []);
        } else {
          // Token obsolete or 401: clear and bounce
          if (res.status === 401) {
            logout();
            navigate('/login');
          }
          setOrders([]);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load your order history.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.name}>
            My Profile
          </h2>
          <p className={styles.detail}>
            <strong>Name:</strong> {user.name}
          </p>
          <p className={styles.detailEmail}>
            <strong>Email:</strong> {user.email}
          </p>
          <span className={styles.badge}>
            Account Type: {user.role.toUpperCase()}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className={`btn ${styles.logoutBtn}`}
        >
          Logout
        </button>
      </div>

      <h3 className={styles.orderHistoryTitle}>
        Order History
      </h3>
      {loading ? (
        <p className={styles.loadingText}>Fetching your orders...</p>
      ) : orders.length === 0 ? (
        <div className={styles.noOrdersContainer}>
          <p className={styles.noOrdersText}>
            You haven't placed any orders yet.
          </p>
          <Link to='/shop' className='btn'>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className={styles.ordersGrid}>
          {orders.map((order) => (
            <div
              key={order._id}
              className={styles.orderItem}
            >
              <div>
                <p className={styles.orderInfoText}>
                  Order ID: <span className={styles.orderWhite}>{order._id}</span>
                </p>
                <p className={styles.orderInfoText}>
                  Placed On:{' '}
                  <span className={styles.orderWhite}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </p>
                <p className={styles.orderTotalText}>
                  Total:{' '}
                  <strong className={styles.orderTotalAmount}>
                    ₹{order.totalAmount.toFixed(2)}
                  </strong>
                </p>
              </div>
              <div>
                <span
                  className={`${styles.statusBadge} ${
                    order.status === 'Delivered'
                      ? styles.statusDelivered
                      : order.status === 'Shipped'
                        ? styles.statusShipped
                        : styles.statusPending
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
