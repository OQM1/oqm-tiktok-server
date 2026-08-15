export default async function handler(req, res) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

  if (!clientKey || !clientSecret) {
    return res.status(500).json({
      error: "TikTok credentials are not configured"
    });
  }

  const { code, error, error_description } = req.query;

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
    // Échange du code contre un access token
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

    if (!tokenResponse.ok) {
      return res.status(tokenResponse.status).json({
        error: "TikTok token exchange failed",
        details: tokenData
      });
    }

    const accessToken = tokenData.access_token;

    // Récupération du nombre de publications
    const userResponse = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,video_count",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      return res.status(userResponse.status).json({
        error: "TikTok user info failed",
        details: userData
      });
    }

    return res.status(200).json({
      status: "success",
      message: "TikTok connected successfully",
      open_id: userData.data?.user?.open_id,
      display_name: userData.data?.user?.display_name,
      video_count: userData.data?.user?.video_count ?? 0
    });

  } catch (err) {
    return res.status(500).json({
      error: "TikTok callback failed"
    });
  }
}
