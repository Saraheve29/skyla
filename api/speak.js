export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { text, voiceId } = req.body;
  const KEY = "sk_032976f800904cea65184d02375073ebc528f0066def603e";

  const r = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + voiceId, {
    method: "POST",
    headers: { "Content-Type": "application/json", "xi-api-key": KEY },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 }
    })
  });

  if (!r.ok) return res.status(500).json({ error: "Voice failed" });

  const buffer = await r.arrayBuffer();
  res.setHeader("Content-Type", "audio/mpeg");
  res.send(Buffer.from(buffer));
}
