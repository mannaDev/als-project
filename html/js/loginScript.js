window.onload = function(){
    document.getElementById("frontCover").style.height = window.innerHeight+"px";
}

/*
function send(data){
    console.log("sending "+data+" to the server...");
    //transmit(data);
    //Code to send the SWITCHINGCODE to the server
    var xhttp = new XMLHttpRequest();
    var link = "http://127.0.0.1:8080/?"+data;
      xhttp.open("GET",link, true);
      xhttp.setRequestHeader("Content-type", "application/json");
	  xhttp.onreadystatechange = function() {
          if (xhttp.readyState == 4 && xhttp.status == 200){
              vjson = xhttp.response;
              console.log(vjson);
              return vjson;
          }
      }	  
      xhttp.send();
}*/