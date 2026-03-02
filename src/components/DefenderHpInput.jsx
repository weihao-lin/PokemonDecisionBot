import React from "react";

/**
 * Simple HP% input:
 * - Number input + slider
 * - Clamped to [1, 100]
 */
export default function DefenderHpInput({ value, onChange }) {
  const clamped = Math.max(1, Math.min(100, Number(value) || 100));

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <label style={{ fontSize: 14 }}>
        <b>Defender HP%</b>
      </label>

      <input
        type="number"
        min={1}
        max={100}
        value={clamped}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: 80, padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
      />

      <input
        type="range"
        min={1}
        max={100}
        value={clamped}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1 }}
      />
    </div>
  );
}