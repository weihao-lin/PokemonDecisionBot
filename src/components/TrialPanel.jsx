import React from "react";

/**
 * TrialPanel shows:
 * - phase
 * - goal
 * - attacker / defender
 * - 4 move buttons
 * - Analyze button only in phase 2
 */
export default function TrialPanel({
  snapshot,
  onAnalyze,
  onChooseMove,
  selectedMove,
}) {
  if (!snapshot) {
    return (
      <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Scenario</h2>
        <p>No preset selected.</p>
      </section>
    );
  }

  const calculatorAllowed = snapshot.phase === 2;

  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Scenario</h2>

      <div style={{ marginBottom: 12, padding: 10, background: "#f7f7f7", borderRadius: 8 }}>
        <div>
          <b>Phase:</b> {calculatorAllowed ? "Calculator Allowed" : "No Calculator"}
        </div>
        <div style={{ marginTop: 4 }}>
          <b>Goal:</b> {snapshot.goal}
        </div>
      </div>

      <div style={{ fontSize: 14, lineHeight: 1.7 }}>
        <div><b>Attacker:</b> {snapshot.attackerName}</div>
        <div><b>Defender:</b> {snapshot.defenderName}</div>
        <div><b>Defender HP%:</b> {snapshot.defenderHpPercent}</div>
      </div>

      <h3 style={{ marginTop: 16 }}>Choose a Move</h3>

      <div style={{ display: "grid", gap: 8 }}>
        {snapshot.moveNames.map((moveName, idx) => {
          const isSelected = selectedMove === moveName;

          return (
            <button
              key={`${moveName}-${idx}`}
              onClick={() => onChooseMove(moveName)}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ccc",
                cursor: "pointer",
                textAlign: "left",
                background: isSelected ? "#e8f0ff" : "white",
                fontWeight: isSelected ? 700 : 400,
              }}
            >
              {moveName}
            </button>
          );
        })}
      </div>

      {calculatorAllowed ? (
        <>
          <button
            style={{ marginTop: 16, padding: "8px 12px", cursor: "pointer" }}
            onClick={() => onAnalyze(snapshot)}
          >
            Analyze snapshot
          </button>

          <p style={{ marginTop: 12, fontSize: 12, color: "#555" }}>
            In this phase, the calculator may be used before choosing.
          </p>
        </>
      ) : (
        <p style={{ marginTop: 12, fontSize: 12, color: "#555" }}>
          In this phase, the calculator is unavailable.
        </p>
      )}
    </section>
  );
}