// i18n.js
import { createI18n } from "vue-i18n";

const messages = {
  en: {
    welcome: "Welcome",
    logout: "Logout",
  },
  ar: {
    welcome: "مرحبًا",
    logout: "تسجيل خروج",
  },
};

export const i18n = createI18n({
  locale: localStorage.getItem("locale") || "en",
  fallbackLocale: "en",
  legacy: false,
  globalInjection: true,
  messages,
});
