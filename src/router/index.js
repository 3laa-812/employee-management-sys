import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/Login.vue";
import Dashboard from "../pages/Dashboard.vue";
import Companies from "../pages/Companies.vue";
import Departments from "../pages/Departments.vue";
import Employees from "../pages/Employees.vue";
import Reports from "../pages/Reports.vue";
import Admin from "../pages/Admin.vue";
import { useAuthStore } from "../stores/auth";
import EmployeeWizard from "../pages/EmployeeWizard.vue";
import EmployeeTimeline from "../pages/EmployeeTimeline.vue";
import Profile from "../pages/Profile.vue";
import ForgotPassword from "../pages/ForgotPassword.vue";
import ResetPassword from "../pages/ResetPassword.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login },
  { path: "/forgot-password", component: ForgotPassword },
  { path: "/reset-password", component: ResetPassword },
  {
    path: "/dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
    children: [
      {
        path: "companies",
        component: Companies,
        meta: { roles: ["admin", "manager"] },
      },
      {
        path: "departments",
        component: Departments,
        meta: { roles: ["admin", "manager"] },
      },
      {
        path: "employees",
        component: Employees,
        meta: { roles: ["admin", "manager", "employee"] },
      },
      {
        path: "reports",
        component: Reports,
        meta: { roles: ["admin", "manager"] },
      },
      {
        path: "admin",
        component: Admin,
        meta: { roles: ["admin"] },
      },
      { path: "employees/:id/timeline", component: EmployeeTimeline },
      {
        path: "/onboard",
        component: EmployeeWizard,
      },
      { path: "profile", component: Profile },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global auth guard
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  auth.loadUser();

  if (to.meta.requiresAuth && !auth.token) {
    next("/login");
  } else if (to.meta.roles && !to.meta.roles.includes(auth.user?.role)) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;
