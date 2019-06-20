const jwt = require('jsonwebtoken');
const secret = 'Again,iAmVeryBadAtThis';

const context = ({ req, datab }) => {
	var payload = {
		isValid: false,
		token: null,
		email: null,
		id: null,
		db: datab
	}
	//console.log('wonka!: ', req.body, req.headers.authorization);
	if (!req.headers.authorization) {
		// ulta
	} else {
		const token = req.headers.authorization.replace('bearer ', '');
		jwt.verify(token, secret, function(err, decoded) {
			if (err) {
				// ulta
			} else {
				payload.email = decoded.email;
				payload.id = decoded.id;
				payload.token = token;
				payload.isValid = true;
			}
		});
	}
	return payload;
}

module.exports = context;