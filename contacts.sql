CREATE TABLE IF NOT EXISTS Contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL
);

INSERT INTO Contacts (name, phone) VALUES ('John Doe', '123-456-7890');
INSERT INTO Contacts (name, phone) VALUES ('Jane Smith', '987-654-3210');
INSERT INTO Contacts (name, phone) VALUES ('Alice Johnson', '555-2368');
