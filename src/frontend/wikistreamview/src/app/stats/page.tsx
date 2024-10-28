"use client";

import styles from "./page.module.css";
import StatsBox from "../components/statBox/sidemenucomponent";
import Timer from "../components/timer/timercomponent";
import RecentChangesService from "../utils/recentchangesservice"; // Adjust the path as needed
import { useEffect, useState } from "react";

interface EventEntry {
  timestamp: number;
  domain: string;
  count: number;
}

export default function StatsPage() {
  // Controls stream state
  const [isStreaming, setIsStreaming] = useState(false);
  const [recentChangesService, setRecentChangesService] = useState<RecentChangesService | null>(null);
  //Total Count for main box
  const [totalCount, setTotalCount] = useState(0);
  //Total Counts for other boxes
  const [counts, setCounts] = useState<Map<string, number>>(new Map());

  const [eventCounts, setEventCounts] = useState<EventEntry[]>([]);
  //HeartBeat
  const [heartbeatDomains, setHeartbeatDomains] = useState<Map<string, boolean>>(new Map());

  const handleNewEvent = (domain: string) => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    triggerHeartbeat(domain);
    setEventCounts((prevEventCounts) => {
      const lastEntryIndex = prevEventCounts.findIndex((entry) => entry.timestamp === currentTimestamp && entry.domain === domain);

      if (lastEntryIndex !== -1) {
        // If entry for this timestamp and domain exists, create a new updated entry
        const updatedEntry = {
          ...prevEventCounts[lastEntryIndex],
          count: prevEventCounts[lastEntryIndex].count + 1,
        };
        return [...prevEventCounts.slice(0, lastEntryIndex), updatedEntry, ...prevEventCounts.slice(lastEntryIndex + 1)];
      } else {
        // Add a new entry for the new second
        return [...prevEventCounts, { timestamp: currentTimestamp, domain, count: 1 }];
      }
    });
  };

  //Get Last 5sec count
  const getTotalCountByDomain = (domain: string, seconds: number) => {
    const currentTimestamp = Math.floor(Date.now() / 1000);

    return eventCounts
      .filter(
        (entry) =>
          (domain === "" || entry.domain === domain) && // If domain is "" get all, otherwise match domain
          entry.timestamp >= currentTimestamp - seconds
      )
      .reduce((sum, entry) => sum + entry.count, 0);
  };

  const startStreaming = async () => {
    const recentChangesService = new RecentChangesService();
    await recentChangesService.init();
    recentChangesService.startConnection();

    recentChangesService.onReceiveMessage((user, message) => {
      setTotalCount((prevTotalCount) => prevTotalCount + 1);
      setCounts((prevCounts) => {
        const newCounts = new Map(prevCounts);
        newCounts.set(message.domain, (newCounts.get(message.domain) || 0) + 1);

        handleNewEvent(message.domain);
        return newCounts; // Return the updated Map
      });

      setRecentChangesService(recentChangesService); // Store the connection instance
      setIsStreaming(true); // Set stream as active
    });
  };

  // Stop Streaming (Disconnect from SignalR)
  const stopStreaming = () => {
    if (recentChangesService) {
      recentChangesService.stopConnection();
      setRecentChangesService(null);
    }
    setIsStreaming(false); // Set stream as inactive
  };

  useEffect(() => {
    return () => {
      if (recentChangesService) {
        recentChangesService.stopConnection();
      }
    };
  }, [recentChangesService]);

  // Trigger heartbeat for a specific domain
  const triggerHeartbeat = (domain: string) => {
    setHeartbeatDomains((prev) => {
      const newMap = new Map(prev);

      if (prev.get(domain) === false || prev.get(domain) === undefined) {
        newMap.set(domain, true);
        setTimeout(() => {
          setHeartbeatDomains((prev) => {
            const newMap = new Map(prev);
            newMap.set(domain, false);
            return newMap;
          });
        }, 600);
      }

      if (prev.get("totalCount") === false || prev.get("totalCount") === undefined) {
        newMap.set("totalCount", true);
        setTimeout(() => {
          setHeartbeatDomains((prev) => {
            const newMap = new Map(prev);
            newMap.set("totalCount", false);
            return newMap;
          });
        }, 600);
      }

      return newMap;
    });
  };

  return (
    <>
      <div className={styles.statsContainer}>
        <Timer startStreaming={startStreaming} stopStreaming={stopStreaming} isStreaming={isStreaming} />
        <div className={styles.statsGrid}>
          <StatsBox
            key="Total Changes"
            statTitle="Total Changes"
            totalLast5s={getTotalCountByDomain("", 5)}
            totalLast1m={getTotalCountByDomain("", 60)}
            totalLast1h={getTotalCountByDomain("", 3600)}
            total={totalCount}
            heartbeat={heartbeatDomains.get("totalCount") ?? false}
          />

          {[...counts.entries()]
            .sort(([, countA], [, countB]) => countB - countA) // Sort by count in descending order
            .map(([domain, count]) => (
              <StatsBox
                key={domain}
                statTitle={domain}
                totalLast5s={getTotalCountByDomain(domain, 5)}
                totalLast1m={getTotalCountByDomain(domain, 60)}
                totalLast1h={getTotalCountByDomain(domain, 3600)}
                total={count}
                heartbeat={heartbeatDomains.get(domain) ?? false}
              />
            ))}
        </div>
      </div>
    </>
  );
}
