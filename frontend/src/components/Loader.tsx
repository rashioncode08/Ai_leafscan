import React from 'react';
import styles from './Loader.module.css';

const Loader = () => {
  return (
    <div className={styles.styledWrapper}>
      <div className={`${styles.loop} ${styles.cubes}`}>
        <div className={`${styles.item} ${styles.cubes}`} />
        <div className={`${styles.item} ${styles.cubes}`} />
        <div className={`${styles.item} ${styles.cubes}`} />
        <div className={`${styles.item} ${styles.cubes}`} />
        <div className={`${styles.item} ${styles.cubes}`} />
        <div className={`${styles.item} ${styles.cubes}`} />
      </div>
    </div>
  );
};

export default Loader;
