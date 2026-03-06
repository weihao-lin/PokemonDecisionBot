/**
 * Damage model:
 * - Uses BASE stats directly (Atk/Def/SpA/SpD/HP)
 * - No user controlled Level, but we MUST use a constant internal level because
 *   the canonical damage formula includes Level. We keep it hidden.
 *
 * Includes:
 * ✅ Random factor (0.85–1.00)
 * ✅ STAB
 * ✅ Type effectiveness
 * ✅ Crit
 *
 * Excludes:
 * ❌ status
 * ❌ weather
 * ❌ abilities
 * ❌ items
 * ❌ terrain
 * ❌ screens
 */

const INTERNAL_LEVEL = 50;
const CRIT_MULT = 1.5;
const CRIT_CHANCE = 1 / 24;

/**
 * Existing range-based function for the calculator.
 * This can stay for your calculator UI.
 */
export function computeExpectedDamagePctRange({
  attacker,
  defender,
  move,
  power,
  critChance = CRIT_CHANCE,
}) {
  const p = clamp(critChance, 0, 1);

  const normal = computeDamagePctRange({
    attacker,
    defender,
    move,
    power,
    crit: false,
    randomFactor: 0.85,
  });

  const normalMax = computeDamagePctRange({
    attacker,
    defender,
    move,
    power,
    crit: false,
    randomFactor: 1.0,
  });

  const critMin = computeDamagePctRange({
    attacker,
    defender,
    move,
    power,
    crit: true,
    randomFactor: 0.85,
  });

  const critMax = computeDamagePctRange({
    attacker,
    defender,
    move,
    power,
    crit: true,
    randomFactor: 1.0,
  });

  const expMin = (1 - p) * normal.minPct + p * critMin.minPct;
  const expMax = (1 - p) * normalMax.maxPct + p * critMax.maxPct;

  return {
    minPct: expMin,
    maxPct: expMax,
  };
}

/**
 * Core damage calculation for a fixed crit state and fixed random factor.
 */
export function computeDamagePctRange({
  attacker,
  defender,
  move,
  power,
  crit = false,
  randomFactor = 1.0,
}) {
  const aBase = attacker?.base ?? {};
  const dBase = defender?.base ?? {};

  const isPhysical = norm(move?.category) === "physical";
  const A = isPhysical ? num(aBase["Attack"]) : num(aBase["Sp. Attack"]);
  const D = isPhysical ? num(dBase["Defense"]) : num(dBase["Sp. Defense"]);
  const hp = Math.max(1, num(dBase["HP"]));

  const levelFactor = Math.floor((2 * INTERNAL_LEVEL) / 5) + 2;
  const base1 = Math.floor((levelFactor * power * A) / Math.max(1, D));
  const base2 = Math.floor(base1 / 50);
  const baseDamage = base2 + 2;

  const stab = computeSTAB(attacker, move);
  const typeEff = computeTypeEffectiveness(move, defender);
  const critMult = crit ? CRIT_MULT : 1.0;

  if (typeEff === 0) {
    return { minPct: 0, maxPct: 0 };
  }

  const damage = Math.floor(baseDamage * stab * typeEff * critMult * randomFactor);
  const pct = (damage / hp) * 100;

  return {
    minPct: pct,
    maxPct: pct,
  };
}

/**
 * NEW:
 * Simulates one actual move outcome.
 *
 * Steps:
 * 1. Accuracy roll
 * 2. Crit roll
 * 3. Random damage roll
 * 4. Return one realized damage %
 */
export function simulateMoveOutcomePct({
  attacker,
  defender,
  move,
  power,
  accuracy,
  critChance = CRIT_CHANCE,
}) {
  const acc = clamp(accuracy / 100, 0, 1);

  // Accuracy roll
  const hitRoll = Math.random();
  const hit = hitRoll < acc;

  if (!hit) {
    return {
      hit: false,
      crit: false,
      damagePct: 0,
    };
  }

  // Crit roll
  const crit = Math.random() < critChance;

  // Random damage roll between 0.85 and 1.00
  const randomFactor = 0.85 + Math.random() * 0.15;

  const result = computeDamagePctRange({
    attacker,
    defender,
    move,
    power,
    crit,
    randomFactor,
  });

  return {
    hit: true,
    crit,
    damagePct: result.minPct,
  };
}

function computeSTAB(attacker, move) {
  const moveType = norm(move?.type);
  const attackerTypes = (attacker?.type ?? []).map(norm);
  return attackerTypes.includes(moveType) ? 1.5 : 1.0;
}

function computeTypeEffectiveness(move, defender) {
  const atkType = norm(move?.type);
  const defTypes = (defender?.type ?? []).map(norm);

  let mult = 1.0;
  for (const dt of defTypes) {
    mult *= getTypeMultiplier(atkType, dt);
    if (mult === 0) return 0;
  }
  return mult;
}

function getTypeMultiplier(atk, def) {
  const row = TYPE_CHART[atk];
  if (!row) return 1.0;
  const v = row[def];
  return v == null ? 1.0 : v;
}

const TYPE_CHART = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, rock: 2, dark: 2, steel: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, ghost: 0, fairy: 0.5 },
  poison: { grass: 2, fairy: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0 },
  ground: { fire: 2, electric: 2, poison: 2, rock: 2, steel: 2, grass: 0.5, bug: 0.5, flying: 0 },
  flying: { grass: 2, fighting: 2, bug: 2, electric: 0.5, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, steel: 0.5, dark: 0 },
  bug: { grass: 2, psychic: 2, dark: 2, fire: 0.5, fighting: 0.5, poison: 0.5, flying: 0.5, ghost: 0.5, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, flying: 2, bug: 2, fighting: 0.5, ground: 0.5, steel: 0.5 },
  ghost: { psychic: 2, ghost: 2, dark: 0.5, normal: 0 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { psychic: 2, ghost: 2, fighting: 0.5, dark: 0.5, fairy: 0.5 },
  steel: { ice: 2, rock: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, steel: 0.5 },
  fairy: { fighting: 2, dragon: 2, dark: 2, fire: 0.5, poison: 0.5, steel: 0.5 },
};

function norm(s) {
  return String(s ?? "").trim().toLowerCase();
}

function num(x) {
  const n = typeof x === "number" ? x : Number(String(x ?? "").trim());
  return Number.isFinite(n) ? n : 0;
}

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}
