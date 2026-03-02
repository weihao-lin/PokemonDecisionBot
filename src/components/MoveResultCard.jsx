import React from "react";

/**
 * Pure presentation component:
 * - Shows warning if move resolution / damage calc fails
 * - Shows damage % range and accuracy %
 */
export default function MoveResultCard({ index, result }) {
  const title = result?.move?.name || result?.inputName || `Move ${index + 1}`;

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700 }}>{title}</div>

          {result?.warning && (
            <div style={{ marginTop: 4, fontSize: 12, color: "#a15" }}>
              {result.warning}
            </div>
          )}
        </div>

        <div style={{ textAlign: "right", fontSize: 12, color: "#555" }}>
          {result?.move?.category ? <div>{result.move.category}</div> : null}
          {result?.move?.type ? <div>{result.move.type}</div> : null}
        </div>
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Stat label="Damage" value={result?.damagePctRange ?? "—"} />
        <Stat label="Accuracy" value={result?.accuracyPct ?? "—"} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ minWidth: 160 }}>
      <div style={{ fontSize: 12, color: "#555" }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700 }}>{value}</div>
    </div>
  );
}