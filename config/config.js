module.exports = {
	mongoURI: process.env.MONGO_DB_URI || 'mongodb+srv://kidslike:goit34GH@kidslike-aritw.mongodb.net/test?retryWrites=true&w=majority',
	apiPATH: '/api',
  apiVersion: '/v1',
  jwtSecretKey: "blabLaKey"
};
