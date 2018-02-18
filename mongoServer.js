//Importing the Required modules
var express = require('express');
var url = require('url');
var path = require("path");
var mongodb = require('mongodb');
//var qs = require('querystring');

//Variable Declaration Section
var userCredentials;
var app = express();  
var bodyParser = require('body-parser');
// Create application/x-www-form-urlencoded parser  
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var currUser;
var currUserHouseData;
//MongoDB variables
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/sars';
var databaseName="sars";

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var updateConfigDatabase = function(myquery, newvalues){
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;		
		var dbo = db.db(databaseName);
		dbo.collection("user_config").updateOne(myquery, newvalues, function(err, res) {
			if (err) {
				console.log("error occured");
				throw err;
			}
			console.log(res.result.nModified+" document updated successfully"); //to indicate the number of records updated
			db.close();
		});
	});
}

/*-------------------------------------- --- Loading the pre-requisite essential Files --- --------------------------------------*/
//--------------------- Generalised code for loading CSS files ---------------------//
app.get('/css/:cssFile',function(req, res){
    res.sendFile(__dirname+"/html/css/"+req.params.cssFile);
});
//--------------------- Generalised codefor loading JS files ---------------------//
app.get('/js/:jsFile',function(req, res){
    res.sendFile(__dirname+"/html/js/"+req.params.jsFile);
});
//--------------------- Generalised Code for loading the images -----------------------//
app.get('/asset/images/:imageName',function(req, res){
    res.sendFile(__dirname+"/html/asset/images/"+req.params.imageName);
});
app.get('/asset/fonts/:fontName',function(req,res){
	res.sendFile(__dirname+"/html/asset/fonts/"+req.params.fontName);
});

/*-------------------------------------- --- Login Page Loading --- --------------------------------------*/
app.get('/',function(req, res){
    res.sendFile(__dirname+"/html/login.html");
});
app.get('/login.htm*',function(req, res){
    res.sendFile(__dirname+"/html/login.html");
});

/*----------------------------    Authenticating the User Credentials    ----------------------------*/
app.post('/authenticateUser', urlencodedParser, function(req,res){
    var found = false;
    var query = { userId: req.body.username, password: req.body.passwd };
	MongoClient.connect(url, function(err, db) {
		var dbo = db.db(databaseName);
		if (err) throw err;
		dbo.collection("users").find(query).toArray(function(err, result) {
			if (err) throw err;
			if(result.length){
				currUser = result[0];
				console.log('auth passed');
				res.sendFile(__dirname+"/html/userPage.html");
			}else{
				res.sendFile(__dirname+"/html/login_err.html");
			}
			db.close();
		});
	});
});

/* ------------ Backend Code for getting the username and the selected user house details ----------------- */
app.get('/getUsername',function(req,res){
    res.send(currUser.username);
});
app.get('/getHouseData',function(req,res){
	var query = {userId: currUser.userId};
	MongoClient.connect(url, function(err, db) {
		var dbo = db.db(databaseName);
		if (err) throw err;
		dbo.collection("user_config").find(query).toArray(function(err, result) {
			if (err) throw err;
			if(result.length){
				currUserHouseData = result[0];
				res.send(currUserHouseData);
			}
			else{
				console.log('No DATA Found! Try after adding the data');
			}
		});
		db.close();
	});
});

/*-------------------------SET Hardware Wifi Credentials from the UI end------------------------ */
app.post('/setWIFI', urlencodedParser, function(req,res){
	var rcvd_data = JSON.parse(req.body.message);
	console.log("SSID"+rcvd_data.wifi_SSID);
	currUserHouseData.wifiCredentials.ssid = rcvd_data.wifi_SSID;
	currUserHouseData.wifiCredentials.pwd = rcvd_data.wifi_password;
	
	var myquery = { userId: currUser.userId };
	var newvalues = { $set: {wifiCredentials: currUserHouseData.wifiCredentials} };
	updateConfigDatabase(myquery,newvalues);
});
//---------------------------------------------------------------------------------------------end
/*-----------------------GET WIFI Credentials at the Hardware end---------------------------*/
app.get('/getWIFI', urlencodedParser, function(req,res){
	var dataToTransmit = currUserHouseData.wifiCredentials.ssid+"|*|"+currUserHouseData.wifiCredentials.pwd;
	res.send(dataToTransmit);
});

