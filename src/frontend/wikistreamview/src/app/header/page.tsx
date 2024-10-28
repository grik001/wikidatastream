"use client";

import styles from "./page.module.css";
import { LinkedinLogo } from "phosphor-react";

export default function Header() {
  return (
    <>
      <div className={styles.headerContainer}>
        <div className={styles.headerTitleContainer}>
          <h1>WikiStreamStats</h1>
        </div>

        <div className={styles.socialContainer}>
          <a href="https://www.linkedin.com/in/keith-grima-82133955/" className={styles.socialBtn} target="_blank" rel="noopener noreferrer">
            <LinkedinLogo size={24} weight="fill" /> {/* Phosphor LinkedIn icon */}
          </a>
          <a href="https://github.com/grik001/wikidatastream" className={styles.socialBtn} target="_blank" rel="noopener noreferrer">
            <i className="fa-brands fa-github"></i>
          </a>
        </div>
      </div>
    </>
  );
}
