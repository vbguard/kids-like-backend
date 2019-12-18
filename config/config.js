require('dotenv').config();

module.exports = {
	mongoURI:
		process.env.MONGO_DB_URI ||
		'mongodb+srv://kidslike:goit34GH@kidslike-aritw.mongodb.net/test?retryWrites=true&w=majority',
	apiPATH: '/api',
	apiVersion: '/v1',
	jwtSecretKey: process.env.JWT_SECRET_KEY || 'some secret key',
	googleClientId: process.env.GOOGLE_CLIENT_KEY,
	googleClientKey: process.env.GOOGLE_SECRET_KEY
};
