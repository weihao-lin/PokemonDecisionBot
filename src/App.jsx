import React from "react";
import CalculatorPanel from "./components/CalculatorPanel.jsx";
import TrialPanel from "./components/TrialPanel.jsx";
import ResponseSummary from "./components/ResponseSummary.jsx";
import TrialResultFeedback from "./components/TrialResultFeedback.jsx";
import { PRESETS } from "./data/presets.js";
import { buildLookupMaps } from "./utils/buildLookupMaps.js";
import { simulateMoveOutcomePct } from "./utils/damageFormula.js";
import { sendTrialResult } from "./utils/sendToGoogleSheets.js";

export default function App() {
  const [currentTrialIndex, setCurrentTrialIndex] = React.useState(0);
  const [responses, setResponses] = React.useState([]);
  const [selectedMove, setSelectedMove] = React.useState("");
  const [lockedResponse, setLockedResponse] = React.useState(null);
  const [isFinished, setIsFinished] = React.useState(false);
  const [maps, setMaps] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  function handleChooseMove(moveName) {
    if (lockedResponse) return;
    setSelectedMove(moveName);
  }

  async function handleLockInMove() {
    if (!currentPreset || !selectedMove || !maps || lockedResponse || isSubmitting) return;

    setIsSubmitting(true);

    let damageDealtPct = "0.0%";

    const attacker = maps.pokemonByName.get(norm(currentPreset.attackerName));
    const defender = maps.pokemonByName.get(norm(currentPreset.defenderName));
    const move = maps.moveByName.get(norm(selectedMove));

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

    const response = {
      trialId: currentPreset.id,
      phase: currentPreset.phase,
      goal: currentPreset.goal,
      attackerName: currentPreset.attackerName,
      defenderName: currentPreset.defenderName,
      chosenMove: selectedMove,
      damageDealtPct,
      timestamp: Date.now(),
    };

    try {
      await sendTrialResult(response);
      setLockedResponse(response);
      setResponses((prev) => [...prev, response]);
    } catch (err) {
      console.error("Failed to send trial result:", err);
      alert("Failed to save this trial to Google Sheets.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleNextTrial() {
    if (!lockedResponse) return;

    const nextIndex = currentTrialIndex + 1;

    if (nextIndex >= PRESETS.length) {
      setIsFinished(true);
      return;
    }

    setCurrentTrialIndex(nextIndex);
    setSelectedMove("");
    setLockedResponse(null);
    setIsSubmitting(false);
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
            onChooseMove={handleChooseMove}
            selectedMove={selectedMove}
            isLocked={Boolean(lockedResponse)}
            isSubmitting={isSubmitting}
          />

          {lockedResponse && <TrialResultFeedback response={lockedResponse} />}
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

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        {!lockedResponse ? (
          <button
            onClick={handleLockInMove}
            disabled={!selectedMove || isSubmitting}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #ccc",
              cursor: !selectedMove || isSubmitting ? "not-allowed" : "pointer",
              opacity: !selectedMove || isSubmitting ? 0.5 : 1,
            }}
          >
            {isSubmitting ? "Saving..." : "Lock In Move"}
          </button>
        ) : (
          <button
            onClick={handleNextTrial}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            {currentTrialIndex === PRESETS.length - 1 ? "Finish Experiment" : "Next Trial"}
          </button>
        )}
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