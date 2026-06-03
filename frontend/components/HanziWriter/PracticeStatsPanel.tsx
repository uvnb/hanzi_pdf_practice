"use client";

import { useEffect, useState } from "react";
import { fetchStats, PracticeStats as StatsData } from "@/lib/hanzi-api";

export default function PracticeStatsPanel({ refreshKey = 0 }: { refreshKey?: number }) {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch(() => {}); // Fails silently if not logged in
  }, [refreshKey]);

  if (!stats) return null;

  return (
    <div style={{ marginTop: 32, padding: 16, background: "var(--input)", borderRadius: 12 }}>
      <h3 style={{ fontSize: 14, color: "var(--accent)", margin: "0 0 12px", textTransform: "uppercase" }}>
        Thống kê Luyện tập
      </h3>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Lượt viết</p>
          <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 700 }}>{stats.total_attempts}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Hoàn hảo</p>
          <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 700, color: "var(--success)" }}>
            {stats.perfect_count}
          </p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Chữ đã học</p>
          <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 700 }}>{stats.total_characters_practiced}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Tỷ lệ đúng</p>
          <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 700 }}>
            {Math.round(stats.accuracy_rate * 100)}%
          </p>
        </div>
      </div>
      
      {stats.streak_days > 0 && (
        <div style={{ background: "var(--paper)", padding: "8px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <span>🔥</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Chuỗi {stats.streak_days} ngày</span>
        </div>
      )}
    </div>
  );
}
