const { ApolloServer } = require('apollo-server');
const MongoClient = require('mongodb').MongoClient;
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const conText = require('./context');

const url = 'mongodb://gql:gqlpass@one.db.magehost.com:3306,two.db.magehost.com;3306/gqlTodo?replicaSet=rs0';
const dbName = 'gqlTodo'
const client = new MongoClient(url, { useNewUrlParser: true });

client.connect((err) => {
	if (err)
		console.log('DB connection failed:', err);
	else {
		const db = client.db(dbName);

		const server = new ApolloServer({ typeDefs, resolvers , context: ({ req, datab = db }) => conText({ req, datab }) });

		server.listen().then(({ url }) => {
			console.log(` 🚀 Server ready at ${url}`);
		});
	}
}, { useNewUrlParser: true })

