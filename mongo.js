const mongoose = require("mongoose");

if (process.argv.length < 3) {
	console.log(
		"Please provide the password as an argument: node mongo.js <password>"
	);
	process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://vinaybasargekar13:${password}@cluster0.4qlrh.mongodb.net/phoneBook?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);

mongoose.connect(url).catch((err) => {
	console.error("Error connecting to MongoDB:", err.message);
});

const personSchema = mongoose.Schema({
	name: String,
	phoneNumber: String,
});

const Person = mongoose.model("Person", personSchema);

// Case 1: If only password is provided, list all entries
if (process.argv.length === 3) {
	Person.find({})
		.then((result) => {
			console.log("phonebook:");
			result.forEach((person) => {
				console.log(`${person.name} ${person.phoneNumber}`);
			});
			mongoose.connection.close();
		})
		.catch((err) => {
			console.error("Error fetching data:", err.message);
		});
}

// Case 2: If name and phone number are provided, add a new entry
if (process.argv.length === 5) {
	const name = process.argv[3];
	const phoneNumber = process.argv[4];

	const person = new Person({
		name: name,
		phoneNumber: phoneNumber,
	});

	person
		.save()
		.then((result) => {
			console.log(`added ${name} number ${phoneNumber} to phonebook`);
			mongoose.connection.close();
		})
		.catch((err) => {
			console.error("Error saving person:", err.message);
		});
}
