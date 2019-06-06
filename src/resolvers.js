const resolvers = {
	Query: {
		hello: () => 'world',
		me: () => {
			return {
				name: "Prem Kumar",
				email: "prem@premsarswat.me"
			}
		}
	},
	User: {
		id: () => 1,
		todos: ( user ) => {
			console.log( user );
			return [
				{
					title: "My First todo",
					isComplete: false
				}
			]
		}
	},
	Mutation: {
		login: ( _, args, context ) =>{
			console.log( args, context.token );
			return Buffer.from(Buffer.from( args.email ).toString('base64'),  'base64').toString('ascii');
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