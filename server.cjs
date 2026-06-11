const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Load local .env file if it exists
try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf-8');
        envConfig.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;
            const eqIndex = trimmed.indexOf('=');
            if (eqIndex === -1) return;
            const key = trimmed.substring(0, eqIndex).trim();
            const val = trimmed.substring(eqIndex + 1).trim().replace(/(^['"]|['"]$)/g, '');
            if (key) {
                process.env[key] = val;
            }
        });
        console.log('Local environment variables loaded from .env');
    }
} catch (err) {
    console.error('Error loading .env file:', err);
}

const app = express();
app.use(cors());
app.use(express.json());

// Setup database client: Postgres only
if (!process.env.DATABASE_URL) {
    console.error("CRITICAL ERROR: DATABASE_URL environment variable is not defined!");
    process.exit(1);
}

console.log("Using PostgreSQL Cloud Database.");
const { Pool } = require('pg');
const dbClient = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase/Neon secure connections
    }
});

// Database Abstraction Adapter to handle PostgreSQL queries
const dbAdapter = {
    all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
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
        });
    },
    get: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            let pgSql = sql;
            let index = 1;
            while (pgSql.includes('?')) {
                pgSql = pgSql.replace('?', `$${index++}`);
            }
            dbClient.query(pgSql, params, (err, res) => {
                if (err) reject(err);
                else resolve(res.rows[0]);
            });
        });
    },
    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
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
        });
    }
};

// Create tables on initialization
function createTables() {
    // Escape "desc" as it is a reserved SQL keyword in Postgres
    const ridesTableSql = `CREATE TABLE IF NOT EXISTS rides (
            id SERIAL PRIMARY KEY,
            title TEXT UNIQUE,
            image TEXT,
            duration TEXT,
            "desc" TEXT,
            price TEXT
           )`;

    const bookingsTableSql = `CREATE TABLE IF NOT EXISTS bookings (
            id SERIAL PRIMARY KEY,
            tour TEXT,
            date TEXT,
            name TEXT,
            email TEXT,
            skillLevel TEXT,
            bikePreference TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
           )`;

    const runInit = async () => {
        try {
            await dbAdapter.run(ridesTableSql);
            await dbAdapter.run(bookingsTableSql);
            console.log("Database tables initialized.");
        } catch (err) {
            console.error("Error creating database:", err);
        }
    };
    runInit();
}

// Invoke table setup
createTables();

// API Route for Admin Login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'motoescape123';
    
    if (username === adminUser && password === adminPass) {
        res.json({ success: true, token: 'motoescape_admin_session_token' });
    } else {
        res.status(401).json({ success: false, error: 'Invalid username or password' });
    }
});

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
