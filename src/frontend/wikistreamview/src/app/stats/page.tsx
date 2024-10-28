"use client";

import styles from "./page.module.css";
import StatsBox from "../components/statBox/sidemenucomponent";
import Timer from "../components/timer/timercomponent";
import RecentChangesService from "../utils/recentchangesservice";
import { useEffect, useState } from "react";

interface EventEntry {
  timestamp: number;
  domain: string;
  count: number;
}

export default function StatsPage() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentChangesService, setRecentChangesService] = useState<RecentChangesService | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [counts, setCounts] = useState<Map<string, number>>(new Map());
  const [eventCounts, setEventCounts] = useState<EventEntry[]>([]);
  const [heartbeatDomains, setHeartbeatDomains] = useState<Map<string, boolean>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  // Initialize RecentChangesService once and store it
  useEffect(() => {
    const service = new RecentChangesService();
    checkHubStatus();
    setRecentChangesService(service);
  }, []);

  // Start streaming and connection setup
  const startStreaming = async () => {
    if (!recentChangesService) return;

    setIsLoading(true);
    await recentChangesService.init();
    recentChangesService.startConnection();

    // Set up the message handler and update states immediately
    recentChangesService.onReceiveMessage((user, message) => {
      setTotalCount((prevTotalCount) => prevTotalCount + 1);
      setCounts((prevCounts) => {
        setIsLoading(false);
        const newCounts = new Map(prevCounts);
        newCounts.set(message.domain, (newCounts.get(message.domain) || 0) + 1);
        handleNewEvent(message.domain);
        return newCounts;
      });
    });

    setIsStreaming(true);
  };

  const checkHubStatus = async () => {
    try {
      const response = await fetch("https://wikidatastreamappservice-epc9e0e2eggcabce.westeurope-01.azurewebsites.net/api/hubstatus");
      const isOnline = await response.json();
      setIsConnected(isOnline); // Set `isConnected` based on the API response
    } catch {
      setIsConnected(false); // Set to false if request fails
    }
  };

  // Stop streaming and reset relevant states
  const stopStreaming = () => {
    if (recentChangesService) {
      recentChangesService.stopConnection();
    }
    setIsStreaming(false);
  };

  // Check connection status every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(checkHubStatus, 5000);
    return () => clearInterval(intervalId);
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

  const handleNewEvent = (domain: string) => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    triggerHeartbeat(domain);
    setEventCounts((prevEventCounts) => {
      const lastEntryIndex = prevEventCounts.findIndex((entry) => entry.timestamp === currentTimestamp && entry.domain === domain);

      if (lastEntryIndex !== -1) {
        const updatedEntry = {
          ...prevEventCounts[lastEntryIndex],
          count: prevEventCounts[lastEntryIndex].count + 1,
        };
        return [...prevEventCounts.slice(0, lastEntryIndex), updatedEntry, ...prevEventCounts.slice(lastEntryIndex + 1)];
      } else {
        return [...prevEventCounts, { timestamp: currentTimestamp, domain, count: 1 }];
      }
    });
  };

  const getTotalCountByDomain = (domain: string, seconds: number) => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    return eventCounts.filter((entry) => (domain === "" || entry.domain === domain) && entry.timestamp >= currentTimestamp - seconds).reduce((sum, entry) => sum + entry.count, 0);
  };

  useEffect(() => {
    if (recentChangesService) {
      startStreaming();
    }
  }, [recentChangesService]);

  return (
    <>
      <div className={styles.statsContainer}>
        <Timer startStreaming={startStreaming} isConnected={isConnected} isLoading={isLoading} stopStreaming={stopStreaming} isStreaming={isStreaming} />
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
            .sort(([, countA], [, countB]) => countB - countA)
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
