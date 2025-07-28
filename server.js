import express from "express";
import cors from "cors";
import jsonServer from "json-server";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"],
  },
});

const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Store connected clients for SSE
const clients = {
  companies: new Set(),
  departments: new Set(),
  employees: new Set(),
};

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

  // Join specific rooms for targeted notifications
  socket.on("join_company_room", () => {
    socket.join("companies");
  });

  socket.on("join_department_room", () => {
    socket.join("departments");
  });

  socket.on("join_employee_room", () => {
    socket.join("employees");
  });
});

// SSE endpoint for companies
app.get("/companies/events", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  const clientId = Date.now();
  clients.companies.add(res);

  req.on("close", () => {
    clients.companies.delete(res);
  });
});

// SSE endpoint for departments
app.get("/departments/events", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  const clientId = Date.now();
  clients.departments.add(res);

  req.on("close", () => {
    clients.departments.delete(res);
  });
});

// SSE endpoint for employees
app.get("/employees/events", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  const clientId = Date.now();
  clients.employees.add(res);

  req.on("close", () => {
    clients.employees.delete(res);
  });
});

// Function to broadcast updates
function broadcastUpdate(type, resource, data) {
  const clientsSet = clients[resource];

  // Map resource names to correct property names
  const propertyMap = {
    companies: "company",
    departments: "department",
    employees: "employee",
  };

  const propertyName = propertyMap[resource] || resource.slice(0, -1);

  const message = `data: ${JSON.stringify({
    type,
    [propertyName]: data,
  })}\n\n`;

  clientsSet.forEach((client) => {
    client.write(message);
  });

  // Also emit to Socket.io clients
  io.to(resource).emit(type, data);

  // Emit general notification
  io.emit("notification", {
    message: `${propertyName} ${type.split("_")[1]}`,
    type: "info",
    data,
  });
}

// Use json-server
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

app.use(middlewares);

// Override json-server routes to add SSE broadcasting
const originalPost = router.db.get;
const originalPut = router.db.set;
const originalDelete = router.db.delete;

// Override POST (create)
app.post("/companies", (req, res) => {
  // Generate a unique ID if not provided
  const companyData = { ...req.body };
  if (!companyData.id) {
    companyData.id = `company_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  const result = router.db.get("companies").push(companyData).write();
  const newCompany = result[result.length - 1];

  // Ensure the company has an ID
  if (!newCompany.id) {
    console.log("Warning: New company missing ID:", newCompany);
  }

  console.log("Created new company:", newCompany);
  broadcastUpdate("company_added", "companies", newCompany);

  // Emit specific notification
  io.emit("company_created", newCompany);

  res.json(newCompany);
});

app.post("/departments", (req, res) => {
  const result = router.db.get("departments").push(req.body).write();
  const newDepartment = result[result.length - 1];
  broadcastUpdate("department_added", "departments", newDepartment);

  // Emit specific notification
  io.emit("department_created", newDepartment);

  res.json(newDepartment);
});

app.post("/employees", (req, res) => {
  const result = router.db.get("employees").push(req.body).write();
  const newEmployee = result[result.length - 1];
  broadcastUpdate("employee_added", "employees", newEmployee);

  // Emit specific notification
  io.emit("employee_created", newEmployee);

  res.json(newEmployee);
});

// Override PUT (update)
app.put("/companies/:id", (req, res) => {
  const updated = router.db
    .get("companies")
    .find({ id: req.params.id })
    .assign(req.body)
    .write();
  broadcastUpdate("company_updated", "companies", updated);

  // Emit specific notification
  io.emit("company_updated", updated);

  res.json(updated);
});

app.put("/departments/:id", (req, res) => {
  const updated = router.db
    .get("departments")
    .find({ id: req.params.id })
    .assign(req.body)
    .write();
  broadcastUpdate("department_updated", "departments", updated);

  // Emit specific notification
  io.emit("department_updated", updated);

  res.json(updated);
});

app.put("/employees/:id", (req, res) => {
  const updated = router.db
    .get("employees")
    .find({ id: req.params.id })
    .assign(req.body)
    .write();
  broadcastUpdate("employee_updated", "employees", updated);

  // Emit specific notification
  io.emit("employee_updated", updated);

  res.json(updated);
});

// Override DELETE
app.delete("/companies/:id", (req, res) => {
  const company = router.db
    .get("companies")
    .find({ id: req.params.id })
    .value();
  router.db.get("companies").remove({ id: req.params.id }).write();
  broadcastUpdate("company_deleted", "companies", { companyId: req.params.id });

  // Emit specific notification
  if (company) {
    io.emit("company_deleted", company);
  }

  res.json({});
});

app.delete("/departments/:id", (req, res) => {
  const department = router.db
    .get("departments")
    .find({ id: req.params.id })
    .value();
  router.db.get("departments").remove({ id: req.params.id }).write();
  broadcastUpdate("department_deleted", "departments", {
    departmentId: req.params.id,
  });

  // Emit specific notification
  if (department) {
    io.emit("department_deleted", department);
  }

  res.json({});
});

app.delete("/employees/:id", (req, res) => {
  const employee = router.db
    .get("employees")
    .find({ id: req.params.id })
    .value();
  router.db.get("employees").remove({ id: req.params.id }).write();
  broadcastUpdate("employee_deleted", "employees", {
    employeeId: req.params.id,
  });

  // Emit specific notification
  if (employee) {
    io.emit("employee_deleted", employee);
  }

  res.json({});
});

// Use json-server for other routes
app.use(router);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Real-time updates enabled via SSE and WebSocket");
});
