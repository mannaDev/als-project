var vjson;
var user;
var roomNames = {"room1":"Bedroom", "room2":"Kitchen", "room3":"Bath Room", "room4":"Hallway", "room5":"Dining Room"};
var hostAddress = "https://nanna.website/";

var myAngularApp = angular.module('myAngularApp',[]);
myAngularApp.controller('myController',function($scope, $http){
    
    /*----------Initialisation-----------*/
    $scope.pageContent = "Your Home";
    
    $http.get(hostAddress+"getUsername")
    .then(function(response) {
        $scope.username = response.data;
/*        console.log("Angular ===>> "+$scope.username);*/
    });
    
    $http.get(hostAddress+"getHouseData")
    .then(function(response) {
        $scope.homeStatus = response.data;
        /*
        console.log("Angular ===>> "+JSON.stringify($scope.homeStatus));
        
        for(x in $scope.homeStatus) {
            for(j=1;j<=$scope.homeStatus[x].length;j++){
                console.log("Room"+x+" Switch"+j+" = "+$scope.homeStatus[x][j-1]);
            }
        }*/
    });
    
    /*------------------------------ FUNCTIONALITIES------------------------------------*/
    
    $scope.selectedRoom = function(room){
        $scope.selectedRoomId = room;
        $scope.selectedRoomName = roomNames[room];
    }
    
    $scope.switchFunc = function(switchID){
        console.log($scope.selectedRoomId+" switch"+switchID);
        //toggling the switch
        toggleSwitch($scope.selectedRoomId,switchID);
        $scope.homeStatus[$scope.selectedRoomId][switchID] = !$scope.homeStatus[$scope.selectedRoomId][switchID];
        //sending the toggled data to the server
    }
    
    function toggleSwitch(selectedRoom, selectedSwitch){
        var link = hostAddress+"toggle/"+selectedRoom+"/"+selectedSwitch;
        var switchStatus;
        console.log(link);
        $http.get(link)
        .then(function(response) {
            console.log("recvd :"+response.data);
            switchStatus = response.data;
            return switchStatus;
        });
    }
    
    $scope.logout = function(){
        console.log("Logging OUT");
        window.open(hostAddress+"logout","_self");
    }
});