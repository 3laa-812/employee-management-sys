// src/stores/auth.js
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || "",
    activityLogs: JSON.parse(localStorage.getItem("activityLogs") || "[]"),
  }),
  actions: {
    async login(email, password) {
      if (email === "admin@example.com" && password === "123456") {
        const fakeToken = "dummy-token";
        const fakeUser = { name: "Admin User", role: "admin", email };

        this.token = fakeToken;
        this.user = fakeUser;

        localStorage.setItem("token", fakeToken);
        localStorage.setItem("user", JSON.stringify(fakeUser));

        this.addActivity("login");

        return true;
      }

      return false;
    },

    updateProfile(newData) {
      if (!this.user) return;

      if (newData.name && newData.name !== this.user.name) {
        this.addActivity("profile_update", "name");
      }
      if (newData.email && newData.email !== this.user.email) {
        this.addActivity("profile_update", "email");
      }

      this.user = { ...this.user, ...newData };
      localStorage.setItem("user", JSON.stringify(this.user));
    },

    addActivityLog(logEntry) {
      this.activityLogs.unshift(logEntry);
      localStorage.setItem("activityLogs", JSON.stringify(this.activityLogs));
    },

    logout() {
      this.token = "";
      this.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },

    loadUser() {
      const user = localStorage.getItem("user");
      if (user) this.user = JSON.parse(user);
    },

    addActivity(type, field = null) {
      const entry = {
        type,
        field,
        timestamp: new Date().toISOString(),
      };
      this.activityLogs.unshift(entry);
      localStorage.setItem("activityLogs", JSON.stringify(this.activityLogs));
    },
  },
});
