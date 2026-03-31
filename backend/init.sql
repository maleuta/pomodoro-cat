-- table users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    coins INTEGER DEFAULT 0
);

-- tabela session history
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    mode VARCHAR(20) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    earned_coins INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- table of purchased accessories
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    item_name VARCHAR(100) NOT NULL
);

INSERT INTO users (username, coins) VALUES ('Kociara99', 50);