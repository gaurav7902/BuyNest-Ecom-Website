import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './AddProduct.module.css';

const AddProduct = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      toast.error('Please select an image');
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('stock', formData.stock);
    data.append('image', image);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
        body: data,
      });
      const responseData = await res.json();

      if (res.ok) {
        toast.success('Product created successfully with Cloudinary Image URL!');
        navigate('/shop');
      } else {
        toast.error(responseData.message || 'Error creating product');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while creating the product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Add New Product
      </h2>
      <form
        onSubmit={handleSubmit}
        className={styles.form}
      >
        <input
          type='text'
          placeholder='Product Name'
          required
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={styles.input}
        />
        <textarea
          placeholder='Description'
          required
          rows='4'
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className={styles.input}
        />
        <input
          type='number'
          placeholder='Price'
          required
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className={styles.input}
        />
        <input
          type='text'
          placeholder='Category'
          required
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className={styles.input}
        />
        <input
          type='number'
          placeholder='Stock Quantity'
          required
          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
          className={styles.input}
        />

        <div className={styles.imageUploadContainer}>
          <label className={styles.label}>
            Upload Product Image (Cloudinary)
          </label>
          <input
            type='file'
            accept='image/*'
            required
            onChange={(e) => setImage(e.target.files[0])}
            className={styles.fileInput}
          />
        </div>

        <button
          type='submit'
          disabled={loading}
          className={`btn ${styles.submitBtn}`}
        >
          {loading ? 'Uploading & Creating...' : 'Publish Product'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
