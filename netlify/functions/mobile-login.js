exports.handler = async () => {
  const deepLink = "astralalgomobile://auth";

  const url =
    "https://astral-sso-app.netlify.app/sso.html" +
    `?mobile=1&redirect_uri=${encodeURIComponent(deepLink)}`;

  return {
    statusCode: 302,
    headers: { Location: url },
  };
};
