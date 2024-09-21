const express = require("express");
const cors = require("cors");
const Person = require("./models/person");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("dist")); // Serve frontend

// Info Route: Displays number of entries and request time
app.get("/info", (request, response) => {
	const requestTime = new Date();
	Person.countDocuments({})
		.then((count) => {
			response.send(`
				<p>Phonebook has info for ${count} people</p>
				<p>${requestTime}</p>
			`);
		})
		.catch((error) => response.status(500).send(error.message));
});

// Get all persons from the database
app.get("/api/persons", (request, response) => {
	Person.find({}).then((persons) => {
		response.json(persons);
	});
});

// Get a single person by ID from the database
app.get("/api/persons/:id", (request, response, next) => {
	Person.findById(request.params.id)
		.then((person) => {
			if (person) {
				response.json(person);
			} else {
				response.status(404).end();
			}
		})
		.catch((error) => next(error)); // Handle invalid ID or errors
});

// Delete a person by ID from the database
app.delete("/api/persons/:id", (request, response, next) => {
	Person.findByIdAndDelete(request.params.id)
		.then((result) => {
			if (result) {
				response.status(204).end();
			} else {
				response.status(404).end();
			}
		})
		.catch((error) => next(error));
});

// Update a person by ID (PUT request)
app.put("/api/persons/:id", (request, response, next) => {
	const { name, number } = request.body;

	const updatedPerson = { name, number };

	Person.findByIdAndUpdate(request.params.id, updatedPerson, {
		new: true,
		runValidators: true,
		context: "query",
	})
		.then((updatedPerson) => {
			if (updatedPerson) {
				response.json(updatedPerson);
			} else {
				response.status(404).send({ error: "Person not found" });
			}
		})
		.catch((error) => next(error));
});

// Create a new person
app.post("/api/persons", (request, response, next) => {
	const body = request.body;

	if (!body.name || !body.number) {
		return response.status(400).json({
			error: "name or number is missing",
		});
	}

	Person.findOne({ name: body.name }).then((existingPerson) => {
		if (existingPerson) {
			return response.status(400).json({ error: "name must be unique" });
		}

		// Create a new person instance
		const newPerson = new Person({
			name: body.name,
			number: body.number,
		});

		// Save to database
		newPerson
			.save()
			.then((savedPerson) => {
				response.json(savedPerson);
			})
			.catch((error) => next(error)); // Handle errors
	});
});

// Handle unknown routes
app.use((request, response) => {
	response.status(404).send({ error: "unknown endpoint" });
});

// Error handling middleware
app.use((error, request, response, next) => {
	console.error(error.message);

	if (error.name === "CastError" && error.kind === "ObjectId") {
		return response.status(400).send({ error: "malformatted id" });
	}

	next(error);
});

// Start the server
const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
