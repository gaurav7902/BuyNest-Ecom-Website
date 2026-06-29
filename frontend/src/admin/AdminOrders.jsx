import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import styles from './AdminOrders.module.css';

const AdminOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    };
    fetchOrders();
  }, [user]);

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders(
        orders.map((order) => (order._id === id ? { ...order, status } : order))
      );
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Manage Orders</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.row}>
              <th className={styles.th}>ORDER ID</th>
              <th className={styles.th}>USER</th>
              <th className={styles.th}>TOTAL</th>
              <th className={styles.th}>DATE</th>
              <th className={styles.th}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className={styles.row}>
                <td className={styles.td}>{order._id.substring(0, 8)}...</td>
                <td className={styles.td}>{order.userId?.name || 'Deleted User'}</td>
                <td className={styles.td}>₹{order.totalAmount.toFixed(2)}</td>
                <td className={styles.td}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className={styles.td}>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className={styles.statusSelect}
                  >
                    <option value='Pending'>Pending</option>
                    <option value='Shipped'>Shipped</option>
                    <option value='Delivered'>Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
