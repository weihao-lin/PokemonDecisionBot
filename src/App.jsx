import React from "react";
import CalculatorPanel from "./components/CalculatorPanel.jsx";
import TrialPanel from "./components/TrialPanel.jsx";
import ResponseSummary from "./components/ResponseSummary.jsx";
import TrialResultFeedback from "./components/TrialResultFeedback.jsx";
import { PRESETS } from "./data/presets.js";
import { buildLookupMaps } from "./utils/buildLookupMaps.js";
import { simulateMoveOutcomePct } from "./utils/damageFormula.js";
import { exportResponsesCSV } from "./utils/exportCSV.js";
import { sendTrialResult } from "./utils/sendToGoogleSheets.js";

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
  const [hasAnsweredCurrentTrial, setHasAnsweredCurrentTrial] = React.useState(false);
  const [isFinished, setIsFinished] = React.useState(false);
  const [maps, setMaps] = React.useState(null);

  const currentPreset = PRESETS[currentTrialIndex];
  const calculatorAllowed = currentPreset?.phase === 2;

  React.useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [pRes, mRes] = await Promise.all([
          fetch("/data/pokemon.json"),
          fetch("/data/moves.json"),
        ]);

        if (!pRes.ok) throw new Error("Failed to load pokemon.json");
        if (!mRes.ok) throw new Error("Failed to load moves.json");

        const pokemonData = await pRes.json();
        const movesData = await mRes.json();

        const lookupMaps = buildLookupMaps(pokemonData, movesData);

        if (!cancelled) {
          setMaps(lookupMaps);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleAnalyze(snapshotObj) {
    setSnapshot(snapshotObj);
    setShowCalculator(true);
  }

  function handleChooseMove(moveName) {
    if (!currentPreset) return;

    setSelectedMove(moveName);
    setHasAnsweredCurrentTrial(true);

    let damageDealtPct = "0.0%";

    if (maps) {
      const attacker = maps.pokemonByName.get(norm(currentPreset.attackerName));
      const defender = maps.pokemonByName.get(norm(currentPreset.defenderName));
      const move = maps.moveByName.get(norm(moveName));

      if (attacker && defender && move) {
        const power = toNumber(move.power);
        const accuracy = parseAccuracy(move.accuracy);

        if (Number.isFinite(power) && power > 0 && Number.isFinite(accuracy)) {
          const outcome = simulateMoveOutcomePct({
            attacker,
            defender,
            move,
            power,
            accuracy,
          });

          damageDealtPct = `${outcome.damagePct.toFixed(1)}%`;
        }
      }
    }

    const response = {
      trialId: currentPreset.id,
      phase: currentPreset.phase,
      goal: currentPreset.goal,
      attackerName: currentPreset.attackerName,
      defenderName: currentPreset.defenderName,
      chosenMove: moveName,
      damageDealtPct,
      timestamp: Date.now(),
    };

    sendTrialResult(response);

    setResponses((prev) => {
      const withoutCurrentTrial = prev.filter((r) => r.trialId !== currentPreset.id);
      return [...withoutCurrentTrial, response];
    });
  }

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

  const currentResponse =
    responses.find((r) => String(r.trialId) === String(currentPreset?.id)) ?? null;

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
            marginBottom: 20,
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
        <div>
          <TrialPanel
            snapshot={currentPreset}
            onAnalyze={handleAnalyze}
            onChooseMove={handleChooseMove}
            selectedMove={selectedMove}
          />

          {hasAnsweredCurrentTrial && (
            <TrialResultFeedback response={currentResponse} />
          )}
        </div>

        {calculatorAllowed ? (
          <CalculatorPanel snapshot={currentPreset} />
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

function norm(s) {
  return String(s ?? "").trim().toLowerCase();
}

function toNumber(x) {
  const n = typeof x === "number" ? x : Number(String(x ?? "").trim());
  return Number.isFinite(n) ? n : NaN;
}

function parseAccuracy(acc) {
  if (typeof acc === "number") return acc;
  const s = String(acc ?? "").trim().replace("%", "");
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}
