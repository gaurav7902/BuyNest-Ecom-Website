import React from "react";
import styles from "./About.module.css";

const About = () => {
  return (
    <div className={styles.container}>
      <img
        src='/dp.jpg'
        alt='@Gaurav Patidar'
        className={styles.profileImage}
      />
      <h2 className={styles.title}>
        About Me
      </h2>
      <h3 className={styles.subtitle}>
        Gaurav Patidar (@gaurav7902)
      </h3>

      <p className={styles.text}>
        I am a passionate web developer . I love building interactive and
        user-friendly web applications.
      </p>
      <p className={styles.textHighlight}>
        <strong>Code. Learn. Create. Repeat. That's my mantra.</strong>
      </p>
      <p className={styles.text}>
        That's my mantra. I believe in continuous learning and sharing
        knowledge.
      </p>

      <div className={styles.socialLinks}>
        <a
          href='https://github.com/gaurav7902'
          target='_blank'
          rel='noreferrer'
          className={styles.socialBtn}
        >
          🌐 Website
        </a>
        <a
          href='https://youtube.com/@go7av'
          target='_blank'
          rel='noreferrer'
          className={`${styles.socialBtn} ${styles.btnYoutube}`}
        >
          📺 YouTube
        </a>
        <a
          href='https://instagram.com/go7av'
          target='_blank'
          rel='noreferrer'
          className={`${styles.socialBtn} ${styles.btnInstagram}`}
        >
          📸 Instagram
        </a>
        <a
          href='https://www.linkedin.com/in/gauravpatidar'
          target='_blank'
          rel='noreferrer'
          className={`${styles.socialBtn} ${styles.btnLinkedin}`}
        >
          💼 LinkedIn
        </a>
        <a
          href='https://x.com/ggoravv'
          target='_blank'
          rel='noreferrer'
          className={styles.socialBtn}
        >
          ✖️ X (Twitter)
        </a>
        <a
          href='https://linktr.ee/go7av'
          target='_blank'
          rel='noreferrer'
          className={styles.socialBtn}
        >
          🔗 Linktree
        </a>
      </div>
    </div>
  );
};

export default About;
