const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.static("dist"));

// Middleware to parse JSON bodies
app.use(express.json());

let phoneBook = [
	{
		id: "1",
		name: "Arto Hellas",
		number: "040-123456",
	},
	{
		id: "2",
		name: "Ada Lovelace",
		number: "39-44-5323523",
	},
	{
		id: "3",
		name: "Dan Abramov",
		number: "12-43-234345",
	},
	{
		id: "4",
		name: "Mary Poppendieck",
		number: "39-23-6423122",
	},
];

app.get("/", (request, response) => {
	response.send("<h1>Hello World!</h1>");
});

app.get("/info", (request, response) => {
	const requestTime = new Date();
	const numOfEntries = phoneBook.length;

	response.send(`
		<p>Phonebook has info for ${numOfEntries} people</p>
		<p>${requestTime}</p>
	`);
});

app.get("/api/persons", (request, response) => {
	response.json(phoneBook);
});

app.get("/api/persons/:id", (request, response) => {
	const id = request.params.id;
	const person = phoneBook.find((p) => p.id === id);

	if (person) {
		response.json(person);
	} else {
		response.status(404).end();
	}
});

app.delete("/api/persons/:id", (request, response) => {
	const id = request.params.id;
	phoneBook = phoneBook.filter((person) => person.id !== id);

	response.status(204).end();
});

app.post("/api/persons", (request, response) => {
	const body = request.body;

	if (!body.name || !body.number) {
		return response.status(400).json({
			error: "name or number is missing",
		});
	}

	if (phoneBook.some((person) => person.name === body.name)) {
		return response.status(400).json({
			error: "name must be unique",
		});
	}

	const newPerson = {
		id: Math.floor(Math.random() * 10000).toString(),
		name: body.name,
		number: body.number,
	};

	phoneBook = phoneBook.concat(newPerson);
	response.json(newPerson);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
