//Importing the Required modules
var express = require('express');
var fs = require('fs');
var url = require('url');

//Variable Declaration Section
var userCredentials;
var app = express();  
var bodyParser = require('body-parser');  
// Create application/x-www-form-urlencoded parser  
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var currUser;
var currUserHouseData;

app.use(express.static('public'));

fs.readFile('./auth/auth.txt',function(err,data){
    userCredentials = JSON.parse(data).userCredentials;
    console.log("-- Auth File Loaded Successfully --");
});


/*-------------------------------------- --- Login Page Loading --- --------------------------------------*/
app.get('/',function(req, res){
    res.sendFile(__dirname+"/html/login.html");
});
app.get('/login.htm*',function(req, res){
    res.sendFile(__dirname+"/html/login.html");
});
app.get('/css/reset.css',function(req, res){
    res.sendFile(__dirname+"/html/css/reset.css");
});
app.get('/css/common.css',function(req, res){
    res.sendFile(__dirname+"/html/css/common.css");
});
app.get('/css/loginStyle.css',function(req, res){
    res.sendFile(__dirname+"/html/css/loginStyle.css");
});
app.get('/js/loginScript.js',function(req, res){
    res.sendFile(__dirname+"/html/js/loginScript.js");
});

/*-------------------------------------- --- User Page Loading --- --------------------------------------*/
app.get('/css/userPageStyle.css',function(req, res){
    res.sendFile(__dirname+"/html/css/userPageStyle.css");
});
app.get('/js/angular.min.js',function(req, res){
    res.sendFile(__dirname+"/html/js/angular.min.js");
});
app.get('/js/userScript.js',function(req, res){
    res.sendFile(__dirname+"/html/js/userScript.js");
});

/*---------------------Generalised Code for loading of the images-----------------------*/
app.get('/asset/images/:imageName',function(req, res){
    res.sendFile(__dirname+"/html/asset/images/"+req.params.imageName);
});

/* ------------ Backend Code for getting the username and the selected user house details ----------------- */
app.get('/getUsername',function(req,res){
    res.send(currUser.name);
});
app.get('/getHouseData',function(req,res){
    fs.readFile('./users_data/'+currUser.homeFile,function(err,data){
        if (err)
            res.send("error");
        else{
            currUserHouseData = JSON.parse(data);
            res.send(currUserHouseData);
        }
            
    });
});


app.post('/authenticateUser', urlencodedParser, function(req,res){
    var found = false;
    //res.append('Warning', '199 Miscellaneous warning');
    for(i=0;i<userCredentials.length;i++){
        if(req.body.username == userCredentials[i].username){
            if(req.body.passwd == userCredentials[i].password) {
                found = true;
                currUser = userCredentials[i];
                res.sendFile(__dirname+"/html/userPage.html");
            }
        }
    }
    if(!found){
        res.sendFile(__dirname+"/html/login_err.html");
    }
});

/* --------------------------------- LOG OUT CODE --------------------------------*/
app.get('/logout', urlencodedParser, function(req, res){
    //reset the other variables
    currUser = "";
    currUserHouseData = {};
    
    //send back the values
    res.sendFile(__dirname+"/html/login.html");
});


app.get('/toggle/:roomid/:switchid',function(req,res){
    currUserHouseData[req.params.roomid][req.params.switchid] = !currUserHouseData[req.params.roomid][req.params.switchid];
    //console.log("toggling "+req.params.roomid+" => "+req.params.switchid+" value = "+currUserHouseData[req.params.roomid][req.params.switchid]);
    res.send(currUserHouseData[req.params.roomid][req.params.switchid]);
    
    /* --- updating the file --- */
    fs.writeFile('./users_data/'+currUser.homeFile, JSON.stringify(currUserHouseData),  function(err) {
        if (err) {
            return console.error(err);
        }
        console.log("Data written successfully!");
    });
    
});

/* ------------------------------ ------------------------------hardware code------------------------------ ------------------------------ */
app.get('/getsetswitch',function(req,res){
    //convert JSON to 2D array
    var switch_in_array;
    var h = ["room1", "room2", "room3", "room4"];
    
    //CONVERSION CODE GOES HERE
        
    res.send(switch_in_array);
});

/**
*
*    IMPLEMENT SERVER-SENT EVENTS - imp concept
*
**/

var server = app.listen(8080, function () {  
  var host = server.address().address  
  var port = server.address().port  
  console.log("Example app listening at http://%s:%s", host, port)  
});

/*
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
*/
