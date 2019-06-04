const { gql } = require('apollo-server');

const typeDefs = gql`
type Query {
	todos(
		limit: Int
		id: ID
	): [Todo]!
	me: User
}
type Todo {
	id: ID!
	title: String!
	isComplete: Boolean!
	user: User!
}
type User {
	id: ID!
	name: String!
	email: String!
	todos: [Todo]!
}

type Mutation {
	addTodo( title: String! ): todoResponse!

	changeTodo( todoId: ID! ): todoResponse!

	login( email: String! ): String # login token

	signup(
		name: String!
		email: String!
	): User!
}

type todoResponse {
  success: Boolean!
  message: String
  todo: Todo
}
`;

module.exports = typeDefs;