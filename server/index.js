import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// ===== Middlewares
app.use(cors({
    origin: ["http://localhost:5500", "https://maurobossio.github.io"]
}));
app.use(cors());            // permite requests desde tu front (http://localhost:5500)
app.use(express.json());    // parsea JSON en req.body

// ===== “DB” por archivo
const dbPath = path.join(__dirname, "db.json");

function readDB() {
    const raw = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(raw);
}
function writeDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// ===== Rutas
app.get("/api/health", (_req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
});

app.get("/api/projects", (_req, res) => {
    const db = readDB();
    res.json(db.projects || []);
});

app.post("/api/contact", (req, res) => {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
        return res.status(400).json({ error: "Faltan campos: name, email, message" });
    }
    const db = readDB();
    db.messages = db.messages || [];
    db.messages.push({
        id: Date.now(),
        name,
        email,
        message,
        created_at: new Date().toISOString()
    });
    writeDB(db);
    res.json({ ok: true });
});

// ===== Arranque
app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});
