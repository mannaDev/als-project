var vjson;
var user;
var roomNames = {"room1":"Bedroom", "room2":"Kitchen", "room3":"Bath Room", "room4":"Hallway", "room5":"Dining Room"};
var hostAddress = "https://nanna.website/";

var myAngularApp = angular.module('myAngularApp',[]);
myAngularApp.controller('myController',function($scope, $http, $window,	$interval){
    
    /*----------Initialisation-----------*/
    $scope.pageContent = "Your Home";
    $scope.selectedRoomName = "Bedroom";
    $scope.selectedRoomId = "room1";
	
    $http.get(hostAddress+"getUsername")
    .then(function(response) {
        $scope.username = response.data;
    });
    
    $http.get(hostAddress+"getHouseData")
    .then(function(response) {
        $scope.homeStatus = response.data;
    });
    
    /*------------------------------ FUNCTIONALITIES------------------------------------*/
    $interval(function(){                        //autorefreshing the page data
		$http.get(hostAddress+"getHouseData")
		.then(function(response) {
			$scope.homeStatus = response.data;
		});
	},500);
	
    $scope.ifDesktop = function(){
        if($window.innerWidth>425)
            return true;
        else
            return false;
    }
	
    /*$scope.ifMobile = function(){
        if($window.innerWidth<=425)
            return true;
        else
            return false;
    }*/
	
    $scope.selectedRoom = function(room){
        $scope.selectedRoomId = room;
        $scope.selectedRoomName = roomNames[room];
    }
    
    $scope.switchFunc = function(switchID){
        console.log($scope.selectedRoomId+" switch"+switchID);
        //toggling the switch & sending the toggled data to the server
        $scope.homeStatus[$scope.selectedRoomId][switchID] = toggleSwitch($scope.selectedRoomId,switchID);
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
        window.open(hostAddress+"logout","_self");
    }
	
	$scope.autoManualMode = function(){
		$http.get(hostAddress+"reset/"+$scope.autoManualFlag).then(function(response) {
                console.log(response.data);
            });
    }	
});