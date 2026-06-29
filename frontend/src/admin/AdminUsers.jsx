import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import styles from './AdminUsers.module.css';

const AdminUsers = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('/api/auth/users', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    };
    fetchUsers();
  }, [user]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>User Directory</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.row}>
              <th className={styles.th}>ID</th>
              <th className={styles.th}>NAME</th>
              <th className={styles.th}>EMAIL</th>
              <th className={styles.th}>ROLE</th>
              <th className={styles.th}>JOINED</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className={styles.row}>
                <td className={styles.td}>{u._id.substring(0, 8)}...</td>
                <td className={styles.td}>{u.name}</td>
                <td className={styles.td}>{u.email}</td>
                <td className={styles.td}>
                  <span
                    className={`${styles.roleBadge} ${u.role === 'admin' ? styles.roleAdmin : styles.roleUser}`}
                  >
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td className={styles.td}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
