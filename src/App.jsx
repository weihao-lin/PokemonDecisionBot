import React from "react";
import ScenarioPanel from "./components/ScenarioPanel.jsx";
import CalculatorPanel from "./components/CalculatorPanel.jsx";

/*
  Top level wiring

  Owns the canonical battle snapshot state,
  Provides a way for the ScenarioPanel to update the snapshot,
  Passes the snapshot down to CalculatorPanel.

  Scenario building and damage calculation are
  logically separated, but connected through controlled state.
*/

export default function App() {
  // Truth for the current battle snapshot.
  // No calculation when null.
  const [snapshot, setSnapshot] = React.useState(null);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <h1>Pokemon Damage Calculator</h1>

      {/* Two column layout:
        Left: scenario builder
        Right: calculator
      */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* ScenarioPanel creates a snapshot object */}
        <ScenarioPanel onAnalyze={setSnapshot} />

        {/* CalculatorPanel takes the snapshot and computes results */}
        <CalculatorPanel snapshot={snapshot} />
      </div>
    </div>
  );
}