/* --------------------------------- LOG OUT CODE --------------------------------*/
app.get('/logout', urlencodedParser, function(req, res){
    //reset the session variables
    currUser = "";
    currUserHouseData = {};
    
    //send back the login page
    res.sendFile(__dirname+"/html/login.html");
});

/* ----------------------------------- AUTO-MANUAL SWITCHING ----------------------------------- */
app.get('/reset/:resetStatus',function(req,res){
    if(req.params.resetStatus == "true"){
		currUserHouseData.appliances = {
				"room1":[false,false,false,false,false],
				"room2":[false,false,false,false,false],
				"room3":[false,false,false,false,false],
				"room4":[false,false,false,false,false],
				"room5":[false,false,false,false,false]
		};
		var myquery = { userId: currUser.userId };
		var newvalues = { $set: {appliances: currUserHouseData.appliances} };
		updateConfigDatabase(myquery,newvalues);
		res.send('Remote Mode DISABLED');
	}else{
		res.send('Remote Mode ENABLED');
	}
	
});

/*---------------------------------Switching action [UI to server] Code--------------------*/
app.get('/toggle/:roomid/:switchid',function(req,res){
	
	currUserHouseData.appliances[req.params.roomid][req.params.switchid] = !currUserHouseData.appliances[req.params.roomid][req.params.switchid];
    
	var myquery = { userId: currUser.userId };
	var newvalues = { $set: {appliances: currUserHouseData.appliances} };
	updateConfigDatabase(myquery,newvalues);
	
	//sending data back to the UI
    res.send(currUserHouseData.appliances[req.params.roomid][req.params.switchid]);
});

/* ------------------------------ ------------Switching action [hardware to server to hardware] ---------- ------------------------------ */
app.get('/getswitch/:uniqueuser_id/:uniqueHw_id',function(req,res){
    //convert JSON to 2D array
    var status_record;
    var u_id = req.params.uniqueuser_id;
	var h_id = req.params.uniqueHw_id;
    
	
	var query = {userId: u_id, hardwareId: h_id};
	MongoClient.connect(url, function(err, db) {
		var dbo = db.db(databaseName);
		if (err) throw err;
		dbo.collection("user_config").find(query).toArray(function(err, result) {
			if (err) throw err;
			if(result.length){
				var tempdata = JSON.stringify(result[0]);

				// removing unwanted characters from the text stream, so that only "true", "false" are left
				// coz only the sequence is required
				var tempdata2 = tempdata.replace(/[^a-zA-Z]/g, " ").replace(/room/g, " ").replace(/  +/g, ' ').split(" ");

				var arr=[];

				for(i=0,j=0;i<tempdata2.length;i++){
					if(tempdata2[i]=="true"||tempdata2[i]=="false"){
						arr[j++]=(tempdata2[i]=="true")?1:0;
					}
				}
				console.log(arr);
				res.send(arr.toString());
			}
			else{
				console.log('Either user or hardware no is Invalid! Please Recheck.');
				res.send("DATA UNAVAILABLE");
			}
		});
		db.close();
	});
});

/* ---------- Setting the switch from the hardware end [currently out of scope] ----------- *\
app.get('/setswitch/:uniqueuser_id/:switchDetails',function(req,res){
    //convert JSON to 2D array
    var switch_in_array;
    var h = ["room1", "room2", "room3", "room4"];
    
    //CONVERSION CODE GOES HERE
    switch_in_array = "THE OTHERS";
    res.send(switch_in_array);
});

/**
*
*    IMPLEMENT SERVER-SENT EVENTS - imp concept
*
**/

/**
*
*		THE SERVER PART FOR THE APP
*
**/

var server = app.listen(8080, function () {  
  var host = server.address().address
  var port = server.address().port
  console.log("Advanced-IoT SERVER IS UP AND LISTENING AT https://%s:%s\nIntegrated with MONGODB", host, port);
});