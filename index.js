let express = require('express')
let bodyParser = require('body-parser');
const dbHelper = require('./dbHelper');
const line = require('@line/bot-sdk');

const channelAccessToken = 'bpFztfsxpmvyXXj5PZEn0qd+Ki05ztdweG/Q3n33CM/DWyot2OviZmuWFLl28eLpJp/0DKLCdYc1RMNSjLocNgK5NdE5nzPr046a0yK7ID50u9CgWss9Ev9VVcHYOH7S1Ipam7u6ixqbG+DXJIh04AdB04t89/1O/w1cDnyilFU='
const subscriptionIdAdd = '600020d34c3723284ca1b22b'
const subscriptionIdRemove = '5fbfc14d0d9f0b17c6091c17'
const baseURL = "https://callback-app.azurewebsites.net/"

let app = express()

app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});

app.use(bodyParser.json());

function sendMessage(groupId, title, link, lineClient) {
	const message = {
	  type: 'text',
	  text: title + "\n " + link
	};

	lineClient.pushMessage(groupId, message)
	  .then((response) => {
	    console.log(response)
	  })
	  .catch((err) => {
	    console.log('error occurred!!! ' + err)
	  });
}

app.post('/', async (req, res) => {
	if (req.body) {

		console.log(req.body);
		try {

      let lineClient = new line.Client({
        channelAccessToken: channelAccessToken
      });

      if (req.body.type == "message.created") {
        if (req.body.payload.enrichments.sentiment == -1) {
          dbHelper.connect().then(async () => {
            let groups = await dbHelper.getGroups()
            for (let i = 0; i < groups.length; i++) {
              let groupId = groups[i].groupId
              let link = req.body.payload.permalink
              let text = req.body.payload.content.text

              console.log(groupId)
              console.log(text)
              console.log(link)

              sendMessage(groupId, text, link, lineClient)
            }
          }).catch((error) => {
            console.log("Unable to connect to database: " + error);
          })
        }
      }
		}
		catch (err) {
			console.log("Unknown error: " + err)
		}
	}
  res.send("Done")
})

app.post('/line-webhook', async (req, res) => {
	console.log(JSON.stringify(req.body, undefined, 2))
	let data = req.body
  if (data.events != undefined && data.events.length > 0) {
    if (data.events[0].type === 'join') {
      let groupId = data.events[0].source.groupId
      dbHelper.connect().then(async () => {
        console.log("Connected to database")

        try {
          await dbHelper.insertGroup(groupId)
          res.send("group inserted")
        }
        catch (err) {
          console.log("Error while inserting group: " + err)
          res.send(err)
        }
      }).catch((error) => {
        console.log("Unable to connect to database: " + error)
        res.send("Unable to connect to database")
      });
    }
  }
  else {
      res.send("Invalie Params")
  }
})

let port = process.env.PORT || 3000

app.listen(port, () => {
    console.log("Server started on port " + port)
})
