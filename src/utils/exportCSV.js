/**
 * Converts the responses array into CSV format
 * and triggers a download in the browser.
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
    r.usedCalculator,
    new Date(r.timestamp).toISOString()
  ]);

  const csvContent =
    [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "pokemon_experiment_responses.csv";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}