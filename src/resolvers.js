const { AuthenticationError } = require('apollo-server');
const jwt = require('jsonwebtoken');
const secret = 'Again,iAmVeryBadAtThis';

const getRandomInt = (max) =>{
	return Math.floor(Math.random() * Math.floor(max));
}

const resolvers = {
	Query: {
		hello: () => 'world',
		me: ( _, __, context ) => {
			if( context.isValid ) {
				return {
					id: context.id,
					email: context.email
				}
			} else {
				throw new AuthenticationError('must authenticate');
			}
		},
		allTodos: async ( _, args, context ) => {
			const data = await context.db.collection('users').aggregate( [ 
				{ $unwind: "$todos" },
				{ $project: {
					_id: 0,
					id: "$todos.id",
					title: "$todos.title",
					isComplete: "$todos.isComplete",
					user: {
						id: "$_id",
						name: "$name",
						email: "$email"
					}
				}}
			] ).toArray();
			console.log(data);
			return data;
		}
	},
	User: {
		name: async ( user, _, context ) => {
			const users = await context.db.collection('users').find({ _id: user.id }).toArray();
			return users[0].name;
		},
		todos: async ( user, _, context ) => {
			const users = await context.db.collection('users').find({ _id: user.id }).toArray();
			return users[0].todos;
		}
	},
	Mutation: {
		login: ( _, args, context ) =>{
			console.log( args, context.token );
			const email = args.email;
			const id = 1;
			const payload = { email, id };
			const token = jwt.sign(payload, secret, {
				expiresIn: '30d'
			});
			console.log('jwt:', token);
			return token;
		},
		addTodo: async ( _, args, context ) => {
			const toDo = {
				id: `${context.id}-${getRandomInt(9999)}`,
				title: args.title,
				isComplete: false,
				timestamp: Date.now()
			}
			await context.db.collection('users').updateOne( 
				{ _id: context.id },
				{ $push: 
					{ todos: toDo }
				}
			)
			return {
				code: '200',
				success: true,
				message: 'successfully added ToDo',
				todo: toDo
			}
		}
	},
	MutationResponse: {
		__resolveType(obj, context, info){
			if(obj.todo){
				return 'TodoResponse';
			}

			// if(obj.licensePlate){
			// 	return 'Car';
			// }

			return null;
		}
	}
}

module.exports = resolvers;