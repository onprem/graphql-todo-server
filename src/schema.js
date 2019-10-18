const { gql } = require('apollo-server');

const typeDefs = gql`
	type Query {
		allTodos( limit: Int,	id: ID ): [Todo!]
		me: User
		hello: String
	}
	type Todo {
		id: ID!
		title: String!
		isComplete: Boolean!
		timestamp: String
		user: User!
	}
	type User {
		id: ID!
		name: String!
		email: String!
		todos: [Todo!]
	}

	type Mutation {
		addTodo( title: String! ): TodoResponse!

		toggleTodo( todoId: ID! ): TodoResponse!

		removeTodo( todoId: ID! ): TodoResponse!

		login( email: String!, password: String! ): String # login token

		signup( name: String!, email: String!, password: String! ): User
	}

	interface MutationResponse {
		code: String
		success: Boolean!
		message: String
	}

	type TodoResponse implements MutationResponse {
		code: String
		success: Boolean!
		message: String
		toDo: Todo
	}
`;

module.exports = typeDefs;