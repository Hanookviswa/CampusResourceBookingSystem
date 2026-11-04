
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user'
        CHECK (role IN ('user', 'admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resources (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
type TEXT NOT NULL,
location TEXT,
capacity INTEGER NOT NULL,
status TEXT NOT NULL DEFAULT 'available'
CHECK (status IN ('available', 'unavailable'))
);

CREATE TABLE IF NOT EXISTS bookings (
id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id INTEGER NOT NULL,
resource_id INTEGER NOT NULL,
booking_date TEXT NOT NULL,
start_time TEXT NOT NULL,
end_time TEXT NOT NULL,
status TEXT NOT NULL DEFAULT 'booked'
CHECK (status IN ('booked', 'cancelled')),
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id),
FOREIGN KEY (resource_id) REFERENCES resources(id),
CHECK (start_time < end_time)
);
