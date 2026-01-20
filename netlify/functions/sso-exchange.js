const jwt = require("jsonwebtoken");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { token } = JSON.parse(event.body || "{}");
    if (!token) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: "MISSING_TOKEN" }) };
    }

    const SSO_JWT_SECRET = process.env.SSO_JWT_SECRET;
    const APP_SESSION_SECRET = process.env.APP_SESSION_SECRET || process.env.SSO_JWT_SECRET;

    if (!SSO_JWT_SECRET) {
      return { statusCode: 500, body: JSON.stringify({ ok: false, error: "MISSING_SSO_JWT_SECRET" }) };
    }
    if (!APP_SESSION_SECRET) {
      return { statusCode: 500, body: JSON.stringify({ ok: false, error: "MISSING_APP_SESSION_SECRET" }) };
    }

    // 1) Verify the Wix-issued token (this one should contain tier)
    const wixPayload = jwt.verify(token, SSO_JWT_SECRET, { audience: "netlify-app" });

    // 2) Create the Netlify session token (COPY tier INTO THIS TOKEN)
    const now = Math.floor(Date.now() / 1000);

    const sessionPayload = {
      sub: wixPayload.sub,
      email: wixPayload.email || "",
      name: wixPayload.name || "",
      tier: wixPayload.tier || "member",   // ✅ IMPORTANT LINE
      iat: now,
      exp: now + 60 * 60 * 24,             // 24h session
      iss: "netlify-app",
      aud: "netlify-app"
    };

    const sessionToken = jwt.sign(sessionPayload, APP_SESSION_SECRET, { algorithm: "HS256" });

    // Cookie settings (works on https)
    const cookie =
      `app_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24}`;

    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": cookie,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: err.message })
    };
  }
};
