import React from "react";
import { Link } from "react-router-dom";
import "../styles/ProductCard.css";

const ProductCard = ({ product }) => {
  return (
    <Link to={`/product/${product._id}`} className='product-card'>
      <img
        src={product.imageUrl}
        alt={product.name}
        className='product-image'
      />
      <div className='product-info'>
        <h3>{product.name}</h3>
        <p className='price'>₹{product.price}</p>
        <span className='btn'>
          View Details
        </span>
      </div>
    </Link>
  );

};

export default ProductCard;
