const MongoClient = require('mongodb').MongoClient
const mongoClientOptions = { useUnifiedTopology: true, useNewUrlParser: true }

const uri = 'mongodb+srv://ukel-user-20:ukel-user-20@cluster0.mvr46.mongodb.net/sprinklr_db?retryWrites=true&w=majority'
const dbName = 'sprinklr_db'
var db = undefined

module.exports.connect = async () => {
	try {
        let client = await MongoClient.connect(uri, mongoClientOptions);
        db = client.db(dbName)
    }
    catch (error) {
    	console.log(error)
        throw new Error(error)
    }
}

module.exports.insertGroup = async (groupId) => {
	if (!db) {
		throw new Error('No connection to database');
	}

	db.collection("groups").insertOne({"groupId": groupId}, function(err, res) {
	    if (err)
	    	throw err

	    console.log("1 document inserted")
	});
}

module.exports.getGroups = async () => {
	if (!db) {
		throw new Error('No connection to database');
	}

	let res = await db.collection("groups").find({}).toArray()
	return res
}
