import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div>
          <h3 className={styles.logo}>BuyNest</h3>
          <p className={styles.tagline}>
            Premium E-Commerce Platform.
          </p>
        </div>

        <div className={styles.linkGroup}>
          <Link to='/about' className={styles.footerLink}>
            About Us
          </Link>
          <Link to='/return' className={styles.footerLink}>
            Return Policy
          </Link>
          <Link
            to='/disclaimer'
            className={styles.footerLink}
          >
            Disclaimer
          </Link>
        </div>

        <div className={styles.copyright}>
          &copy; {new Date().getFullYear()} BuyNest. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
