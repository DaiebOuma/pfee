const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();


app.use(cors());
app.use(express.json());
const pool = require("./db");
const PORT = process.env.PORT || 5000;


// Route pour récupérer les shapes en GeoJSON
app.get("/api/shapes", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, name, ST_AsGeoJSON(geom) AS geometry FROM shapes
        `);

        // Transformer les résultats en GeoJSON
        const geoJSON = {
            type: "FeatureCollection",
            features: result.rows.map(row => ({
                type: "Feature",
                properties: {
                    id: row.id,
                    name: row.name
                },
                geometry: JSON.parse(row.geometry)
            }))
        };

        res.json(geoJSON);
    } catch (error) {
        console.error("Erreur lors de la récupération des shapes :", error);
        res.status(500).json({ error: "Erreur lors de la récupération des données" });
    }
});

app.get("/test-db", async (req, res) => {
  try {
      const result = await pool.query("SELECT NOW()");
      res.json({ message: "Connexion réussie !", time: result.rows[0] });
  } catch (error) {
      console.error("Erreur PostgreSQL :", error);
      res.status(500).json({ error: "Erreur de connexion à la base" });
  }
});



// Route test
app.get("/", (req, res) => {
    res.send("Serveur Node.js avec Express fonctionne !");
});

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
