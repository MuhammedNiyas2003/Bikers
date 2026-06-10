const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'motoescape.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to SQLite database.');
        createTables();
    }
});

function createTables() {
    db.serialize(() => {
        // Create 'rides' table instead of 'tours'
        db.run(`
            CREATE TABLE IF NOT EXISTS rides (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT UNIQUE,
                image TEXT,
                duration TEXT,
                desc TEXT,
                price TEXT
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tour TEXT,
                date TEXT,
                name TEXT,
                email TEXT,
                skillLevel TEXT,
                bikePreference TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Check if rides table is empty, seed default rides in Rupees
        db.get("SELECT COUNT(*) AS count FROM rides", (err, row) => {
            if (row && row.count === 0) {
                const stmt = db.prepare("INSERT INTO rides (title, image, duration, desc, price) VALUES (?, ?, ?, ?, ?)");
                stmt.run("Mountain Pass Expedition", "mountain", "7 Days", "Conquer the high-altitude twisting roads and breathe in the thin, crisp mountain air. The ultimate test of endurance.", "₹1,25,000");
                stmt.run("Coastal Highway Cruise", "coastal", "4 Days", "Cruise the stunning coastal cliffs with the ocean breeze in your face. A relaxed, scenic ride packed with stunning views.", "₹75,000");
                stmt.run("Twilight Explorer", "hero", "5 Days", "Ride into the sunset on open, endless highways. Perfect for those who love night-riding and campfire stories.", "₹99,000");
                stmt.finalize();
                console.log("Default rides seeded in Rupees.");
            }
        });
    });
}

// API Routes for rides
app.get('/api/rides', (req, res) => {
    db.all("SELECT * FROM rides", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/rides', (req, res) => {
    const { title, image, duration, desc, price } = req.body;
    db.run(
        "INSERT INTO rides (title, image, duration, desc, price) VALUES (?, ?, ?, ?, ?)",
        [title, image, duration, desc, price],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, title, image, duration, desc, price });
        }
    );
});

app.put('/api/rides/:id', (req, res) => {
    const { title, image, duration, desc, price } = req.body;
    db.run(
        "UPDATE rides SET title = ?, image = ?, duration = ?, desc = ?, price = ? WHERE id = ?",
        [title, image, duration, desc, price, req.params.id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: "Ride updated successfully", id: req.params.id, title, image, duration, desc, price });
        }
    );
});

app.delete('/api/rides/:id', (req, res) => {
    db.run("DELETE FROM rides WHERE id = ?", req.params.id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Ride deleted successfully", id: req.params.id });
    });
});

// API Routes for bookings
app.get('/api/bookings', (req, res) => {
    db.all("SELECT * FROM bookings ORDER BY createdAt DESC", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/bookings', (req, res) => {
    const { tour, date, name, email, skillLevel, bikePreference } = req.body;
    db.run(
        "INSERT INTO bookings (tour, date, name, email, skillLevel, bikePreference) VALUES (?, ?, ?, ?, ?, ?)",
        [tour, date, name, email, skillLevel, bikePreference],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, tour, date, name, email, skillLevel, bikePreference });
        }
    );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
