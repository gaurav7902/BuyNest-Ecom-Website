import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './EditProduct.module.css';

const EditProduct = () => {
  const { id } = useParams();
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

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      setFormData({
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        stock: data.stock,
      });
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('stock', formData.stock);
    if (image) data.append('image', image);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` },
        body: data,
      });
      if (res.ok) {
        toast.success('Product updated successfully!');
        navigate('/admin/products');
      } else {
        const responseData = await res.json();
        toast.error(responseData.message || 'Error updating product');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while updating the product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Edit Product</h2>
      <form
        onSubmit={handleSubmit}
        className={styles.form}
      >
        <input
          type='text'
          placeholder='Product Name'
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={styles.input}
        />
        <textarea
          placeholder='Description'
          required
          rows='4'
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className={styles.input}
        />
        <input
          type='number'
          placeholder='Price'
          required
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className={styles.input}
        />
        <input
          type='text'
          placeholder='Category'
          required
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className={styles.input}
        />
        <input
          type='number'
          placeholder='Stock'
          required
          value={formData.stock}
          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
          className={styles.input}
        />
        <div className={styles.imageUploadContainer}>
          <label className={styles.label}>
            Replace Image (Optional)
          </label>
          <input
            type='file'
            accept='image/*'
            onChange={(e) => setImage(e.target.files[0])}
            className={styles.fileInput}
          />
        </div>
        <button
          type='submit'
          disabled={loading}
          className={`btn ${styles.submitBtn}`}
        >
          {loading ? 'Updating...' : 'Update Product'}
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
