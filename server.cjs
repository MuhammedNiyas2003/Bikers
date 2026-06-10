const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Detect database mode: Postgres if DATABASE_URL is present, otherwise SQLite
const isPostgres = process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith('postgres://') || process.env.DATABASE_URL.startsWith('postgresql://'));

let dbClient;

if (isPostgres) {
    console.log("Using PostgreSQL Cloud Database.");
    const { Pool } = require('pg');
    dbClient = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false // Required for Supabase/Neon secure connections
        }
    });
} else {
    console.log("Using local SQLite Database.");
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'motoescape.db');
    
    // Ensure database directory exists dynamically
    const fs = require('fs');
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    
    dbClient = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening SQLite database', err);
        } else {
            console.log('Connected to local SQLite database.');
        }
    });
}

// Database Abstraction Adapter to normalize SQLite vs PostgreSQL differences
const dbAdapter = {
    all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            if (isPostgres) {
                // Convert '?' placeholders to '$1, $2...' for Postgres compatibility
                let pgSql = sql;
                let index = 1;
                while (pgSql.includes('?')) {
                    pgSql = pgSql.replace('?', `$${index++}`);
                }
                dbClient.query(pgSql, params, (err, res) => {
                    if (err) reject(err);
                    else resolve(res.rows);
                });
            } else {
                dbClient.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            }
        });
    },
    get: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            if (isPostgres) {
                let pgSql = sql;
                let index = 1;
                while (pgSql.includes('?')) {
                    pgSql = pgSql.replace('?', `$${index++}`);
                }
                dbClient.query(pgSql, params, (err, res) => {
                    if (err) reject(err);
                    else resolve(res.rows[0]);
                });
            } else {
                dbClient.get(sql, params, (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            }
        });
    },
    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            if (isPostgres) {
                let pgSql = sql;
                let index = 1;
                while (pgSql.includes('?')) {
                    pgSql = pgSql.replace('?', `$${index++}`);
                }
                // Append RETURNING id in INSERT queries for Postgres lastID support
                if (pgSql.toLowerCase().includes('insert into') && !pgSql.toLowerCase().includes('returning')) {
                    pgSql += ' RETURNING id';
                }
                dbClient.query(pgSql, params, (err, res) => {
                    if (err) reject(err);
                    else {
                        const lastID = res.rows && res.rows[0] ? res.rows[0].id : null;
                        resolve({ lastID, changes: res.rowCount });
                    }
                });
            } else {
                dbClient.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve({ lastID: this.lastID, changes: this.changes });
                });
            }
        });
    }
};

// Create tables on initialization
function createTables() {
    // Escape "desc" as it is a reserved SQL keyword in Postgres
    const ridesTableSql = isPostgres 
        ? `CREATE TABLE IF NOT EXISTS rides (
            id SERIAL PRIMARY KEY,
            title TEXT UNIQUE,
            image TEXT,
            duration TEXT,
            "desc" TEXT,
            price TEXT
           )`
        : `CREATE TABLE IF NOT EXISTS rides (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT UNIQUE,
            image TEXT,
            duration TEXT,
            "desc" TEXT,
            price TEXT
           )`;

    const bookingsTableSql = isPostgres
        ? `CREATE TABLE IF NOT EXISTS bookings (
            id SERIAL PRIMARY KEY,
            tour TEXT,
            date TEXT,
            name TEXT,
            email TEXT,
            skillLevel TEXT,
            bikePreference TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
           )`
        : `CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tour TEXT,
            date TEXT,
            name TEXT,
            email TEXT,
            skillLevel TEXT,
            bikePreference TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
           )`;

    const runInit = async () => {
        try {
            await dbAdapter.run(ridesTableSql);
            await dbAdapter.run(bookingsTableSql);
            
            // Check if rides table is empty, seed default rides
            const row = await dbAdapter.get("SELECT COUNT(*) AS count FROM rides");
            const count = isPostgres ? parseInt(row.count) : row.count;
            if (count === 0) {
                await dbAdapter.run("INSERT INTO rides (title, image, duration, \"desc\", price) VALUES (?, ?, ?, ?, ?)", [
                    "Mountain Pass Expedition", "mountain", "7 Days", "Conquer the high-altitude twisting roads and breathe in the thin, crisp mountain air. The ultimate test of endurance.", "₹1,25,000"
                ]);
                await dbAdapter.run("INSERT INTO rides (title, image, duration, \"desc\", price) VALUES (?, ?, ?, ?, ?)", [
                    "Coastal Highway Cruise", "coastal", "4 Days", "Cruise the stunning coastal cliffs with the ocean breeze in your face. A relaxed, scenic ride packed with stunning views.", "₹75,000"
                ]);
                await dbAdapter.run("INSERT INTO rides (title, image, duration, \"desc\", price) VALUES (?, ?, ?, ?, ?)", [
                    "Twilight Explorer", "hero", "5 Days", "Ride into the sunset on open, endless highways. Perfect for those who love night-riding and campfire stories.", "₹99,000"
                ]);
                console.log("Default rides seeded.");
            }
        } catch (err) {
            console.error("Error creating or seeding database:", err);
        }
    };
    runInit();
}

// Invoke table setup
createTables();

// API Routes for rides
app.get('/api/rides', async (req, res) => {
    try {
        const rows = await dbAdapter.all("SELECT * FROM rides");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/rides', async (req, res) => {
    const { title, image, duration, desc, price } = req.body;
    try {
        const result = await dbAdapter.run(
            "INSERT INTO rides (title, image, duration, \"desc\", price) VALUES (?, ?, ?, ?, ?)",
            [title, image, duration, desc, price]
        );
        res.json({ id: result.lastID, title, image, duration, desc, price });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/rides/:id', async (req, res) => {
    const { title, image, duration, desc, price } = req.body;
    try {
        await dbAdapter.run(
            "UPDATE rides SET title = ?, image = ?, duration = ?, \"desc\" = ?, price = ? WHERE id = ?",
            [title, image, duration, desc, price, req.params.id]
        );
        res.json({ message: "Ride updated successfully", id: req.params.id, title, image, duration, desc, price });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/rides/:id', async (req, res) => {
    try {
        await dbAdapter.run("DELETE FROM rides WHERE id = ?", [req.params.id]);
        res.json({ message: "Ride deleted successfully", id: req.params.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Routes for bookings
app.get('/api/bookings', async (req, res) => {
    try {
        const rows = await dbAdapter.all("SELECT * FROM bookings ORDER BY createdAt DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/bookings', async (req, res) => {
    const { tour, date, name, email, skillLevel, bikePreference } = req.body;
    try {
        const result = await dbAdapter.run(
            "INSERT INTO bookings (tour, date, name, email, skillLevel, bikePreference) VALUES (?, ?, ?, ?, ?, ?)",
            [tour, date, name, email, skillLevel, bikePreference]
        );
        res.json({ id: result.lastID, tour, date, name, email, skillLevel, bikePreference });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve static frontend files in production
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback all non-API GET requests to index.html for React SPA router
app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
