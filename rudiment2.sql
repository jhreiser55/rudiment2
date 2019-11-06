DROP DATABASE rudiment2;
CREATE DATABASE rudiment2;
\c rudiment2

CREATE TABLE users (
	username text NOT NULL PRIMARY KEY,
	firstname text,
	lastname text,
	email text
);

CREATE TABLE workshop (
	id_workshop serial PRIMARY KEY,
	title text NOT NULL,
	startDate DATE,
	location text,
	maxSeats Integer,
	instructor text,
	openSeats Integer
);

CREATE TABLE enroll (
	id_enroll serial PRIMARY KEY,
	title text NOT NULL,
	startDate DATE,
	location text,
	maxSeats Integer,
	instructor text,
	username text
);

GRANT SELECT, DELETE, INSERT ON users, workshop, enroll to rudiment2;
GRANT USAGE on workshop_id_workshop_seq, enroll_id_enroll_seq to rudiment2;