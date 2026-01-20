const jwt = require("jsonwebtoken");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { token } = JSON.parse(event.body || "{}");
    if (!token) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "MISSING_TOKEN" }),
      };
    }

    const SSO_JWT_SECRET = process.env.SSO_JWT_SECRET;
    const APP_SESSION_SECRET = process.env.APP_SESSION_SECRET || process.env.SSO_JWT_SECRET;

    if (!SSO_JWT_SECRET) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "MISSING_SSO_JWT_SECRET" }),
      };
    }
    if (!APP_SESSION_SECRET) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "MISSING_APP_SESSION_SECRET" }),
      };
    }

    // 1) Verify Wix-issued token (same as sso-exchange)
    const wixPayload = jwt.verify(token, SSO_JWT_SECRET, { audience: "netlify-app" });

    // 2) Create your session JWT (same payload as sso-exchange)
    const now = Math.floor(Date.now() / 1000);

    const sessionPayload = {
      sub: wixPayload.sub,
      email: wixPayload.email || "",
      name: wixPayload.name || "",
      tier: wixPayload.tier || "member",
      iat: now,
      exp: now + 60 * 60 * 24, // 24h
      iss: "netlify-app",
      aud: "netlify-app",
    };

    const sessionToken = jwt.sign(sessionPayload, APP_SESSION_SECRET, { algorithm: "HS256" });

    // Return token to mobile (NO COOKIE)
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: true,
        accessToken: sessionToken,
        tier: sessionPayload.tier,
        expiresIn: 60 * 60 * 24,
      }),
    };
  } catch (err) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: err.message }),
    };
  }
};
