exports.handler = async () => {
  const deepLink = "astralalgomobile://auth";

  // Try WITH www
  const WIX_SITE = "https://www.astralastrologer.com";

  const wixBridgeUrl =
    `${WIX_SITE}/sso-bridge?mobile=1&redirect_uri=${encodeURIComponent(deepLink)}`;

  return { statusCode: 302, headers: { Location: wixBridgeUrl } };
};
