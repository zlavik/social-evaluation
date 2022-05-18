DROP TABLE users;

CREATE TABLE users (
    id bigint PRIMARY KEY,
    handle text NOT NULL,
    displayName text NOT NULL,
    imageSrc text NOT NULL,
    userTotalScore FLOAT DEFAULT 0,
    followerCount int NOT NULL,
);