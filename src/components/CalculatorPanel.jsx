import React from "react";
import MoveResultCard from "./MoveResultCard.jsx";
import useCalculator from "../hooks/useCalculator.js";

/**
 * CalculatorPanel:
 * - Receives snapshot
 * - Allows editing defender HP% and move text
 * - Delegates dataset loading + computation to the hook
 */
export default function CalculatorPanel({ snapshot }) {
  const [moveNames, setMoveNames] = React.useState(["", "", "", ""]);

  // Initialize editable inputs from snapshot whenever snapshot changes
  React.useEffect(() => {
    if (!snapshot) return;

    setMoveNames(
      Array.isArray(snapshot.moveNames) && snapshot.moveNames.length === 4
        ? snapshot.moveNames
        : ["", "", "", ""]
    );
  }, [snapshot]);

  const { loading, error, resolved, results } = useCalculator({
    snapshot,
    moveNames,
  });

  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Calculator</h2>

      {!snapshot && (
        <p style={{ color: "#555" }}>
          Press <b>Analyze snapshot</b> to load attacker/defender + 4 moves.
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
                <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <label style={{ width: 64, fontSize: 12, color: "#555" }}>
                    Move {idx + 1}
                  </label>

                  <input
                    value={name}
                    onChange={(e) => {
                      const next = [...moveNames];
                      next[idx] = e.target.value;
                      setMoveNames(next);
                    }}
                    placeholder="Type a damaging move name..."
                    style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
                  />
                </div>
              ))}
            </div>

            <p style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
            </p>
          </div>

          <hr style={{ margin: "16px 0" }} />

          {loading && <p>Loading datasets…</p>}
          {error && <p style={{ color: "crimson" }}>{error}</p>}

          {resolved && (
            <p style={{ fontSize: 12, color: "#555" }}>
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
