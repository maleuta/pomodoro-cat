-- stores our users and their precious coins
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    coins INTEGER DEFAULT 0
);

-- keeps track of all the hard work (and naps)
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    mode VARCHAR(20) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    earned_coins INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- giving you some starter cash so you're not broke on day one
INSERT INTO users (username, coins) VALUES ('Kociara99', 50);