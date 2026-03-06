export async function sendTrialResult(result) {
  const url = "https://script.google.com/macros/s/AKfycbwhF_iD_cfouES8m1eVfyD-hK7sGN3of3QFzxZ94mwyVBT6NJ9SrPngr3QcsqtX3bH4/exec";

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(result)
    });
  } catch (err) {
    console.error("Failed to send result:", err);
  }
}