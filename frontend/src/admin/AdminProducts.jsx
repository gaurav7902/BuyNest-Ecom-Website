import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import styles from './AdminProducts.module.css';

const AdminProducts = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you strictly sure you want to delete this?')) {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        setProducts(products.filter((p) => p._id !== id));
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Manage Products</h2>
        <Link to='/admin/add-product' className='btn'>
          + Add Product
        </Link>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.row}>
              <th className={styles.th}>ID</th>
              <th className={styles.th}>NAME</th>
              <th className={styles.th}>PRICE</th>
              <th className={styles.th}>CATEGORY</th>
              <th className={styles.th}>STOCK</th>
              <th className={styles.th}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className={styles.row}>
                <td className={styles.td}>{product._id.substring(0, 8)}...</td>
                <td className={styles.td}>{product.name}</td>
                <td className={styles.td}>₹{product.price.toFixed(2)}</td>
                <td className={styles.td}>{product.category}</td>
                <td className={styles.td}>{product.stock}</td>
                <td className={styles.td}>
                  <Link
                    to={`/admin/edit-product/${product._id}`}
                    className={styles.editBtn}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
