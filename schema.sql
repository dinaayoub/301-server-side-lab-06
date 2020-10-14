DROP TABLE IF EXISTS locations;

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    city VARCHAR(255),
    formatted_query VARCHAR(255),
    latitude REAL,
    longitude REAL
);

ALTER TABLE locations RENAME COLUMN city TO search_query;