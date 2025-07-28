import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { i18n } from "./i18n";
import { useThemeStore } from "./stores/theme";
import "./style.css"; // Import global styles

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(i18n);

// Apply theme immediately
const themeStore = useThemeStore();
themeStore.applyTheme();

app.mount("#app");
