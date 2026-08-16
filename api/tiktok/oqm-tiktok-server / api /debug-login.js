export default function handler(req, res) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;

  if (!clientKey) {
    return res.status(500).json({
      error: "TikTok client key is not configured"
    });
  }

  const redirectUri =
    "https://oqm-tiktok-server.vercel.app/api/tiktok/debug-token";

  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_key: clientKey,
    response_type: "code",
    scope: "user.info.basic,user.info.stats",
    redirect_uri: redirectUri,
    state: state
  });

  res.redirect(
    `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
  );
}
