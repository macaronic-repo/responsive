angular.module('yeobidmodule',['ngRoute','angular-loading-bar','ngAnimate', 'ui-rangeSlider'])

.config(function($routeProvider){

$routeProvider
.when('/',
{
templateUrl: 'main.html',
controller: 'testController'
})
.when('/search',
{
templateUrl: 'search.html',
controller: 'searchController'
})
.when('/productDetail',
{
templateUrl: 'productDetail.html',
controller: 'productDetailController'
})
.when('/login',
{
templateUrl: 'login.html',
controller: 'LoginController'
})
.otherwise({
redirectTo: '/'
});
})


.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
				console.log('enter clicked');
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
})


.factory('searchService',function($http){
return {
search : function(callback){
$http
({
method : 'GET',
cache: false,
//url : 'http://localhost:8080/YeoBidService/Rest/appService/search'
//url: 'http://localhost:8080/YeoBidService/searchresults.json'
url : 'http://localhost:8080/YeoBidService/OnlineSellers.json'
}).success(callback);
}
};
})

.service('sharedProperties', function () {
		var product;
		var userSession;
		var lastPath;
		var results;
		
        return {
            getProduct: function () {
                return product;
            },
            setProduct: function(value) {
                product = value;
            },
            getUserSession: function () {
                return userSession;
            },
            setUserSession: function(value) {
            	userSession = value;
            },
            getLastPath: function () {
                return lastPath;
            },
            setLastPath: function(value) {
            	lastPath = value;
            },
            getResults: function () {
                return results;
            },
            setResults: function(value) {
                results = value;
            }
            
        };
})


.filter('pricerangefilter',function() {
    return function( items,MaxPrice,MinPrice ) {
        var filtered = [];
        var min = parseInt(MinPrice);
        var max = parseInt(MaxPrice);
        // If time is with the range
    	console.log('filtered invoked');

        angular.forEach(items, function(item) {
			//console.log(item);
            if( item.worstPrice >= min && item.worstPrice <= max ) {
				//console.log('inserted');
                filtered.push(item);
            }
	})
	//console.log(filtered);
        return filtered;
    }
})

