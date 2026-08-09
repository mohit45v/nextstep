"use client";

import { useState, useMemo } from "react";
import "./StreakHeatmap.css";

interface DayContribution {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export default function StreakHeatmap() {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  // Generate 84 days (12 weeks) of sample heatmap activity
  const days: DayContribution[] = useMemo(() => {
    const list: DayContribution[] = [];
    const today = new Date();

    for (let i = 83; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      // Simulated daily submission counts
      const count = Math.floor(Math.sin(i * 0.4) * 3 + Math.cos(i * 0.2) * 2 + (i % 5 === 0 ? 4 : 1));
      const safeCount = Math.max(0, count);

      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (safeCount >= 5) level = 4;
      else if (safeCount >= 3) level = 3;
      else if (safeCount >= 2) level = 2;
      else if (safeCount >= 1) level = 1;

      list.push({ date: dateStr, count: safeCount, level });
    }
    return list;
  }, []);

  const totalSubmissions = useMemo(
    () => days.reduce((sum, d) => sum + d.count, 0),
    [days]
  );

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <div className="heatmap-title-group">
          <span className="heatmap-title">📊 Practice Heatmap & Streak</span>
          <div className="streak-flame-badge">🔥 14 Day Streak!</div>
        </div>

        <div className="heatmap-stats">
          <span>
            Total Submissions: <strong>{totalSubmissions}</strong>
          </span>
          <span>
            Current Level: <strong>Master (Tier 3)</strong>
          </span>
        </div>
      </div>

      <div className="heatmap-scroll">
        <div className="heatmap-grid">
          {days.map((day) => (
            <div
              key={day.date}
              className={`heatmap-cell level-${day.level}`}
              onMouseEnter={() => setHoveredDay(`${day.date}: ${day.count} submissions`)}
              onMouseLeave={() => setHoveredDay(null)}
              title={`${day.date}: ${day.count} submissions`}
            />
          ))}
        </div>
      </div>

      <div className="heatmap-legend">
        <span>Less</span>
        <div className="heatmap-legend-cell level-0" />
        <div className="heatmap-legend-cell level-1" />
        <div className="heatmap-legend-cell level-2" />
        <div className="heatmap-legend-cell level-3" />
        <div className="heatmap-legend-cell level-4" />
        <span>More</span>

        {hoveredDay && (
          <span style={{ marginLeft: "auto", fontWeight: 700, color: "#6c5ce7" }}>
            {hoveredDay}
          </span>
        )}
      </div>
    </div>
  );
}
