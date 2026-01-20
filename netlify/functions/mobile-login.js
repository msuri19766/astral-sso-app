exports.handler = async () => {
  const deepLink = "astralalgomobile://auth";

  // IMPORTANT: This must be your Wix site domain:
  const WIX_SITE = "https://astralastrologer.com";

  const wixBridgeUrl =
    `${WIX_SITE}/sso-bridge` +
    `?mobile=1&redirect_uri=${encodeURIComponent(deepLink)}`;

  return {
    statusCode: 302,
    headers: { Location: wixBridgeUrl },
  };
};
