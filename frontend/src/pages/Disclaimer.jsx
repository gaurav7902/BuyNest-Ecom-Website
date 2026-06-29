import React from "react";
import styles from "./Disclaimer.module.css";

const Disclaimer = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Legal & Site Disclaimer
      </h2>

      <p className={styles.paragraph}>
        The data, interfaces, and graphical components represented across the
        BuyNest domain strictly act uniquely as an educational development
        platform. This codebase models rigorous application structures and
        architectures for purely demonstrative, portfolio-oriented engineering
        usage.
      </p>

      <h4 className={styles.sectionTitle}>
        1. Accuracy of Materials
      </h4>
      <p className={styles.sectionText}>
        The materials spanning the BuyNest interface may heavily include
        dynamic technical, typographical, or dummy photographic elements.
        Product matrices mapped in the DB pipeline do absolutely not correlate
        to strictly real physical outputs and are safely populated via generic
        Unsplash imagery protocols.
      </p>

      <h4 className={styles.sectionTitle}>
        2. Payment Processing Restrictions
      </h4>
      <p className={styles.sectionText}>
        No authentic financial variables are handled natively within this
        environment. All payment endpoints forcefully bind exclusively to
        external testing-based networks (Sandbox Razorpay environments). No
        exact deductibles exist.
      </p>

      <h4 className={styles.sectionTitle}>
        3. External Binding Links
      </h4>
      <p className={styles.sectionText}>
        BuyNest operates completely independent domains and takes strictly zero
        absolute parameter responsibility over the specific contents or
        behaviors populated via external routing anchors generated implicitly by
        third-party configurations.
      </p>

      <p className={styles.footerNote}>
        By interacting natively within this codebase, you unconditionally signal
        acceptance bounded by these parameters efficiently.
      </p>
    </div>
  );
};

export default Disclaimer;
