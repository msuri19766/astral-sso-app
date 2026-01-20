exports.handler = async (event) => {
  // Deep link back into the app (your app.json scheme + host=auth)
  // In Expo Go, redirect might be different, but we'll start with scheme deep link.
  const deepLink = "astralalgomobile://auth";

  // Send the user to the SAME web app that already does Wix SSO
  // but with a flag so app.html knows to finish by redirecting to deepLink
  const url =
    `https://astral-sso-app.netlify.app/app.html` +
    `?mobile=1` +
    `&redirect_uri=${encodeURIComponent(deepLink)}`;

  return {
    statusCode: 302,
    headers: { Location: url },
  };
};
