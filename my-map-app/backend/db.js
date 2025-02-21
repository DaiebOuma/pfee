const { Pool } = require("pg");
require("dotenv").config();

// Création de la connexion avec Pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Vérifier la connexion
pool.connect()
    .then(() => console.log("✅ Connecté à PostgreSQL"))
    .catch(err => console.error("❌ Erreur de connexion à PostgreSQL", err));

module.exports = pool;
