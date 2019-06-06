const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const context = ({ req }) => {
	console.log(req.headers);
	return {
		token: req.headers.authorization.replace('bearer ', '')
	}
}
const server = new ApolloServer({ typeDefs, resolvers, context });

server.listen().then(({ url }) => {
	console.log(` 🚀 Server ready at ${url}`);
});