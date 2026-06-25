import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";

export default getRequestConfig(async () => {
  let locale = "en";

  if (process.env.NODE_ENV !== "production") {
    const headersList = await headers();
    const acceptLanguage = headersList.get("Accept-Language");
    locale = acceptLanguage?.split(",")[0] || "en";
  }

  try {
    return {
      locale,
      messages: (await import(`../messages/${locale}.json`)).default,
    };
  } catch {
    return {
      locale,
      messages: (await import(`../messages/en.json`)).default,
    };
  }
});
