import React from "react";

/**
 * Shows all recorded responses at the bottom of the app.
 */
export default function ResponseSummary({ responses }) {
  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Responses</h2>

      {responses.length === 0 ? (
        <p>No responses recorded yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {responses.map((r, idx) => (
            <div
              key={`${r.trialId}-${idx}`}
              style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}
            >
              <div><b>Trial:</b> {r.trialId}</div>
              <div><b>Phase:</b> {r.phase}</div>
              <div><b>Goal:</b> {r.goal}</div>
              <div><b>Attacker:</b> {r.attackerName}</div>
              <div><b>Defender:</b> {r.defenderName}</div>
              <div><b>Chosen Move:</b> {r.chosenMove}</div>
              <div><b>Timestamp:</b> {new Date(r.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

}
