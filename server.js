const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');  
const app = express();
const port = process.env.PORT || 3000; 

app.use(bodyParser.json());
app.use(express.static('public'));

const db = new sqlite3.Database(':memory:', err => {
    if (err) {
        return console.error('Error opening database:', err.message);
    }
    console.log('Connected to the in-memory SQLite database.');

    fs.readFile('./contacts.sql', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading SQL file:', err.message);
            return;
        }
        db.exec(data, (err) => {
            if (err) {
                console.error('Error executing SQL file:', err.message);
            } else {
                console.log('Database initialized with contacts.sql');
            }
        });
    });
});

app.get('/contacts', (req, res) => {
    const order = req.query.order === 'asc' ? 'ASC' : req.query.order === 'desc' ? 'DESC' : '';
    const sql = `SELECT * FROM Contacts ${order ? 'ORDER BY name ' + order : ''}`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/search', (req, res) => {
    const sql = "SELECT * FROM Contacts WHERE name LIKE ?";
    const params = [`%${req.query.name}%`];
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/contacts', (req, res) => {
    const { name, phone } = req.body;

    const checkPhoneSql = 'SELECT * FROM Contacts WHERE phone = ?';
    db.get(checkPhoneSql, [phone], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (row) {
            res.status(400).json({ error: 'Phone number already exists' });
        } else {
            const sql = 'INSERT INTO Contacts (name, phone) VALUES (?, ?)';
            const params = [name, phone];
            db.run(sql, params, function(err) {
                if (err) {
                    res.status(400).json({ error: err.message });
                    return;
                }
                res.json({
                    message: "Contact added successfully",
                    data: req.body,
                    id: this.lastID
                });
            });
        }
    });
});

app.put('/contacts/:id', (req, res) => {
    const { name, phone } = req.body;
    const id = req.params.id;

    const sql = 'UPDATE Contacts SET name = ?, phone = ? WHERE id = ?';
    db.run(sql, [name, phone, id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: "Contact updated successfully" });
    });
});

app.delete('/contacts/:id', (req, res) => {
    const sql = 'DELETE FROM Contacts WHERE id = ?';
    const params = [req.params.id];
    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: "Contact deleted successfully" });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
