const jwt = require("jsonwebtoken");

function readCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map(p => p.trim());
  for (const part of parts) {
    if (part.startsWith(name + "=")) return part.substring(name.length + 1);
  }
  return null;
}

exports.handler = async (event) => {
  try {
    const secret = process.env.SSO_JWT_SECRET;
    if (!secret) {
      return { statusCode: 500, body: JSON.stringify({ error: "MISSING_ENV_SECRET" }) };
    }

    const cookieHeader = event.headers.cookie || "";
    const sessionToken = readCookie(cookieHeader, "app_session");
    if (!sessionToken) {
      return { statusCode: 401, body: JSON.stringify({ error: "NO_SESSION" }) };
    }

    const decoded = jwt.verify(sessionToken, secret, {
      algorithms: ["HS256"],
      audience: "netlify-app",
      issuer: "netlify-app",
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: true,
        user: {
          id: decoded.sub,
          email: decoded.email || "",
          name
