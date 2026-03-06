import React from "react";
import MoveResultCard from "./MoveResultCard.jsx";
import useCalculator from "../hooks/useCalculator.js";

/**
 * CalculatorPanel:
 * - Receives snapshot
 * - Shows the 4 preset moves as read-only text
 * - Delegates dataset loading + computation to the hook
 */
export default function CalculatorPanel({ snapshot }) {
  const moveNames = Array.isArray(snapshot?.moveNames) && snapshot.moveNames.length === 4
    ? snapshot.moveNames
    : ["", "", "", ""];

  const { loading, error, resolved, results } = useCalculator({
    snapshot,
    moveNames,
  });

  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Calculator</h2>

      {!snapshot && (
        <p style={{ color: "#555" }}>
          Calculator will load when a trial begins.
        </p>
      )}

      {snapshot && (
        <>
          <div style={{ fontSize: 14, lineHeight: 1.6 }}>
            <div><b>Attacker:</b> {snapshot.attackerName}</div>
            <div><b>Defender:</b> {snapshot.defenderName}</div>
          </div>

          <div style={{ marginTop: 12 }}>
            <h3 style={{ margin: "8px 0" }}>Moves</h3>

            <div style={{ display: "grid", gap: 8 }}>
              {moveNames.map((name, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    padding: "8px 10px",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    background: "#fafafa",
                  }}
                >
                  <label style={{ width: 64, fontSize: 12, color: "#555" }}>
                    Move {idx + 1}
                  </label>
                  <span style={{ fontSize: 14 }}>{name}</span>
                </div>
              ))}
            </div>
          </div>

          <hr style={{ margin: "16px 0" }} />

          {loading && <p>Loading datasets…</p>}
          {error && <p style={{ color: "crimson" }}>{error}</p>}

          {resolved && (
            <p style={{ fontSize: 12, color: "#555" }}>
              Resolved: attacker <b>{resolved.attacker?.name ?? "?"}</b>, defender{" "}
              <b>{resolved.defender?.name ?? "?"}</b>
            </p>
          )}

          <div style={{ display: "grid", gap: 12 }}>
            {results.map((r, i) => (
              <MoveResultCard key={i} index={i} result={r} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
