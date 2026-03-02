/*
  ScenarioPanel is the battle state generator.

  It contains a hard coded snapshot.
  Clicking "Analyze snapshot" emits that object upward.

  Later:
  This will read from the real battle application state.
  It will dynamically construct the snapshot.
*/

export default function ScenarioPanel({ onAnalyze }) {

  // This object defines a complete battle snapshot.
  // It contains the minimum data needed for the calculator.

  // DEMO DATA
  const lockedSnapshot = {
    attackerName: "Alakazam",
    defenderName: "Lapras",
    defenderHpPercent: 100,
    moveNames: ["Cut", "Mega Kick", "Ice Beam", "Psybeam"],
  };

  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Scenario (Locked)</h2>

      <div style={{ fontSize: 14, lineHeight: 1.6 }}>
        <div><b>Attacker:</b> {lockedSnapshot.attackerName}</div>
        <div><b>Defender:</b> {lockedSnapshot.defenderName}</div>
        <div><b>Moves:</b> {lockedSnapshot.moveNames.join(", ")}</div>
      </div>

      <button
        style={{ marginTop: 12, padding: "8px 12px", cursor: "pointer" }}
        onClick={() => onAnalyze(lockedSnapshot)}
      >
        Analyze snapshot
      </button>

      <p style={{ marginTop: 12, fontSize: 12, color: "#555" }}>
        For now it just emits a snapshot object.
      </p>
    </section>
  );
}