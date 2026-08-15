export default async function handler(req, res) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

  if (!clientKey || !clientSecret) {
    return res.status(500).json({
      error: "TikTok credentials are not configured"
    });
  }

  const { code, state, error, error_description } = req.query;

  if (error) {
    return res.status(400).json({
      error,
      error_description
    });
  }

  if (!code) {
    return res.status(400).json({
      error: "Missing authorization code"
    });
  }

  const redirectUri =
    "https://oqm-tiktok-server.vercel.app/api/tiktok/callback";

  try {
    const body = new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri
    });

    const response = await fetch(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "TikTok token exchange failed",
        details: data
      });
    }

    return res.status(200).json({
      status: "success",
      message: "TikTok connected successfully",
      open_id: data.open_id,
      scope: data.scope,
      token_type: data.token_type,
      expires_in: data.expires_in
    });

  } catch (err) {
    return res.status(500).json({
      error: "TikTok callback failed"
    });
  }
}
