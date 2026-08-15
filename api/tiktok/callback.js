export default function handler(req, res) {
  res.status(200).json({
    status: "callback",
    message: "TikTok callback is ready!"
  });
}
