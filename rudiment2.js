const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.set("port", (8080));
app.use(bodyParser.json({type: "application/json"}));
app.use(bodyParser.urlencoded({extended: true}));

const Pool = require("pg").Pool;
const config = {
	host: "localhost",
	user: "rudiment2",
	password: "abc123",
	database: "rudiment2"
};

const pool = new Pool(config);

app.listen(app.get("port"), () => {
	console.log(`Find the server at http://localhost:${app.get("port")}`);
});

app.post("/create-user", async (req, res) => {
	const username = req.body.username;
	const firstname = req.body.firstname;
	const lastname = req.body.lastname;
	const email = req.body.email
	if(!username || !firstname || !lastname || !email){
		res.json({error: 'parameters not given.'});
	}
	else{
		try {
			const template = "SELECT * FROM users WHERE username = $1";
			const response = await pool.query(template, [ username ]);
			if(response.rowCount == 1){
				res.json({ status: "username taken"});
			} else {
				const template =
					"INSERT INTO users (username, firstname, lastname, email) VALUES ($1, $2, $3, $4)";
				const response = await pool.query(template, [ username, firstname, lastname, email ]);
				res.json({ status: "user added" });
			}
		} catch (err) {
			res.json({ status: "username taken" });
			console.log(err);
		}
	}
});

app.delete("/delete-user", async (req, res) => { //user -> first -> last -> email
	const username = req.body.username;
	if(!username){
		res.json({error: 'parameters not given.'});
	}
	else{
		try {
			const template = "SELECT FROM users WHERE username = $1";
			const response = await pool.query(template, [ username ]);
			if(response.rowCount == 1){
				const template = "DELETE FROM users WHERE username = $1";
				const response = await pool.query(template, [ username ]);
				res.json({ status: "deleted" });
			}
			else{
				res.json({ status: "The user doesn't exist"})
			}
		} catch (err) {
			res.json({ error: "There was an error!" });
		}
	}
});

app.get("/list-users", async (req, res) => {
	const type = req.query.type;
	if(!type){
		res.json ({ error: 'parameters not given.'});
	}
	else{
		try{
			if(type.localeCompare("full") == 0){
				const response = await pool.query("SELECT * FROM users");
				const rows = response.rowCount;
				const wow = new Array();
				var i;
				for(i = 0; i < rows; i++){
					const username = response.rows[i].username;
					const firstname = response.rows[i].firstname;
					const lastname = response.rows[i].lastname;
					const email = response.rows[i].email;
					const resp = { username: username, firstname: firstname, lastname: lastname, email: email };
					wow.push(resp);
				}
				res.json({ users: wow });
			}
			else if(type.localeCompare("summary") == 0){
				const response = await pool.query("SELECT * FROM users");
				const rows = response.rowCount;
				const wowow = new Array();
				var j;
				for(j = 0; j < rows; j++){
					const firstname = response.rows[j].firstname;
					const lastname = response.rows[j].lastname;
					const resp = { firstname: firstname, lastname: lastname };
					wowow.push(resp);
				}
				res.json({ users: wowow });
			}
			else{
				res.json({ error: "Not valid value of 'type'."});
			}
		} catch(err){
			console.log(err);
			res.json({ error: "i suck at programming and got an error"});
		}
	}
});

app.post("/add-workshop", async (req, res) => { //title - date - loc - maxSeats - instructor
	const title = req.body.title;
	const startDate = req.body.date;
	const location = req.body.location;
	const maxSeats = req.body.maxseats;
	const instructor = req.body.instructor;
	const openSeats = maxSeats;
	if(!title || !startDate || !location || !maxSeats || !instructor){
		res.json({error: 'parameters not given.'});
	}
	else{
		try {
			const template = "SELECT * FROM workshop WHERE title = $1 and startDate = $2 and location = $3";
			const response = await pool.query(template, [ title, startDate, location ]);
			if(response.rowCount == 1){
				res.json({ status: "workshop already in database"});
			} else {
				const template = "INSERT INTO workshop (title, startDate, location, maxSeats, instructor, openSeats) VALUES ($1, $2, $3, $4, $5, $6)";
				const response = await pool.query(template, [ title, startDate, location, maxSeats, instructor, openSeats ]);
				res.json({ status: "workshop added" });
			}
		} catch (err) {
			res.json({ status: "Somehow we got an error" });
			console.log(err);
		}
	}
});

