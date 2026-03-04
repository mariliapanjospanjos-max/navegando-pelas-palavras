const jsonServer = require("json-server");
const cors = require("cors");

const app = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// Configuração de CORS simples
app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "https://navegando-pelas-palavras.onrender.com",
      "*",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

app.use(middlewares);
app.use(jsonServer.bodyParser);

// Rota de saúde
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "API funcionando!",
    database: "JSON Server (banco de dados)",
    timestamp: new Date().toISOString(),
  });
});

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Usar roteador JSON Server
app.use("/api", router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("\n🚀 ====================================");
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api/health`);
  console.log(`📊 Banco de dados: http://localhost:${PORT}/api/questions`);
  console.log("🚀 ====================================\n");
});
