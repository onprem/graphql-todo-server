const { gql } = require('apollo-server');

const typeDefs = gql`
	type Query {
		allTodos( limit: Int,	id: ID ): [Todo]!
		me: User
		hello: String
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
		todos: [Todo!]
	}

	type Mutation {
		addTodo( title: String! ): TodoResponse!

		changeTodo( todoId: ID! ): TodoResponse!

		login( email: String! ): String # login token

		signup( name: String!, email: String! ): User
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
		todo: Todo
	}
`;

module.exports = typeDefs;