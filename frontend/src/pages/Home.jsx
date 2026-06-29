import React, { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data.slice(0, 4)); // Featured products
      } catch (error) {
        console.error(error);
        toast.error('Failed to load featured products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className='home-container'>
      <div className='hero-banner'>
        <h1>Welcome to BuyNest !!</h1>
        <p>Find the best products at unbeatable prices.</p>
      </div>
      <h2 style={{ textAlign: 'center' }}>Featured Products</h2>
      {loading ? (
        <div style={{ textAlign: 'center' }}>Loading...</div>
      ) : (
        <div className='product-grid'>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Link to='/shop' className='btn'>Shop All Products</Link>
      </div>
    </div>
  );
};

export default Home;