.controller('testController', function($scope,$location,$http,searchService,sharedProperties,$filter,$window){
//	$scope.userSession = $cookies.get('userSession');
	$scope.userSession = angular.fromJson(sessionStorage.userSession);
	console.log(angular.fromJson(sessionStorage.userSession));
	$scope.location = $location.path();
	sharedProperties.setLastPath('#/');
$scope.showMap = 'true';
$scope.Math = window.Math;

$scope.userSession = function(){
	if($scope.userSession!=null){
		return true;
	}else{
		return false;
	}
	
}

$scope.search = function(name){
$scope.results = null;
$scope.showMap = 'false';
$location.path('/search');
$scope.location = $location.path();
var resultsArray = [];
var vendorArray = [];
var VijaySalesPrice  = null;
var VijaySalesurl = null;
var FlipkartPrice = null;
var Flipkarturl = null;
searchService.search(function(data){
	var clearSearchResults = true;
	//productService.product = null;
	$scope.results = null;
 var jsonObject = angular.fromJson(data.records);
 var parsedModels = [];
 var jsonSortedArray;
 $scope.MaxPrice = 0;
 $scope.BestPrice = 1000000000;

for (i = 0; i < data.records.length; i++) {
        //  var currentModel = data.records[i].model;
	  var currentModel = (data.records[i].productBrand).trim();
          vendorArray = [];
          if(parsedModels.indexOf(currentModel)>-1){
			  continue;
		  }
		  else{
          parsedModels.push(currentModel);
          var uniqueDataArray = $.grep(jsonObject, function (data) {
		     return data.model == currentModel;
          });
         onlineVendorsCount = 0;
         offlineVendorsCount = 0;
         BestPrice = 0;
    	 MaxPrice = 0;
         for(j=0;j<uniqueDataArray.length;j++){
        	 var vendorurl = uniqueDataArray[j].vendorurl;
        	 var vendorprice = uniqueDataArray[j].vendorprice;

        	 vendorArray.push({"vendorurl":vendorurl,"vendorprice":vendorprice});
        	 if(vendorurl!=null){onlineVendorsCount = onlineVendorsCount + 1;}
        	 else{offlineVendorsCount = offlineVendorsCount + 1;}
        	 if(vendorprice!=0){
        	 if(j==0){BestPrice = vendorprice; MaxPrice = vendorprice;
        	 }else{BestPrice = Math.min(BestPrice,vendorprice);
        	 MaxPrice = Math.max(MaxPrice,vendorprice);}
        	 }
			/* if(uniqueDataArray[j].vendor.toLowerCase().indexOf('vijay')>-1){
				VijaySalesPrice = uniqueDataArray[j].vendorprice;
				VijaySalesurl = uniqueDataArray[j].vendorurl;
			}
			 else if(uniqueDataArray[j].vendor.toLowerCase().indexOf('flipkart')>-1){
				FlipkartPrice = uniqueDataArray[j].vendorprice;
				Flipkarturl = uniqueDataArray[j].vendorurl;
			 }*/
		 }
		/* var price1; var price2;var price1max; var price2max;
		 if(VijaySalesPrice){price1 = VijaySalesPrice;price1max=VijaySalesPrice;$scope.MaxPrice = Math.max($scope.MaxPrice,price1);$scope.MinPrice = Math.min($scope.MinPrice,price1);}
		else{price1 = 1000000000;price1max=0;}
		 if(FlipkartPrice){price2 = FlipkartPrice;price2max=FlipkartPrice;$scope.MaxPrice = Math.max($scope.MaxPrice,price2);$scope.MinPrice = Math.min($scope.MinPrice,price2);}
		else{price2 = 1000000000;price2max=0;}*/
		//console.log(vendorArray);
		//BestPrice = Math.min.apply(Math, vendorArray);//Math.min(price1,price2);
		// MaxPrice = Math.max.apply(Math, vendorArray); //Math.max(price1max,price2max);
		// console.log(BestPrice);console.log(MaxPrice);
		
		resultsArray.push({ 'model': uniqueDataArray[0].model, 'brand': uniqueDataArray[0].brand,
		'features': uniqueDataArray[0].features, 'retailprice':uniqueDataArray[0].retailprice,
		'vendors':vendorArray,'bestPrice':BestPrice,'worstPrice':MaxPrice,'offlineVendorsCount':offlineVendorsCount
		,'onlineVendorsCount' : onlineVendorsCount});

		FlipkartPrice = null;
		VijaySalesPrice = null;
		VijaySalesurl = null;
		Flipkarturl = null;
		
		$scope.BestPrice = Math.min($scope.BestPrice,BestPrice);
		$scope.MaxPrice = Math.max($scope.MaxPrice,MaxPrice);
      }
         
          
}


$scope.prslider = {
        			min: $scope.BestPrice,
        			max: $scope.MaxPrice
        		};
var el = angular.element( document.querySelector( '#rs' ) );

el.attr('min',$scope.BestPrice);
el.attr('max',$scope.MaxPrice);


clearSearchResults = false;
//$scope.results = angular.fromJson(data);
$scope.results = resultsArray;
sharedProperties.setResults(resultsArray);
console.log($scope.results);
});
}

//$scope.prfilter = $filter('pricerangefilter')($scope.results, $scope.MaxPrice, 28000);

$scope.logout = function() {
	sharedProperties.setUserSession(null);
	$scope.userSession = null;
	sessionStorage.userSession = null;
}

})

.controller('searchController', function($scope,$location,$http,sharedProperties){
$scope.userSession = angular.fromJson(sessionStorage.userSession);
$scope.results = sharedProperties.getResults();

$scope.showMap = 'false';
$scope.productDetail = function(result){
$scope.product = result;
$location.path('/productDetail');
//productService.product = result;
sharedProperties.setProduct(result);
}
})

.controller('productDetailController', function($scope,$location,$http,sharedProperties){
sharedProperties.setLastPath('/');
$scope.registerBidResult = null;
$scope.userSession = angular.fromJson(sessionStorage.userSession);
//$scope.userSession = $cookies.get('userSession');
console.log($scope.userSession);
$scope.showMap = 'false';
$scope.product = sharedProperties.getProduct(); //productService.product;
var userID = angular.fromJson(sessionStorage.userID);
console.log(userID);
sharedProperties.setLastPath('/productDetail');

$scope.bid = function() {
$http({
    url: "http://localhost:8080/YeoBidService/Rest/appService/registeruserbid",
    data : $.param({
        'productName' : $scope.product.model,
        'bestPrice' : $scope.product.bestPrice,
        'bidPrice' : $scope.bidPrice,
        'qty' : $scope.qty,
        'userID' : userID
    }),
    header : {
        'Content-Type' : 'application/json'
    },
    method: "POST"
}).then(function(response) {
    var result  = angular.fromJson(response.data);
    $scope.registerBidResult = result[0].status;
})
}

})

