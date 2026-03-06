import React from "react";

/**
 * Minimal post-trial feedback.
 * Shows only the chosen move and one realized damage outcome.
 */
export default function TrialResultFeedback({ response }) {
  if (!response) return null;

  return (
    <section
      style={{
        marginTop: 16,
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 12,
        background: "#fafafa",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>Trial Feedback</h3>

      <div style={{ fontSize: 14, lineHeight: 1.7 }}>
        <div><b>Chosen move:</b> {response.chosenMove}</div>
        <div><b>Damage dealt:</b> {response.damageDealtPct ?? "0.0%"} </div>
      </div>
    </section>
  );
}
