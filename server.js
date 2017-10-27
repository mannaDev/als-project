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
});


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

/*-------------------------------------- --- Login Page Loading --- --------------------------------------*/
app.get('/',function(req, res){
    res.sendFile(__dirname+"/html/login.html");
});
app.get('/login.htm*',function(req, res){
    res.sendFile(__dirname+"/html/login.html");
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

/* ----------------------------------- AUTO-MANUAL SWITCHING ----------------------------------- */
app.get('/reset/:resetStatus',function(req,res){
    if(req.params.resetStatus == "true"){
		currUserHouseData = {"room1":[false,false,false,false,false],"room2":[false,false,false,false,false],"room3":[false,false,false,false,false],"room4":[false,false,false,false,false],"room5":[false,false,false,false,false]};
		fs.writeFile('./users_data/'+currUser.homeFile, JSON.stringify(currUserHouseData),  function(err) {
			if (err) {
				return console.error(err);
			}
			res.send("RESET COMPLETE - MANUAL MODE ENABLED");
		});
	}
});

/*---------------------------------Switching action [UI to server] Code--------------------*/
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

/* ------------------------------ ------------Switching action [server to hardware] ---------- ------------------------------ */
app.get('/getswitch/:uniqueuser_id',function(req,res){
    //convert JSON to 2D array
    var status_record, switch_in_array;
    var u_id = req.params.uniqueuser_id;
    
    for(i=0;i<userCredentials.length;i++){
        if(userCredentials[i].uid == u_id){
            console.log("\n----ENTRY FOUND");
            fs.readFile('./users_data/'+userCredentials[i].homeFile,function(err,data){
                if (err)
                    res.send("file not found error");
                else{
                    console.log("file successfully read--->"+data);
                    
                    //converting JSON to text stream
                    var tempdata = JSON.stringify(JSON.parse(data));

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
                    res.send("<p id = 'requiredKey'>"+arr.toString()+"</p>");
                }
            });
            return;
        }
    }
    res.send("404");
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

var server = app.listen(8080, function () {  
  var host = server.address().address
  var port = server.address().port
  console.log("ALS-IoT SERVER IS UP AND LISTENING AT https://%s:%s", host, port);
});