app.post("/enroll", async (req, res) => { 
	const title = req.body.title;
	const startDate = req.body.date;
	const location = req.body.location;
	const maxSeats = req.body.maxseats;
	const instructor = req.body.instructor;
	const username = req.body.username;
	if(!title || !startDate || !location || !username){
		res.json({error: "parameters not given."});
	}
	else {
		try {
			const template = "SELECT * FROM users WHERE username = $1"
			const response = await pool.query(template, [ username ]);
			if(response.rowCount == 0){
				res.json({ status: "user not in database"});
			} 
			else {
				const template = "SELECT * FROM workshop WHERE title = $1 and location = $2 and startDate = $3";
				const response = await pool.query(template, [ title, location, startDate ]);
				if(response.rowCount == 0){
					res.json({ status: "workshop does not exist"});
				}
				else {
					const template = "SELECT * FROM enroll WHERE title = $1 and location = $2 and startDate = $3 and username = $4";
					const response = await pool.query(template, [ title, location, startDate, username ]);
					if(response.rowCount == 1){
						res.json({ status: "user already enrolled" });
					}
					else {
						const template = "SELECT count(*) FROM enroll WHERE title = $1 and location = $2 and startDate = $3";
						const response = await pool.query(template, [ title, location, startDate ]);
						const count = response.rows[0].count;
						if((maxSeats <= count)){
							res.json({ status: "no seats available" });
						}
						else {
							const jordan = "INSERT INTO enroll (title, startDate, location, maxSeats, instructor, username) VALUES ($1, $2, $3, $4, $5, $6)";
							const reiser = await pool.query(jordan, [ title, startDate, location, maxSeats, instructor, username ]);
							res.json({ status: "user added" });
						}
					}
				}
			}

		} catch (err) {
			res.json({ status: "Somehow we got an error" });
			console.log(err);
		}
	}
});

app.get("/list-workshops", async (req, res) => {
	const dateFormat = require("dateformat");
	try{
		const response = await pool.query("SELECT * FROM workshop");
		const rows = response.rowCount;
		const wow = new Array();
		var i;
		for(i = 0; i < rows; i++){
			const title = response.rows[i].title;
			const workshopDate = dateFormat(response.rows[i].startdate, "yyyy-mm-dd");
			const location = response.rows[i].location;
			const resp = { title: title, date: workshopDate, location: location };
			wow.push(resp);
		}
		res.json({ workshops: wow });
	} catch(err){
		console.log(err);
		res.json({ error: "i suck at programming and got an error"});
	}
});

app.get("/attendees", async (req, res) => {
	const title = req.query.title;
	const startDate = req.query.date;
	const location = req.query.location;
	try{
		const template = "SELECT * FROM workshop WHERE title = $1 and startDate = $2 and location = $3";
		const response = await pool.query(template, [ title, startDate, location ]);
		if(response.rowCount == 0){
			res.json({ error: "workshop does not exist" });
		}
		else {
			const template = "SELECT username FROM enroll WHERE title = $1 and startDate = $2 and location = $3";
			const response = await pool.query(template, [ title, startDate, location ]);
			const wow = new Array();
			const rows = response.rowCount;
			var i;
			for(i = 0; i < rows; i++){
				const jordan = "SELECT * FROM users WHERE username = $1";
				const reiser = await pool.query(jordan, [ response.rows[i].username ]);
				const firstname = reiser.rows[0].firstname;
				const lastname = reiser.rows[0].lastname;
				const resp = { firstname: firstname, lastname: lastname };
				wow.push(resp);
			}
			res.json({ attendees: wow });
		}
	} catch(err){
		console.log(err);
		res.json({ error: "error" });
	}
});