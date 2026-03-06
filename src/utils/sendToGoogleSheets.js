export async function sendTrialResult(result) {
  const url = "https://script.google.com/macros/s/AKfycbwhF_iD_cfouES8m1eVfyD-hK7sGN3of3QFzxZ94mwyVBT6NJ9SrPngr3QcsqtX3bH4/exec";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(result),
  });

  if (!response.ok) {
    throw new Error(`Google Sheets request failed with status ${response.status}`);
  }

  return response.text();
}