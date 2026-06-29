import React, { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import ProductCard from "../components/ProductCard";
import "../styles/Product.css";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='shop-container'>
      <div className='hero-banner'>
        <h1>Explore Our Collection</h1>
        <p>Discover a wide range of premium products curated just for you.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <input
          type="text"
          className="search-bar"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <h2 style={{ textAlign: 'center', marginTop: '40px' }}>All Products</h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading products...</div>
      ) : (
        <div className='product-grid'>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px' }}>
              No products found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Shop;
