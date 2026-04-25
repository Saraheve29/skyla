export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Parse body manually since we are not using Next.js
  let body = "";
  await new Promise((resolve) => {
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", resolve);
  });

  let text, voiceId;
  try {
    const parsed = JSON.parse(body);
    text = parsed.text;
    voiceId = parsed.voiceId;
  } catch(e) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  if (!text || !voiceId) return res.status(400).json({ error: "Missing text or voiceId" });

  const KEY = "sk_032976f800904cea65184d02375073ebc528f0066def603e";

  try {
    const r = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + voiceId, {
      method: "POST",
      headers: { "Content-Type": "application/json", "xi-api-key": KEY },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });

    if (!r.ok) {
      const err = await r.text();
      return res.status(500).json({ error: err });
    }

    const buffer = await r.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.status(200).send(Buffer.from(buffer));

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
