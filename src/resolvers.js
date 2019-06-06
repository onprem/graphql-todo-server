const { AuthenticationError } = require('apollo-server');
const jwt = require('jsonwebtoken');
const secret = 'Again,iAmVeryBadAtThis';

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