"use client";

import { NextIntlClientProvider } from "next-intl";
import { ReactNode, useEffect, useState } from "react";

interface LocaleProviderProps {
  children: ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [messages, setMessages] = useState<Record<string, any> | null>(null);
  const [locale, setLocale] = useState<string>("en");

  useEffect(() => {
    console.log("LocaleProvider useEffect running");
    async function loadMessages() {
      console.log("loadMessages called");
      // Detect locale from browser
      const browserLocale = navigator.language;
      console.log("browserLocale:", browserLocale);
      const supportedLocales = ["en", "pt-BR"];
      const detectedLocale = supportedLocales.includes(browserLocale)
        ? browserLocale
        : "en";
      console.log("detectedLocale:", detectedLocale);

      try {
        // Dynamically import the messages
        const messagesModule = await import(
          `../../messages/${detectedLocale}.json`
        );
        console.log("Messages loaded:", detectedLocale);
        setMessages(messagesModule.default);
        setLocale(detectedLocale);
      } catch (error) {
        console.error("Error loading messages:", error);
        // Fallback to English if locale not found
        const enMessages = await import("../../messages/en.json");
        setMessages(enMessages.default);
        setLocale("en");
      }
    }

    loadMessages();
  }, []);

  if (!messages) {
    // Show loading state while messages are loading
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
