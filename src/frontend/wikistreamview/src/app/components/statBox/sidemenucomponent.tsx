import styles from "./page.module.css";

interface statsBoxProps {
  statTitle: string;
  total?: number;
  totalLast5s?: number;
  totalLast1m?: number;
  totalLast1h?: number;
  heartbeat: boolean;
}

const statsBoxComponent: React.FC<statsBoxProps> = ({ statTitle, total = 0, totalLast5s = 0, totalLast1m = 0, totalLast1h = 0, heartbeat }) => {
  return (
    <div className={styles.statsBox}>
      <div className={styles.statsBoxStats}>
        <div className={styles.statsBoxTitle}>{statTitle}</div>
        <div className={styles.statsBoxMainStat}>Total:{total}</div>
        <div className={styles.statsBoxSubStat}>Past 5 seconds:{totalLast5s}</div>
        <div className={styles.statsBoxSubStat}>Past minute:{totalLast1m}</div>
        <div className={styles.statsBoxSubStat}>Past hour:{totalLast1h}</div>
      </div>
      <div className={styles.heartBeatContainer}>
        <div className={`${styles.heartBeatCircle} ${heartbeat ? styles.flash : ""}`}></div> {/* Apply heartbeat animation */}
      </div>
    </div>
  );
};

export default statsBoxComponent;
