/**
 * Converts experiment responses to CSV
 * and downloads the file in the browser.
 */
export function exportResponsesCSV(responses) {
  if (!responses || responses.length === 0) {
    alert("No responses to export.");
    return;
  }

  const headers = [
    "trialId",
    "phase",
    "goal",
    "attackerName",
    "defenderName",
    "chosenMove",
    "damageDealtPct",
    "usedCalculator",
    "timestamp"
  ];

  const rows = responses.map((r) => [
    r.trialId,
    r.phase,
    r.goal,
    r.attackerName,
    r.defenderName,
    r.chosenMove,
    r.damageDealtPct ?? "",
    r.usedCalculator,
    new Date(r.timestamp).toISOString()
  ]);

  const csvContent =
    [headers, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;

  // timestamped filename so multiple runs don't overwrite
  const time = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  link.download = `pokemon_experiment_${time}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
