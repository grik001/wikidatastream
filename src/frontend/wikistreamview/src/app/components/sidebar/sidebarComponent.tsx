"use client";

import styles from "./page.module.css";
import { Gauge, Table, ChartLine } from "phosphor-react";
import { usePathname } from "next/navigation"; // Use this if in the /app directory

const sidebarComponent = () => {
  const pathname = usePathname();

  return (
    <>
      <div className={styles.sideBarContainer}>
        <a href="/stats" className={`${styles.sideBarItem} ${pathname === "/stats" ? styles.active : ""}`}>
          <Gauge weight="light" />
        </a>
        <a href="/stream" className={`${styles.sideBarItem} ${pathname === "/stream" ? styles.active : ""}`}>
          <Table weight="light" />
        </a>
        <a href="/graphs" className={`${styles.sideBarItem} ${pathname === "/graphs" ? styles.active : ""}`}>
          <ChartLine weight="light" />
        </a>
      </div>
    </>
  );
};

export default sidebarComponent;
