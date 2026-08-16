export default async function handler(req, res) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

  if (!clientKey || !clientSecret) {
    return res.status(500).json({
      error: "TikTok credentials are not configured"
    });
  }

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      error: "Missing authorization code"
    });
  }

  const redirectUri =
    "https://oqm-tiktok-server.vercel.app/api/tiktok/callback";

  try {
    const tokenBody = new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri
    });

    const tokenResponse = await fetch(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: tokenBody
      }
    );

    const tokenData = await tokenResponse.json();

    return res.status(200).json({
      http_status: tokenResponse.status,
      tiktok_response: {
        ...tokenData,
        access_token: tokenData.access_token ? "[PRESENT]" : null,
        refresh_token: tokenData.refresh_token ? "[PRESENT]" : null
      }
    });

  } catch (err) {
    return res.status(500).json({
      error: "Debug token exchange failed",
      message: err.message
    });
  }
}
