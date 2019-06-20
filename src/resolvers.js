const { AuthenticationError } = require('apollo-server');
const bcrypt = require('bcrypt');
const ObjectId = require('mongodb').ObjectId;
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
					timestamp: "$todos.timestamp",
					isComplete: "$todos.isComplete",
					user: {
						id: "$_id",
						name: "$name",
						email: "$email"
					}
				}}
			] ).toArray();
			//console.log(data);
			return data;
		}
	},
	User: {
		name: async ( user, _, context ) => {
			const users = await context.db.collection('users').find({ _id: ObjectId(user.id) }).project({ _id: 0, name: 1 }).toArray();
			return users[0].name;
		},
		todos: async ( user, _, context ) => {
			const users = await context.db.collection('users').find({ _id: ObjectId(user.id) }).project({ _id: 0, todos: 1 }).toArray();
			return users[0].todos;
		}
	},
	Mutation: {
		login: async ( _, args, context ) =>{
			//console.log( args, context.token );
			const data = await context.db.collection('users').find({ email: args.email }).project({ email: 1, hash: 1 }).toArray();
			if( data.length === 1 ){
				const match = await bcrypt.compare( args.password, data[0].hash );
				if(match){
					const id = data[0]._id.toString();
					const email = data[0].email;
					const payload = { email, id };
					const token = jwt.sign(payload, secret, {
						expiresIn: '30d'
					});
					//console.log('payload:', payload);
					return token;
				}
				else
					throw new AuthenticationError("Invalid password");
			}
			//console.log(data);
			return null;
		},
		signup: async ( _, args, context ) => {
			const data = await context.db.collection('users').find({ email: args.email }).project({ _id: 1 }).toArray();
			if( data.length === 0 ){
				const hash = await bcrypt.hash( args.password, 10 );
				const r = await context.db.collection('users').insertOne({ email: args.email, name: args.name, hash: hash, todos: [] });
				//console.log(r);
				return {
					id: r.insertedId,
					name: args.name,
					email: args.email
				};
			}
			return null;
		},
		addTodo: async ( _, args, context ) => {
			if( context.isValid ) {
				const toDo = {
					id: `${context.id}-${getRandomInt(9999)}`,
					title: args.title,
					isComplete: false,
					timestamp: Date.now()
				}
				await context.db.collection('users').updateOne( 
					{ _id: ObjectId(context.id) },
					{ $push: 
						{ todos: toDo }
					}
				)
				return {
					code: '200',
					success: true,
					message: 'successfully added ToDo',
					user: {
						id: context.id,
						email: context.email
					}
				}
			}
			else
				throw new AuthenticationError('Authentication required!')
		},
		toggleTodo: async ( _, args, context ) => {
			if( context.isValid ) {
				console.log('toggling todo with id', args.todoId);
				const [ usr ] = await context.db.collection('users').aggregate(
					[
						{ $match: { _id: ObjectId(context.id) } },
						{ $unwind: '$todos' },
						{ $match: { 'todos.id': args.todoId } }
					]
				).toArray();
				const isComplete = !usr.todos.isComplete;
				const toDo = {
					id: usr.todos.id,
					title: usr.todos.title,
					isComplete: isComplete,
					timestamp: usr.todos.timestamp
				};
				await context.db.collection('users').updateOne(
					{ _id: ObjectId(context.id) },
					{ $set: { "todos.$[elem].isComplete": isComplete } },
					{ arrayFilters: [ { "elem.id": args.todoId } ] }
				);

				return {
					code: '200',
					success: true,
					message: 'successfully toggled ToDo',
					user: {
						id: context.id,
						email: context.email
					}
				}
			}
			else
				throw new AuthenticationError('Authentication required!');
		},
		removeTodo: async ( _, args, context ) => {
			if( context.isValid ) {
				console.log('removing todo with id', args.todoId);
				await context.db.collection('users').updateOne(
					{ _id: ObjectId(context.id) },
					{ $pull: { todos: { id: args.todoId } } }
				);

				return {
					code: '200',
					success: true,
					message: 'successfully removed ToDo',
					user: {
						id: context.id,
						email: context.email
					}
				}
			}
			else
				throw new AuthenticationError('Authentication required!')
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