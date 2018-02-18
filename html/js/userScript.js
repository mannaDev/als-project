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
	$scope.wifiInputPasswordType = 'password';
	
		//Date and Time Implementation
	$scope.date = new Date();
	var tick = function() {
		$scope.clock = Date.now();
	}
	tick();
	$interval(tick, 1000);
	//------------------------------------end
	
	
    $http.get(hostAddress+"getUsername")
    .then(function(response) {
        $scope.username = response.data;
    });
    
    $http.get(hostAddress+"getHouseData")
    .then(function(response) {
        $scope.homeStatus = response.data.appliances;
		$scope.ssid = response.data.wifiCredentials.ssid;
		$scope.ssid_pwd = response.data.wifiCredentials.pwd;
    });
    
    /*------------------------------ FUNCTIONALITIES------------------------------------*/
    $interval(function(){                        //autorefreshing the page data
		$http.get(hostAddress+"getHouseData")
		.then(function(response) {
			$scope.homeStatus = response.data.appliances;
		});
	},500);
	
    $scope.ifDesktop = function(){
        if($window.innerWidth>425)
            return true;
        else
            return false;
    }
	
	//** ----------------------- SHOW-HIDE Wifi Settings page -----------------------
	$scope.hideShowPassword=function(){
		if ($scope.wifiInputPasswordType == 'password')
		  $scope.wifiInputPasswordType = 'text';
		else
		  $scope.wifiInputPasswordType = 'password';
	}	
	$scope.enableSettings = function(){
		if($('#settingsTab').hasClass('showSettingsTabWindow'))
			$('#settingsTab').removeClass('showSettingsTabWindow');
		else
			$('#settingsTab').addClass('showSettingsTabWindow');
		
	}
	$(window).click(function() {
		if($('#settingsTab').hasClass('showSettingsTabWindow'))
			$('#settingsTab').removeClass('showSettingsTabWindow');
	});
	//  ----------------------------------  END
	
	$scope.submitWifiSettings=function(){
		var dataObj = {
			wifi_SSID: $scope.wifi_SSID,
			wifi_password: $scope.wifi_password
		};
		
		var link=hostAddress+'setWIFI';
		
		$http({
			method: 'POST',
			url: link,
			data: "message=" + JSON.stringify(dataObj),
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		}).then(function (response) {
			$scope.PostDataResponse = response.data; //not used yet
		});
	}
	
    $scope.selectedRoom = function(room){
        $scope.selectedRoomId = room;
        $scope.selectedRoomName = roomNames[room];
    }
    
    $scope.switchFunc = function(switchID){
        //toggling the switch & sending the toggled data to the server
		toggleSwitch($scope.selectedRoomId,switchID);
    }
    
    function toggleSwitch(selectedRoom, selectedSwitch){
        var link = hostAddress+"toggle/"+selectedRoom+"/"+selectedSwitch;
                
        $http.get(link)
        .then(function(response) {
            $scope.homeStatus[selectedRoom][selectedSwitch]=response.data;;
            return;
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