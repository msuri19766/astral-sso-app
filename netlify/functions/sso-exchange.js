const jwt = require("jsonwebtoken");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const secret = process.env.SSO_JWT_SECRET;
    if (!secret) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "MISSING_ENV_SECRET" }),
      };
    }

    const body = JSON.parse(event.body || "{}");
    const token = body.token;

    if (!token) {
      return { statusCode: 400, body: JSON.stringify({ error: "MISSING_TOKEN" }) };
    }

    // 1) Verify the short-lived token issued by Wix
    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
      audience: "netlify-app",
      issuer: "wix",
    });

    // 2) Create a session token for your app (valid longer)
    const now = Math.floor(Date.now() / 1000);
    const sessionPayload = {
      sub: decoded.sub,
      email: decoded.email || "",
      name: decoded.name || "",
      iat: now,
      exp: now + 60 * 60 * 12, // 12 hours
      iss: "netlify-app",
      aud: "netlify-app",
    };

    const sessionToken = jwt.sign(sessionPayload, secret, { algorithm: "HS256" });

    // 3) Set cookie (HttpOnly prevents JS access)
    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": `app_session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ok: true }),
    };
  } catch (e) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "INVALID_TOKEN", detail: e.message }),
    };
  }
};
