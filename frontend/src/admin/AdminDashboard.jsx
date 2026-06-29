import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/analytics', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setStats(data);
        } else {
          if (res.status === 401) {
            navigate('/login');
          }
          setStats({
            totalOrders: 0,
            totalProducts: 0,
            totalUsers: 0,
            totalRevenue: 0,
          });
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load admin statistics.');
      }
    };
    fetchStats();
  }, [user, navigate]);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <img
          src='/brand-logo.png'
          alt='Logo'
          className={styles.logo}
        />
        <h2 className={styles.title}>Admin Dashboard</h2>
      </div>
      <p className={styles.welcomeText}>
        Welcome back, <span className={styles.welcomeName}>{user?.name}</span>
      </p>

      {stats ? (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h4 className={styles.statLabel}>Total Orders</h4>
            <div className={styles.statNumber}>{stats.totalOrders}</div>
          </div>
          <div className={styles.statCard}>
            <h4 className={styles.statLabel}>
              Total Products
            </h4>
            <div className={styles.statNumber}>{stats.totalProducts}</div>
          </div>
          <div className={styles.statCard}>
            <h4 className={styles.statLabel}>Total Users</h4>
            <div className={styles.statNumber}>{stats.totalUsers}</div>
          </div>
          <div className={styles.statCard}>
            <h4 className={styles.statLabel}>
              Total Revenue
            </h4>
            <div className={styles.statNumber}>₹{stats.totalRevenue.toFixed(2)}</div>
          </div>
        </div>
      ) : (
        <div className={styles.loadingText}>
          Loading metrics...
        </div>
      )}

      <div className={styles.controlsSection}>
        <h3 className={styles.controlsTitle}>
          Administrative Controls
        </h3>
        <div className={styles.buttonsWrapper}>
          <button
            className='btn'
            onClick={() => navigate('/admin/add-product')}
          >
            + Add Product
          </button>
          <button
            className={`btn ${styles.grayBtn}`}
            onClick={() => navigate('/admin/products')}
          >
            📦 Manage Products
          </button>
          <button
            className={`btn ${styles.grayBtn}`}
            onClick={() => navigate('/admin/orders')}
          >
            🚚 Manage Orders
          </button>
          <button
            className={`btn ${styles.grayBtn}`}
            onClick={() => navigate('/admin/users')}
          >
            👥 Users Directory
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
