// stores/theme.js
import { defineStore } from "pinia";
import { ref } from "vue";

export const useThemeStore = defineStore("theme", () => {
  const currentTheme = ref(localStorage.getItem("theme") || "light");

  function toggleTheme() {
    currentTheme.value = currentTheme.value === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", currentTheme.value);
    localStorage.setItem("theme", currentTheme.value);
  }

  // at the start, apply the theme based on the stored value
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", currentTheme.value);
  }

  return { currentTheme, toggleTheme, applyTheme };
});
