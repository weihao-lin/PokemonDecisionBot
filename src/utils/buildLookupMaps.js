/**
 * buildLookupMaps:
 * Turns dataset arrays into lookup maps for fast resolution.
 *
 * Maps allow O(1) lookups by normalized name or id.
 */
export function buildLookupMaps(pokemonData, movesData) {
  const pokemonByName = new Map();
  const pokemonById = new Map();

  for (const p of pokemonData ?? []) {
    if (!p) continue;
    if (p.id != null) pokemonById.set(String(p.id), p);
    if (p.name) pokemonByName.set(norm(p.name), p);
  }

  const moveByName = new Map();
  const moveById = new Map();

  for (const m of movesData ?? []) {
    if (!m) continue;
    if (m.id != null) moveById.set(String(m.id), m);
    if (m.name) moveByName.set(norm(m.name), m);
  }

  return { pokemonByName, pokemonById, moveByName, moveById };
}

function norm(s) {
  return String(s ?? "").trim().toLowerCase();
}