.controller('LoginController', function($scope,$location,$http,sharedProperties,$window){
$scope.userSession = sharedProperties.getUserSession();
$scope.showMap = 'false';
$scope.registerResult = null;
//$scope.product = productService.product;
$scope.registerBtnDisabled = 'false';
$scope.registerUser = function() {

    $http({
        url: "http://localhost:8080/YeoBidService/Rest/appService/registeruser",
        data : $.param({
            'name' : $scope.username,
            'email' : $scope.useremail,
            'password' : $scope.userpassword
        }),
        header : {
            'Content-Type' : 'application/json'
        },
        method: "POST"
    }).then(function(response) {
        console.log(response.data);
        var result = angular.fromJson(response.data);
        $scope.registerResult = result[0].status;
        console.log($scope.registerResult);
        if($scope.registerResult == "Success"){
        	sharedProperties.setUserSession(result[0].name);
        	$scope.userSession = result[0].name;
        	$scope.registerBtnDisabled = 'true';
        	console.log(sharedProperties.getLastPath());
        	$location.path(sharedProperties.getLastPath());
        	sessionStorage.userSession = JSON.stringify($scope.userSession);
        	sessionStorage.userID = JSON.stringify(result[0].userID);
        	//$cookies.put('userSession', $scope.userSession);
        	//$window.sessionStorage["userSession"] = $scope.userSession;
        }else{
        	$scope.userSession = null;
        	sessionStorage.userSession = null;
        }
    });

 
    
}


$scope.loginUser = function() {

    $http({
        url: "http://localhost:8080/YeoBidService/Rest/appService/getuser",
        data : $.param({
            'email' : $scope.userloginemail,
            'password' : $scope.userloginpassword
        }),
        header : {
            'Content-Type' : 'application/json'
        },
        method: "POST"
    }).then(function(response) {
        console.log(response.data);
        var result = angular.fromJson(response.data);
        $scope.loginResult = result[0].status;
        console.log($scope.loginResult);
        if($scope.loginResult == "Success"){
        	sharedProperties.setUserSession(result[0].name);
        	$scope.userSession = result[0].name;
        	$scope.loginBtnDisabled = 'true';
        	$location.path(sharedProperties.getLastPath());
        	console.log(sharedProperties.getLastPath());
        	sessionStorage.userSession = JSON.stringify($scope.userSession);
        	sessionStorage.userID = JSON.stringify(result[0].userID);
        	//$cookies.put('userSession', $scope.userSession);
        	//$window.sessionStorage["userSession"] = $scope.userSession;
        }else{
        	sharedProperties.setUserSession(null);
        	$scope.userSession = null;
        	sessionStorage.userSession = null;
        }
    });
}

$scope.registerSeller = function() {
	  $http({
	        url: "http://localhost:8080/YeoBidService/Rest/appService/registerseller",
	        data : $.param({
	        	 'name' : 'Gaurish',
	             'email' : 'gsharma@seller.com',
	             'phone' : '98283932220',
	             'password' : 'gsharma',
	             'regid' : 'abcdefg22'
	        }),
	        header : {
	            'Content-Type' : 'application/json'
	        },
	        method: "POST"
	    }).then(function(response) {
	        console.log(response.data);
	    });
}

$scope.registerSellerBid = function() {
	  $http({
	        url: "http://localhost:8080/YeoBidService/Rest/appService/registerSellerBid",
	        data : $.param({
	        	 'sellerID' : '1',
	             'bidID' : '4',
	             'sellerPrice' : '42000'
	        }),
	        header : {
	            'Content-Type' : 'application/json'
	        },
	        method: "POST"
	    }).then(function(response) {
	        console.log(response.data);
	    });
}

$scope.getActiveBids = function() {
	  $http({
	        url: "http://localhost:8080/YeoBidService/Rest/appService/getActiveBids",
	        method: "GET"
	    }).then(function(response) {
	        console.log(response.data);
	    });
}

$scope.getSellerBids = function() {
	  $http({
	        url: "http://localhost:8080/YeoBidService/Rest/appService/getSellerBids",
	        data : $.param({
	        	 'sellerID' : '1'
	        }),
	        header : {
	            'Content-Type' : 'application/json'
	        },
	        method: "POST"
	    }).then(function(response) {
	        console.log(response.data);
	    });
}
    
})




.controller('resultsController', function($scope,$routeParams,$http,$filter){
$scope.param = $routeParams.countryParam;
})

.filter('encodeURI', function(){
return window.encodeURI;
});

