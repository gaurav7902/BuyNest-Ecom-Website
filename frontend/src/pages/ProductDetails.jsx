import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { addToCart } from '../redux/cartSlice';
import '../styles/Product.css';
import styles from './ProductDetails.module.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(
        addToCart({
          productId: product._id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          qty: 1,
        })
      );
      toast.success('Successfully added to your cart!');
    }
  };

  if (loading) return <div className={styles.loading}>Loading Product...</div>;
  if (!product) return <div className={styles.notFound}>Product Not Found</div>;

  return (
    <div className={`${styles.wrapper} product-detail-wrapper`}>
      <div className={styles.breadcrumb}>
        <Link to='/' className={styles.breadcrumbLink}>
          Home
        </Link>{' '}
        &gt;
        <Link to='/shop' className={styles.breadcrumbLink}>
          {' '}
          Shop
        </Link>{' '}
        &gt;
        <span className={styles.breadcrumbCurrent}> {product.name}</span>
      </div>

      <div className='product-detail'>
        <img
          src={product.imageUrl}
          alt={product.name}
          className='detail-image'
        />
        <div className='detail-info'>
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.price}>₹{product.price.toFixed(2)}</p>

          <div className={styles.descriptionContainer}>
            <h3 className={styles.descriptionTitle}>Description</h3>
            <p className={styles.descriptionText}>{product.description}</p>
          </div>

          <div className={styles.actionContainer}>
            <button
              onClick={handleAddToCart}
              className={`btn ${styles.addToCartBtn}`}
            >
              Add to Cart
            </button>
          </div>

          <div
            className={`${styles.stockStatus} ${product.stock > 0 ? styles.inStock : styles.outOfStock}`}
          >
            {product.stock > 0
              ? `In Stock (${product.stock} available)`
              : 'Out of Stock'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
