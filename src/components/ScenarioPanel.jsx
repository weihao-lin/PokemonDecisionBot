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
    <section>
      <h2>Scenario (Locked)</h2>

      <div>
        <div><b>Attacker:</b> {lockedSnapshot.attackerName}</div>
        <div><b>Defender:</b> {lockedSnapshot.defenderName}</div>
        <div><b>Moves:</b> {lockedSnapshot.moveNames.join(", ")}</div>
      </div>

      {/* 
        The entire battle state is sent upward in one object.
      */}
      <button onClick={() => onAnalyze(lockedSnapshot)}>
        Analyze snapshot
      </button>
    </section>
  );
}
