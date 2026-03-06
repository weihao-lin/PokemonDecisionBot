import React from "react";
import { buildLookupMaps } from "../utils/buildLookupMaps.js";
import { computeExpectedDamagePctRange } from "../utils/damageFormula.js";

/**
 * useCalculator:
 * - Loads pokemon.json + moves.json once
 * - Builds lookup maps for O(1) resolution
 * - Resolves attacker/defender/moves from snapshot + moveNames
 * - Computes damage % range and accuracy % for each of the 4 moves
 *
 * This keeps all non-UI logic out of React components.
 */
export default function useCalculator({ snapshot, moveNames }) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [maps, setMaps] = React.useState(null);

  // Load datasets when the app starts
  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [pRes, mRes] = await Promise.all([
          fetch("/data/pokemon.json"),
          fetch("/data/moves.json"),
        ]);

        if (!pRes.ok) throw new Error("Failed to load public/data/pokemon.json");
        if (!mRes.ok) throw new Error("Failed to load public/data/moves.json");

        const pokemonData = await pRes.json();
        const movesData = await mRes.json();

        const lookupMaps = buildLookupMaps(pokemonData, movesData);

        if (!cancelled) setMaps(lookupMaps);
      } catch (e) {
        if (!cancelled) setError(String(e?.message ?? e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Resolve attacker/defender from the snapshot once maps exist
  const resolved = React.useMemo(() => {
    if (!snapshot || !maps) return null;

    const attacker = maps.pokemonByName.get(norm(snapshot.attackerName));
    const defender = maps.pokemonByName.get(norm(snapshot.defenderName));

    return { attacker, defender };
  }, [snapshot, maps]);

  // Compute 4 results (stable UI)
  const results = React.useMemo(() => {
    const safeInputs = normalizeMoveInputs(moveNames);

    // If not ready, return placeholders (still 4 slots)
    if (!snapshot || !maps) {
      return safeInputs.map((inputName) => ({ inputName }));
    }

    const attacker = resolved?.attacker;
    const defender = resolved?.defender;

    return safeInputs.map((inputName) => {
      if (!inputName.trim()) return { inputName, warning: "No move entered." };
      if (!attacker) return { inputName, warning: "Attacker not found in dataset." };
      if (!defender) return { inputName, warning: "Defender not found in dataset." };

      const move = maps.moveByName.get(norm(inputName));
      if (!move) return { inputName, warning: "Move not found in dataset." };

      const power = toNumber(move.power);
      const accuracy = parseAccuracy(move.accuracy);

      if (!Number.isFinite(power) || power <= 0) {
        return { inputName, move, warning: "Move has no numeric power (likely non-damaging)." };
      }
      if (!Number.isFinite(accuracy)) {
        return { inputName, move, warning: "Move has invalid accuracy." };
      }

      const { minPct, maxPct } = computeExpectedDamagePctRange({ attacker, defender, move, power });

      return {
        inputName,
        move,
        damagePctRange: `${minPct.toFixed(1)}% – ${maxPct.toFixed(1)}%`,
        accuracyPct: `${accuracy.toFixed(0)}%`,
      };
    });
  }, [snapshot, maps, resolved, moveNames]);

  return { loading, error, resolved, results };
}

function norm(s) {
  return String(s ?? "").trim().toLowerCase();
}

function normalizeMoveInputs(moveNames) {
  const arr = Array.isArray(moveNames) ? moveNames.slice(0, 4) : [];
  while (arr.length < 4) arr.push("");
  return arr.map((x) => String(x ?? ""));
}

function toNumber(x) {
  const n = typeof x === "number" ? x : Number(String(x ?? "").trim());
  return Number.isFinite(n) ? n : NaN;
}

function parseAccuracy(acc) {
  // Supports number (70) or string ("70%" or "70")
  if (typeof acc === "number") return acc;
  const s = String(acc ?? "").trim().replace("%", "");
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}