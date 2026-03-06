import React from "react";
import CalculatorPanel from "./components/CalculatorPanel.jsx";
import TrialPanel from "./components/TrialPanel.jsx";
import ResponseSummary from "./components/ResponseSummary.jsx";
import { PRESETS } from "./data/presets.js";
import { exportResponsesCSV } from "./utils/exportCSV.js";

/**
 * Main ideas:
 * - Trials are shown in the exact order of PRESETS.
 * - After a move is chosen, that response is stored.
 * - A "Next Trial" button advances to the next preset.
 * - After the final preset, a summary screen is shown.
 */

export default function App() {
  const [currentTrialIndex, setCurrentTrialIndex] = React.useState(0);
  const [snapshot, setSnapshot] = React.useState(null);
  const [responses, setResponses] = React.useState([]);
  const [selectedMove, setSelectedMove] = React.useState("");
  const [showCalculator, setShowCalculator] = React.useState(false);
  const [hasAnsweredCurrentTrial, setHasAnsweredCurrentTrial] = React.useState(false);
  const [isFinished, setIsFinished] = React.useState(false);

  const currentPreset = PRESETS[currentTrialIndex];
  const calculatorAllowed = currentPreset?.phase === 2;

  /**
   * Load the current trial into the calculator.
   * Only used in phase 2.
   */
  function handleAnalyze(snapshotObj) {
    setSnapshot(snapshotObj);
    setShowCalculator(true);
  }

  /**
   * Record the participant's move choice for the current trial.
   * If they change their mind before advancing, overwrite the same trial response.
   */
  function handleChooseMove(moveName) {
    if (!currentPreset) return;

    setSelectedMove(moveName);
    setHasAnsweredCurrentTrial(true);

    const response = {
      trialId: currentPreset.id,
      phase: currentPreset.phase,
      goal: currentPreset.goal,
      attackerName: currentPreset.attackerName,
      defenderName: currentPreset.defenderName,
      chosenMove: moveName,
      usedCalculator: showCalculator,
      timestamp: Date.now(),
    };

    setResponses((prev) => {
      const withoutCurrentTrial = prev.filter((r) => r.trialId !== currentPreset.id);
      return [...withoutCurrentTrial, response];
    });
  }

  /**
   * Advance to the next trial in the fixed sequence.
   * If this was the last trial, end the experiment.
   */
  function handleNextTrial() {
    const nextIndex = currentTrialIndex + 1;

    if (nextIndex >= PRESETS.length) {
      setIsFinished(true);
      return;
    }

    setCurrentTrialIndex(nextIndex);
    setSnapshot(null);
    setSelectedMove("");
    setShowCalculator(false);
    setHasAnsweredCurrentTrial(false);
  }

  if (isFinished) {
    return (
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: 16,
          fontFamily: "system-ui, Arial",
        }}
      >
        <h1 style={{ marginTop: 0 }}>Experiment Complete</h1>

        <p>All trials have been completed.</p>

        <button
          onClick={() => exportResponsesCSV(responses)}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #ccc",
            cursor: "pointer",
            marginBottom: 20
          }}
        >
          Download CSV
        </button>

        <ResponseSummary responses={responses} />
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: 16,
        fontFamily: "system-ui, Arial",
      }}
    >
      <h1 style={{ marginTop: 0 }}>Pokémon Damage Calculator Experiment</h1>

      <div
        style={{
          marginBottom: 16,
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 12,
          background: "#fafafa",
        }}
      >
        <div>
          <b>Trial:</b> {currentTrialIndex + 1} / {PRESETS.length}
        </div>
        <div>
          <b>Phase:</b> {calculatorAllowed ? "Calculator Allowed" : "No Calculator"}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <TrialPanel
          snapshot={currentPreset}
          onAnalyze={handleAnalyze}
          onChooseMove={handleChooseMove}
          selectedMove={selectedMove}
        />

        {calculatorAllowed ? (
          showCalculator ? (
            <CalculatorPanel snapshot={snapshot} />
          ) : (
            <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
              <h2 style={{ marginTop: 0 }}>Calculator</h2>
              <p>Press <b>Analyze snapshot</b> to use the calculator for this trial.</p>
            </section>
          )
        ) : (
          <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
            <h2 style={{ marginTop: 0 }}>Calculator</h2>
            <p>This trial is in the no-calculator phase.</p>
          </section>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          onClick={handleNextTrial}
          disabled={!hasAnsweredCurrentTrial}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #ccc",
            cursor: hasAnsweredCurrentTrial ? "pointer" : "not-allowed",
            opacity: hasAnsweredCurrentTrial ? 1 : 0.5,
          }}
        >
          {currentTrialIndex === PRESETS.length - 1 ? "Finish Experiment" : "Next Trial"}
        </button>
      </div>
    </div>
  );
}