export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

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
  const GIRL_ID = "PoHUWWWMHFrA8z7Q88pu";
  const BOY_ID = "MYiFAKeVwcvm4z9VsFAR";

  // Girl: upbeat and lively
  // Boy: stable and deep so he sounds masculine
  const voiceSettings = voiceId === GIRL_ID
    ? { stability: 0.10, similarity_boost: 0.95, style: 1.0, use_speaker_boost: true }
    : { stability: 0.65, similarity_boost: 0.95, style: 0.45, use_speaker_boost: true };

  try {
    const r = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + voiceId, {
      method: "POST",
      headers: { "Content-Type": "application/json", "xi-api-key": KEY },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: voiceSettings
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
