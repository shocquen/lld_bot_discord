require("dotenv").config();

const fs = require("node:fs");
const https = require('https');
const { Client, Collection, Intents } = require("discord.js");
const { credentials, app } = require("./auth_server/server");

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MEMBERS,
	],
});

client.commands = new Collection();
const commandFiles = fs
	.readdirSync("./commands")
	.filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

const eventFiles = fs
	.readdirSync("./events")
	.filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

const port = 2424;
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => {
	console.log('Server running on port ' + port);
});

client.login(process.env.TOKEN);
exports.client = client;