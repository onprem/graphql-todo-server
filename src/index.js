const { ApolloServer } = require('apollo-server');
const MongoClient = require('mongodb').MongoClient;
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const conText = require('./context');
require('dotenv').config();

const db_user = process.env.DB_USER;
const db_pass = process.env.DB_PASS;
const db_name = process.env.DB_NAME;
const db_host = process.env.DB_HOST;

const url = `mongodb://${db_user}:${db_pass}@${db_host}`;
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect((err) => {
	if (err)
		console.log('DB connection failed:', err);
	else {
		const db = client.db(db_name);

		const server = new ApolloServer({ typeDefs, resolvers , context: ({ req, datab = db }) => conText({ req, datab }) });

		server.listen().then(({ url }) => {
			console.log(` 🚀 Server ready at ${url}`);
		});
	}
}, { useNewUrlParser: true })

