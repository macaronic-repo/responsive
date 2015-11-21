angular.module('yeobidmodule',['ngRoute','angular-loading-bar','ngAnimate', 'ui-rangeSlider', 'infinite-scroll'])

.value('$anchorScroll', angular.noop)

.config(function($routeProvider){

$routeProvider
.when('/',
{
templateUrl: 'main.html',
controller: 'mainController'
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
.when('/account',
{
templateUrl: 'account.html',
controller: 'AccountController'
})
.when('/checkout',
{
templateUrl: 'checkout.html',
controller: 'CheckoutController'
})
.when('/cart',
{
templateUrl: 'cart.html',
controller: 'CartController'
})
.otherwise({redirectTo: '/'});

})


.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
				//console.log('enter clicked');
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
})

  .filter('split', function() {
        return function(input, splitChar, splitIndex) {
            // do some bounds checking here to ensure it has that index
            return input.split(splitChar)[splitIndex];
        }
  })

.factory('searchService',function($http,sharedProperties){
return {
search : function(callback){
	var serviceUrl = null;
	if(sharedProperties.getQuery()!=null){
		serviceUrl = sharedProperties.getSolrURL() + "solr/select?q="+sharedProperties.getQuery()+""+ "&wt=json&facet=true&facet.field=productBrand&rows=50";
	}else{serviceUrl = sharedProperties.getServiceURL() + 'bidzilla/OnlineSellers.json';
}
	console.log(serviceUrl);
$http
({
method : 'GET',
cache: true,
url : serviceUrl
}).success(callback);
}
};
})

.run(function($rootScope) {
	$rootScope.$on("$routeChangeSuccess", function (event, currentRoute, previousRoute) {

	    window.scrollTo(0, 0);


  })
  
})

.service('searchServiceHandler' , function(searchService,sharedProperties,$q,$timeout){
	 return {
         search: function (search) {
        	 var deferred = $q.defer();
        	
        	 var resultsArray = [];
        		var vendorArray = [];
	searchService.search(function(data){
		 var parsedModels = [];
		 var parsedBrands = [];
		 var filteredBrands = [];
	     var currentSKU;
		 var brandArray = [];
		 var brandsArray = [];
		 var jsonSortedArray;
		 queryrResultsArray = [];
		 var jsonObject = angular.fromJson(data.response.docs);

	// $scope.MaxPrice = 0;
	// $scope.BestPrice = 1000000000;
	//console.log(jsonObject);
	 
	for (i = 0; i < data.response.docs.length; i++) {
	        //  var currentModel = data.records[i].model;
		if((data.response.docs[i].productSKU)!=null && (data.response.docs[i].productPrice)!=null){
		 // var currentModel = (data.response.docs[i].productSKU).toString().trim().replace("[",'').replace("]",'').replace(/ +/g,"");
			  var currentModel = (data.response.docs[i].productSKU).toString().trim().replace(/\W/g, '').replace(/ +/g,"");

			if(data.response.docs[i].productBrand !=null){
			currentBrand = data.response.docs[i].productBrand.trim().split(" ")[0];
		}else{currentBrand = 'Misc';
		}
	          vendorArray = [];
	          if(parsedModels.indexOf(currentModel)>-1){
				  continue;
			  }
			  else{
	          parsedModels.push(currentModel);
	          var uniqueDataArray = $.grep(jsonObject, function (data) {
	        	  if(data.productSKU!=null){
	        		  var ps = (data.productSKU).toString().trim().replace(/\W/g, '').replace(/ +/g,"");
	        		 // console.log("currentModel => " + currentModel);
	        		 // console.log((data.productSKU).toString().trim().replace("[",'').replace("]",'').replace(/ +/g,"") + " ->" +  currentModel);
	        		 // if((data.productSKU).toString().trim().replace("[",'').replace("]",'').replace(/ +/g,"") == currentModel){
	        		  if(ps == currentModel){
	        		  return true;
	        		  }
	        		  else if(ps.indexOf(currentModel)>=0){
	        			  parsedModels.push(ps);
	        			  return true;
	        		  }
	        		  else if(currentModel.indexOf(ps)>=0){
	        			  parsedModels.push(ps);
	        			  return true;
	        		  }
	        	  }else{return false;}
	          });

	          
	      // console.log(uniqueDataArray);
	          
	         onlineVendorsCount = 0;
	         offlineVendorsCount = 0;
	         BestPrice = 0;
	    	 MaxPrice = 0;
	    	 var productImgArr = [];
	    	 var totalProductImgArr = [];
	    	 var productSmallImgArr = [];
	    	 var totalProductSmallImgArr = [];
	    	 var productLargeImgArr = [];
	    	 var totalProductLargeImgArr = [];
	    	 productImage = null;
	    	 var specsArray = [];
	         for(j=0;j<uniqueDataArray.length;j++){
	        	 var vendorurl = uniqueDataArray[j].url;
	        	// if( uniqueDataArray[j].productImage!=null && ((productImgArr==null)|| (productImgArr!=null && productImgArr.length<=1))){
	        	 if( uniqueDataArray[j].productImage!=null && arrayObjectIndexOf(vendorArray, uniqueDataArray[j].host , "vendorhost")<0){
	        		// productImage = uniqueDataArray[j].productImage;
	            	 var productImage = uniqueDataArray[j].productImage.toString().replace('[','').replace(']','').trim();
	        		 productImgArr= productImage.split('\n');
	        		 for(var i=0;i<=productImgArr.length-1;i++){
	        			 if(productImgArr[i]!=''){
	        				 totalProductImgArr.push(productImgArr[i]);
	        			 }
	        		 }
	        	 }
	        	 //if(uniqueDataArray[j].productSmallImage!=null && ((productSmallImgArr==null)|| (productSmallImgArr!=null && productSmallImgArr.length<=1))){
	        	 if(uniqueDataArray[j].productSmallImage!=null && arrayObjectIndexOf(vendorArray, uniqueDataArray[j].host , "vendorhost")<0 ){	
	        	 // productImage = uniqueDataArray[j].productSmallImage;
	            	 var productSmallImage = uniqueDataArray[j].productSmallImage.toString().replace('[','').replace(']','').trim();

	        		 productSmallImgArr = productSmallImage.split('\n');
	        		 for(var i=0;i<=productSmallImgArr.length-1;i++){
	        			 if(productSmallImgArr[i]!=''){
	        				 totalProductSmallImgArr.push(productSmallImgArr[i]);
	        			 }
	        		 }
	        	 }
	        	// if(uniqueDataArray[j].productZoomImage!=null && ((productLargeImgArr==null)|| (productLargeImgArr!=null && productLargeImgArr.length<=1))){
	        	 if(uniqueDataArray[j].productZoomImage!=null && arrayObjectIndexOf(vendorArray, uniqueDataArray[j].host , "vendorhost")<0 ){	
	        	 // productImage = uniqueDataArray[j].productImage;
	            	 var productLargeImage = uniqueDataArray[j].productZoomImage.toString().replace('[','').replace(']','').trim();

	        		 productLargeImgArr = productLargeImage.split('\n');
	        		 for(var i=0;i<=productLargeImgArr.length-1;i++){
	        			 if(productLargeImgArr[i]!=''){
	        				 totalProductLargeImgArr.push(productLargeImgArr[i]);
	        			 }
	        		 }
	        	 }
	        	 var vendorprice = 0;
	        	 if((uniqueDataArray[j].productPrice)!=null && (uniqueDataArray[j].productPrice)!="")
	        	 {vendorprice = (uniqueDataArray[j].productPrice).replace(/[^0-9.]/g,'').replace(".00",'').replace(".",'');}
	        	 var vendor = uniqueDataArray[j].host;
	        	 if(vendorprice!=0 && arrayObjectIndexOf(vendorArray, vendor , "vendorhost")<0){
	        	 vendorArray.push({"vendorurl":vendorurl,"vendorprice":vendorprice,"vendorhost":vendor});
	        	 if(vendorurl!=null){onlineVendorsCount = onlineVendorsCount + 1;}
	        	 else{offlineVendorsCount = offlineVendorsCount + 1;}
	        	 if(j==0){BestPrice = vendorprice; MaxPrice = vendorprice;
	        	 }else{BestPrice = Math.min(BestPrice,vendorprice);
	        	 MaxPrice = Math.max(MaxPrice,vendorprice);}
	        	 }
				
			 }
			var model,brand;
			var prodBaseFeatures = [];
			var prodFeaturesArr = [];
			if(uniqueDataArray[0].productName!=null){model = (uniqueDataArray[0].productName).replace('[','').replace(']','').trim();}else{model= null;}
			if(uniqueDataArray[0].productBrand!=null){brand = uniqueDataArray[0].productBrand.trim()}else{brand= 'Misc';}
			if(uniqueDataArray[0].productDetailedSpecs!=null){
				specsArray = uniqueDataArray[0].productDetailedSpecs.toString().replace("{",'').replace("}",'').replace(/",\"/g,"~").replace(/\"/g, "").split("~");
			}
			if(uniqueDataArray[0].productBaseFeatures!=null){
				//console.log(uniqueDataArray[0].productBaseFeatures);
				var baseFeatures = uniqueDataArray[0].productBaseFeatures.toString().replace('[','').replace(']','').trim();
				prodBaseFeatures = baseFeatures.split(',');
				for(j=0;j<prodBaseFeatures.length;j++){
					prodFeaturesArr.push({"name":prodBaseFeatures[j]});
				 }
			}
			//console.log(prodBaseFeatures);
			var specsDetails = [];
			if(specsArray!=null && specsArray.length>0){
				 for(j=0;j<specsArray.length;j++){
					 var keyVal = specsArray[j].split(':');
					 if(keyVal!=null && keyVal.length>0){
						 specsDetails.push({"name":keyVal[0],"value":keyVal[1]});
					 }
				 }
			}
			if(BestPrice!=0 && MaxPrice!=0){
			resultsArray.push({ 'model': model, 'brand': brand, 'productSKU':uniqueDataArray[0].productSKU,
			'features': prodFeaturesArr, 'specs': specsDetails, 'retailprice':uniqueDataArray[0].retailprice,
			'vendors':vendorArray,'bestPrice':BestPrice,'worstPrice':MaxPrice,'offlineVendorsCount':offlineVendorsCount
			,'onlineVendorsCount' : onlineVendorsCount,'productImage': totalProductImgArr, 'productSmallImage' : totalProductSmallImgArr
			, 'productLargeImage': totalProductLargeImgArr,'productRating':uniqueDataArray[0].productRating});
			
		//	$scope.BestPrice = Math.min($scope.BestPrice,BestPrice);
			sharedProperties.setMinPrice(Math.min(sharedProperties.getMinPrice(),BestPrice));
			//$scope.MaxPrice = Math.max($scope.MaxPrice,MaxPrice);
			sharedProperties.setMaxPrice(Math.max(sharedProperties.getMaxPrice(),MaxPrice));
	      }}
	          if(search){
	      		if(parsedBrands.indexOf(currentBrand.toUpperCase())>-1){
	      			  continue;
	      		  }
	      		  else{
	      			parsedBrands.push(currentBrand.toUpperCase());
	      			//parsedSKUs.push(data.response.docs[i].productSKU);
	      			var parsedSKUs=[];
	              var uniqueBrandArray = $.grep(jsonObject, function (data) {
	      	        if(data.productBrand == null){data.productBrand = 'MISC';}
	      	        if(data.productSKU ==null || data.productPrice == null){
	      				  parsedSKUs.push(data.productSKU);
	      				  return false;
	      	        }
	            	  if(parsedSKUs.indexOf(data.productSKU)>-1){
	      				  return false;
	      			  }
	      			  else{
	      				  parsedSKUs.push(data.productSKU);
	      				 
	      		     return (data.productBrand.trim().split(" ")[0].toUpperCase() == currentBrand.toUpperCase());
	      			  }
	              });
	             
	              if(uniqueBrandArray[0]!=null){
	      		   brandArray.push({'brand':uniqueBrandArray[0].productBrand.trim().split(" ")[0].toUpperCase(),'count':uniqueBrandArray.length});
	              }
	      		  }   
	      		
	      		sharedProperties.setBrands(brandArray);
	      		}
	}
	}

	//$scope.results = resultsArray;
	if(search){
		sharedProperties.setQueryResults(resultsArray);
	}else{
		sharedProperties.setResults(resultsArray);
	}

	deferred.resolve(resultsArray);
		//$scope.results = sharedProperties.getResults();
		
	});
        	
	return deferred.promise;
	
         }
	 }	
	 
	 function arrayObjectIndexOf(myArray, searchTerm, property) {
		    for(var i = 0, len = myArray.length; i < len; i++) {
		        if (myArray[i][property] === searchTerm) return i;
		    }
		    return -1;
		}
})



.service('sharedProperties', function ($window) {
		var product;
		var userSession;
		var lastPath;
		var results;
		var brands;
		var selectedBrand = null;
		var serviceURL = 'http://yeobid.com/';
		var solrURL = 'http://yeobid.com:8983/';
		var query;
		var queryResults;
		var filteredBrands;
		var bidwait = false;
		var location;
		var otpRequired = false;
		var maxPrice = 0;
		var minPrice = 1000000000;
		var lastViewedMap;
		
        return {
            getProduct: function () {
            	return JSON.parse(localStorage.getItem('product'));
            },
            setProduct: function(value) {
            	localStorage.setItem('product',JSON.stringify(value));
            },
            getLastViewedMap: function () {
            	return JSON.parse(localStorage.getItem('lastViewedMap'));
            },
            setLastViewedMap: function(value) {
            	localStorage.setItem('lastViewedMap',JSON.stringify(value));
            },
            getOtpRequired: function () {
                return otpRequired;
            },
            getMaxPrice: function () {
                return maxPrice;
            },
            setMaxPrice: function(value) {
            	maxPrice = value;
            },
            getMinPrice: function () {
                return minPrice;
            },
            setMinPrice: function(value) {
            	minPrice = value;
            },
            setOtpRequired: function(value) {
            	otpRequired = value;
            },
            getLocation: function () {
                return location;
            },
            setLocation: function(value) {
                location = value;
            },
            getBidwait: function () {
                return bidwait;
            },
            setBidwait: function(value) {
            	bidwait = value;
            },
            getFilteredBrands: function () {
                return filteredBrands;
            },
            setFilteredBrands: function(value) {
            	filteredBrands = value;
            },
            getQuery: function () {
            	 return JSON.parse(localStorage.getItem('query'));
            },
            setQuery: function(value) {
            	localStorage.setItem('query',JSON.stringify(value));
            },
            getSelectedBrand: function () {
                return selectedBrand;
            },
            getServiceURL: function () {
                return serviceURL;
            },
            getSolrURL: function () {
                return solrURL;
            },
            setSelectedBrand: function(value) {
            	selectedBrand = value;
            },
            getBrands: function () {
            	 return JSON.parse(localStorage.getItem('brands'));
            },
            setBrands: function(value) {
            	localStorage.setItem('brands',JSON.stringify(value));
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
               // return $window.localStorage.getItem('results');
                return JSON.parse(localStorage.getItem('results'));
            },
            setResults: function(value) {
            	//$window.localStorage.setItem('results', value);
            	localStorage.setItem('results',JSON.stringify(value));
            },
            getQueryResults: function () {
            	 return JSON.parse(localStorage.getItem('queryResults'));
            },
            setQueryResults: function(value) {
            	localStorage.setItem('queryResults',JSON.stringify(value));
            }
            
        };
})

.factory('AuthSvc',function() {
   return {
     user: {loggedIn:false,userID:0,name:null,phone:null,email:null},
     logout : function() {
        // do whatever other logout stuff you need, like deleting sessions
        this.user.loggedIn = false;
        sessionStorage.userSession = null;
        this.user.userID = 0;
     },
     login : function(result) {
        // do whatever other login stuff you need, like validating with the server
        this.user.loggedIn = true;
        this.user.userID = result.id;
        this.user.email = result.email;
        this.user.name = result.name;
        this.user.phone = result.phone;
     }
   };
})

.factory('Bids',function() {
   return {
     status : {list:null,wait:false},
     startWait : function() {
        // do whatever other logout stuff you need, like deleting sessions
       this.status.wait = true;
       this.status.bids = null;
     },
     waitOver : function(bidsList) {
        // do whatever other login stuff you need, like validating with the server
       this.status.wait = false;
       this.status.list = bidsList;
     }
   };
})

.filter('pricerangefilter',function(sharedProperties) {
    return function( items,MaxPrice,MinPrice,scope) {
        var filtered = [];
        var brandFiltered = [];
        var min = parseInt(MinPrice);
        var max = parseInt(MaxPrice);
        var brandFilter = sharedProperties.getSelectedBrand();
        var brands = sharedProperties.getFilteredBrands();
      var parsedBrands = [];
      var uniqueBrandArray=[];
      var brandArray = [];
        // If time is with the range
    	console.log('filtered invoked');
        angular.forEach(items, function(item) {
            if( item.worstPrice >= min && item.worstPrice <= max ) {
            	//if(brands==null || (brands !=null && (brands.length==0 || (item.brand!=null && brands.indexOf(item.brand)>=0)))){
            	if(brands==null || (brands !=null && (brands.length==0 || (item.brand!=null && brands.indexOf(item.brand.toUpperCase())>=0)))){
                filtered.push(item);}
            }
	})
/*	for (i = 0; i < filtered.length; i++) {
		var currentBrand = filtered.productBrand;
		if(currentBrand!=null){
		console.log("currentbrand -> "+currentBrand);
    if(parsedBrands.indexOf(currentBrand.toUpperCase())>-1){
		  continue;
	  }
	  else{
		parsedBrands.push(currentBrand.toUpperCase());
		//parsedSKUs.push(data.response.docs[i].productSKU);
		var parsedSKUs=[];
    var uniqueBrandArray = $.grep(filtered, function (data) {
      if(data.productBrand == null){data.productBrand = 'MISC';}
  	  if(parsedSKUs.indexOf(data.productSKU)>-1){
			  return false;
		  }
		  else{
			  parsedSKUs.push(data.productSKU);
	     return (data.productBrand.trim().split(" ")[0].toUpperCase() == currentBrand.toUpperCase());
		  }
    });
    if(uniqueBrandArray[0]!=null){
	   brandArray.push({'brand':uniqueBrandArray[0].productBrand.trim().split(" ")[0].toUpperCase(),'count':uniqueBrandArray.length});
    }
	  }     	
       // $scope.brands = brandArray;
      //console.log(brandArray);
      sharedProperties.setBrands(brandArray);
	}
    }*/
    	scope.filteredResults = filtered;
        return filtered;

    }


})



.controller('testController', function($scope,$location,$http,$interval,searchService,sharedProperties,searchServiceHandler,$filter,$window,$route,AuthSvc,Bids){
	$scope.obj = {};
	$scope.obj.unreadCount = 0;
	//sharedProperties.setQuery(null);
	if(sessionStorage.bitwait === 'true'){
		$scope.obj.bidwait = true;
		sharedProperties.setBidwait(true);
	}else{
		$scope.obj.bidwait = false;
		sharedProperties.setBidwait(false);
	}

	var lvMap = sharedProperties.getLastViewedMap();
	if(lvMap == null){
		lvMap = {};
	}
	sharedProperties.setLastViewedMap(lvMap);
	
	//sessionStorage.bidwait = sharedProperties.getBidWait();
	$scope.obj.bidwait = sharedProperties.getBidwait();
	$scope.bidWait = Bids.status.wait;
	if(sessionStorage.userSession !=null && sessionStorage.userSession !="undefined"){
	$scope.userSession = angular.fromJson(sessionStorage.userSession);}
	$scope.location = $location.path();
	$scope.location = sharedProperties.getLocation();
	$scope.obj.homepage = null;
	$scope.user = AuthSvc.user;
	
	
	
	//$scope.user = JSON.parse(localStorage.getItem('user')); 
	if(!$scope.user.loggedIn && JSON.parse(localStorage.getItem('user'))!=null){
		AuthSvc.login(JSON.parse(localStorage.getItem('user')));
		$scope.user = AuthSvc.user;
	}
	
	if($scope.user.loggedIn){
		$scope.obj.lastViewed = sharedProperties.getLastViewedMap()[$scope.user.userID];
	}else{
		$scope.obj.lastViewed = sharedProperties.getLastViewedMap()[0];
	}
	
	$scope.product = angular.fromJson(sessionStorage.product);
	console.log($scope.user.loggedIn);
	console.log(sharedProperties.getLastViewedMap()[$scope.user.userID]);
	sharedProperties.setLastPath('/');
	$('.zoomContainer').remove();
$scope.showMap = 'true';
$scope.Math = window.Math;



/*$interval(function(){
	console.log("$scope.user.userID -> " + $scope.user.userID);
	if($scope.user.userID!=0)
    {
	 $http({
		    url: sharedProperties.getServiceURL() + "bidzilla/Rest/appService/getuserunread",
	        data : $.param({
	        	 'userID' : $scope.user.userID
	        }),
	        header : {
	            'Content-Type' : 'application/json'
	        },
	        method: "GET"
	    }).then(function(response) {
	        console.log(response.data);
	        $scope.obj.unreadCount = response.data.count;
	    });
	}},30000);*/


$scope.userSession = function(){
	if($scope.userSession!=null){
		return true;
	}else{
		return false;
	}
	
}

//$scope.results = sharedProperties.getResults();
//console.log("results -> " + $scope.results);

//$scope.results = null;
//$scope.showMap = 'false';
$scope.location = $location.path();
var resultsArray = [];
var queryrResultsArray = [];
var vendorArray = [];
$scope.searchTerm=null;

//sharedProperties.setQuery(null);


$scope.registerSellerBid = function() {
	  $http({
	        url: sharedProperties.getServiceURL() + "bidzilla/Rest/appService/registerSellerBid",
	        data : $.param({
	        	 'sellerID' : '19',
	             'bidID' : '92',
	             'sellerPrice' : '15900',
	             'sellerOffers' : null,
	             'productName' : 'Nikon Coolpix AW130 Point & Shoot Camera (Green)',
                 'userName' : 'G Sharma',
                 'sellerName' : 'Ashu',
                 'bidPrice' : '15880',
                 'userID' : '65'
	        }),
	        header : {
	            'Content-Type' : 'application/json'
	        },
	        method: "POST"
	    }).then(function(response) {
	        console.log(response.data);
	    });
}

$scope.search = function(name){
	sharedProperties.setQueryResults(null);
	$scope.checkBrands = function(brand){
		var filteredBrands = sharedProperties.getFilteredBrands();
		if(filteredBrands==null){
			filteredBrands = [];
		}
		if($scope.selectedBrands[brand]==true){
			filteredBrands.push(brand);
		}else if($scope.selectedBrands[brand]==false){
			var index = filteredBrands.indexOf(brand);
			if (index > -1) {
				filteredBrands.splice(index, 1);
			}
			//filteredBrands.splice(brand);
		}
		 
		sharedProperties.setFilteredBrands(filteredBrands);
	}
	
	
	//Search code starts
	$scope.searchTerm=$scope.obj.query;
	sharedProperties.setQuery($scope.obj.query);
/*	$('#searchresults').addClass('loading')
    .loader('show', {
       overlay: true
   });*/
	var promise = searchServiceHandler.search(true);
	promise.then(function(){
	$scope.queryResults = sharedProperties.getQueryResults();
	//alert($scope.queryResults);

	$scope.BestPrice = sharedProperties.getMinPrice();
	$scope.MaxPrice = sharedProperties.getMaxPrice();
	

	$scope.prslider = {
	        			min: sharedProperties.getMinPrice(),
	        			max: sharedProperties.getMaxPrice()
	        		};
	var el = angular.element( document.querySelector( '#rs' ) );

	el.attr('min',sharedProperties.getMinPrice());
	el.attr('max',sharedProperties.getMaxPrice());
	//console.log($scope.BestPrice);
	//console.log($scope.MaxPrice);

	clearSearchResults = false;
	//$scope.results = angular.fromJson(data);

	//sessionStorage.results = JSON.stringify(resultsArray);
	$scope.brands = sharedProperties.getBrands();
	//console.log(brandArray);
	//sharedProperties.setBrands(brandArray);
	//console.log($scope.results);

	$scope.home = false;

	
		//	$scope.queryResults = queryrResultsArray;
			//sharedProperties.setQueryResults(queryrResultsArray);
			if($location.path().indexOf('search')>=0){
				$route.reload();
			}else{
			$location.path('/search');
			}
			//$('#searchresults').removeClass('loading').loader('hide');
	})
}
//Search code ends

if($location.path().indexOf('search')>=0){
	$scope.obj.query = sharedProperties.getQuery();
	$scope.search(sharedProperties.getQuery());
	//$scope.queryResults  = sharedProperties.getQueryResults();
}else{
	var promise = searchServiceHandler.search(false);
	promise.then(function(){
	$scope.results = sharedProperties.getResults();
	
	$scope.BestPrice = sharedProperties.getMinPrice();
	$scope.MaxPrice = sharedProperties.getMaxPrice();
	})
}

$scope.searchCategory = function(category){
	sharedProperties.setQuery(category);
	$scope.obj.query = sharedProperties.getQuery();
	$scope.search(sharedProperties.getQuery());
}

//$scope.prfilter = $filter('pricerangefilter')($scope.results, $scope.MaxPrice, 28000);
function arrayObjectIndexOf(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}

$scope.logout = function() {
	sharedProperties.setUserSession(null);
	$scope.userSession = null;
	sessionStorage.userSession = null;
	AuthSvc.logout();
	localStorage.setItem('user',null);
	$scope.obj.lastViewed = sharedProperties.getLastViewedMap()[0];
	//$scope.$apply();
}

$scope.productDetail = function(result){
	$scope.product = result;
	//console.log($scope.product);
	$location.path('/productDetail');
	//productService.product = result;
	sharedProperties.setProduct(result);
	sessionStorage.product = JSON.stringify(result);
	}

})

.controller('searchController', function($scope,$location,$http,sharedProperties){
$scope.brandFilter = null;
$('.zoomContainer').remove();
$scope.obj.homepage = false;
sharedProperties.setLocation('/search');
$scope.location = '/search';
if(sessionStorage.userSession !=null && sessionStorage.userSession !="undefined"){
$scope.userSession = angular.fromJson(sessionStorage.userSession);}
//$scope.results = sharedProperties.getResults();
$scope.results = sharedProperties.getResults();

//$scope.queryResults = sharedProperties.getQueryResults();
$scope.queryResults = sharedProperties.getQueryResults();
//console.log("in search -> " + $scope.queryResults);
$scope.queryTerm = sharedProperties.getQuery();
$scope.brands = sharedProperties.getBrands();
//console.log($scope.brands);
//$scope.showMap = 'false';
//$scope.filteredResults = [];
$scope.productDetail = function(result){
$scope.product = result;
//console.log($scope.product);
$location.path('/productDetail');
//productService.product = result;
sharedProperties.setProduct(result);
//sessionStorage.product = JSON.stringify(result);
$scope.prslider.max = sharedProperties.getMaxPrice();
$scope.prslider.min = sharedProperties.getMinPrice();
}


$scope.priceUpdated = function(){
	var filtered = sharedProperties.getQueryResults();
	var parsedBrands = [];
	var uniqueBrandArray = [];
	var brandArray = [];
	var maxprice = $scope.prslider.max;
	var minprice = $scope.prslider.min;
	//alert(maxprice);
	for (i = 0; i < filtered.length; i++) {
		var currentBrand = filtered[i].brand;
		if(currentBrand!=null){
		//console.log("currentbrand -> "+currentBrand);
    if(parsedBrands.indexOf(currentBrand.toUpperCase())>-1){
		  continue;
	  }
	  else{
		parsedBrands.push(currentBrand.toUpperCase());
		//parsedSKUs.push(data.response.docs[i].productSKU);
		var parsedSKUs=[];
    var uniqueBrandArray = $.grep(filtered, function (data) {
    	//console.log(data.bestPrice + " " + minprice + " " + maxprice);
      if(data.brand == null){data.brand = 'MISC';}
  	  if(parsedSKUs.indexOf(data.productSKU)>-1){
			  return false;
		  }
  	  else if (data.bestPrice!=0 && (data.bestPrice < minprice || data.bestPrice > maxprice)){
  		  return false;
  	  }
		  else{
			  parsedSKUs.push(data.productSKU);
	     return (data.brand.trim().split(" ")[0].toUpperCase() == currentBrand.toUpperCase());
		  }
    });
    if(uniqueBrandArray[0]!=null){
	   brandArray.push({'brand':uniqueBrandArray[0].brand.trim().split(" ")[0].toUpperCase(),'count':uniqueBrandArray.length});
    }
	  }     	
        $scope.brands = brandArray;
       // console.log($scope.brands);
        $scope.$apply();
      sharedProperties.setBrands(brandArray);
	}
    }
}

$scope.modQuery = function(brand){
	//$scope.query = $scope.query + " " + brand.brand;
	$scope.brandFilter = brand.brand;
	sharedProperties.setSelectedBrand(brand.brand);
	//console.log($scope.query);
}

})

.controller('mainController', function($scope,sharedProperties,searchService,searchServiceHandler,AuthSvc){
	//$scope.results = sharedProperties.getResults();
	$scope.results = sharedProperties.getResults();
	console.log($scope.results);
    sharedProperties.setLocation('/');
	var resultsArray = [];
	var vendorArray = [];
	$scope.obj.homepage = true;
	$scope.searchTerm=null;
	
	var lvMap = sharedProperties.getLastViewedMap();
	if(lvMap == null){
		lvMap = {};
	}
	sharedProperties.setLastViewedMap(lvMap);
	
	$scope.user = AuthSvc.user;
	
	if($scope.user.loggedIn){
		$scope.obj.lastViewed = sharedProperties.getLastViewedMap()[$scope.user.userID];
	}else{
		$scope.obj.lastViewed = sharedProperties.getLastViewedMap()[0];
	}

	sharedProperties.setQuery(null);
	if(sharedProperties.getResults()==null || (sharedProperties.getResults()!=null && sharedProperties.getResults().length==0)){
		var promise = searchServiceHandler.search(false);
		promise.then(function(){
		$scope.results = sharedProperties.getResults();
		
		$scope.BestPrice = sharedProperties.getMinPrice();
		$scope.MaxPrice = sharedProperties.getMaxPrice();
		})
	}
	
	function arrayObjectIndexOf(myArray, searchTerm, property) {
	    for(var i = 0, len = myArray.length; i < len; i++) {
	        if (myArray[i][property] === searchTerm) return i;
	    }
	    return -1;
	}
	
})

.controller('productDetailController', function($scope,$location,$http,sharedProperties,$route,$window,AuthSvc){
	sharedProperties.setLastPath('/');
	$scope.user = AuthSvc.user;
	if(!$scope.user.loggedIn && JSON.parse(localStorage.getItem('user'))!=null){
		AuthSvc.login(JSON.parse(localStorage.getItem('user')));
		$scope.user = AuthSvc.user;
	}
	console.log($scope.user);
	var lvMap = sharedProperties.getLastViewedMap();
	if(lvMap == null){
		lvMap = {};
	}
	//var lvMap = {};
	sharedProperties.setLastViewedMap(lvMap);
	//alert(lvMap.size);
$scope.registerBidResult = null;
$scope.product = null;
$scope.obj.homepage = false;
if(sessionStorage.userSession !=null && sessionStorage.userSession !="undefined"){
$scope.userSession = angular.fromJson(sessionStorage.userSession);}
//$scope.obj.bidwait = sharedProperties.getBidwait();
$scope.obj.bidwait = false;
$scope.logintobid = function(){
	$location.path('/login');
}
//$scope.userSession = $cookies.get('userSession');
//console.log($scope.userSession);
$scope.showMap = 'false';
$scope.qty=1;
//$scope.product = sharedProperties.getProduct(); //productService.product;
$scope.product = sharedProperties.getProduct();

if(!lvMap[$scope.user.userID]){
	var jsonArr = [];
	jsonArr.push($scope.product);
	lvMap[$scope.user.userID] = jsonArr;
	sharedProperties.setLastViewedMap(lvMap);
}else{
	var arr = lvMap[$scope.user.userID];
	var hasMatch = false;
	for (var index = 0; index < arr.length; ++index) {

		 var model = arr[index].model;

		 if(model == $scope.product.model){
		   hasMatch = true;
		   break;
		 }
		}
	//alert(hasMatch);
	if(!hasMatch){
		arr.push($scope.product);
		if(arr.length==7){
			arr.splice(0,1);
		}
	}
	lvMap[$scope.user.userID] = arr;
	}
   var lvLength = lvMap[$scope.user.userID].length;
   var counter = lvLength-1;
   var jArr = lvMap[$scope.user.userID];
   for(var i=6;i>lvLength;i--){
	   var arr = jArr[counter];
	   jArr.push(arr); 
	   if(counter!=0){
		   counter --;
	   }
   }
   lvMap[$scope.user.userID] = jArr;
   
	sharedProperties.setLastViewedMap(lvMap);
	console.log(lvMap[$scope.user.userID]);


$scope.obj.lastViewed = sharedProperties.getLastViewedMap()[$scope.user.userID];

//console.log($scope.product);
$('#img_01').attr('src', $scope.product.productImage[0]);	
	$('#img_01').attr('data-zoom-image', $scope.product.productLargeImage[0]);	
	$('#img_01').elevateZoom();
	
var userID = angular.fromJson(sessionStorage.userID);
//console.log(userID);
sharedProperties.setLastPath('/productDetail');

$.fn.stars = function() {
    return $(this).each(function() {
        // Get the value
        var val = $scope.product.productRating;
        // Make sure that the value is in 0 - 5 range, multiply to get width
        var size = Math.max(0, (Math.min(5, val))) * 16;
        // Create stars holder
        var $span = $('<span />').width(size);
        // Replace the numerical value with stars
        $(this).html($span);
    });
}

$('span.stars').stars();

$scope.bidslider = {
		 range: {
		        min: 0,
		        max: $scope.product.bestPrice
		    },
		valueA: $scope.product.bestPrice,
		valueB: 0
	};

$scope.linkElevateZoom =  function() {
	
    //Check if its not empty
  //  if (!attrs.zoomImage) return;
  //  element.attr('data-zoom-image',attrs.zoomImage);
   // $(element).elevateZoom();
  }

$scope.changeImage = function(index){
	var img = $('#img_01');
	img.elevateZoom();

	img.attr('src', $scope.product.productImage[index]);	
 	img.attr('data-zoom-image', $scope.product.productLargeImage[index]);	

 	$('.zoomContainer').remove();
	img.removeData('elevateZoom');
	img.removeData('zoomImage');

	img.elevateZoom();
	
 	
}


$scope.bid = function() {
	var productImage = '';
	if($scope.product.productImage!=null && $scope.product.productImage[0]!=null){
		productImage = $scope.product.productImage[0];
	}
	console.log("productImage = " + productImage);
$http({
    url: sharedProperties.getServiceURL() + "bidzilla/Rest/appService/registeruserbid",
    data : $.param({
        'productName' : $scope.product.model,
        'bestPrice' : $scope.product.bestPrice,
        'bidPrice' : $scope.bidslider.valueA,
        'qty' : $scope.qty,
        'userID' : userID,
        'productSKU' : $scope.product.productSKU,
        'productImage' : productImage
    }),
    header : {
        'Content-Type' : 'application/json'
    },
    method: "POST"
}).then(function(response) {
    var result  = angular.fromJson(response.data);
    $scope.registerBidResult = result[0].status;
    if($scope.registerBidResult == 'Success'){
    	//$scope.obj.bidwait = true;
    	//sharedProperties.setBidwait(true);
    	$('#trigger-overlay').trigger('click');
    }
})
}

$scope.openLoader = function(){
	$scope.obj.bidwait = true;
	sharedProperties.setBidwait(true);
	sessionStorage.bitwait = true;
	registerBidResult = null;
}

$scope.productDetail = function(result){
	$scope.product = result;
	//console.log($scope.product);
	//$location.path('/productDetail');
	//productService.product = result;
	//sharedProperties.setProduct(result);
	sessionStorage.product = JSON.stringify(result);
	var img = $('#img_01');
	img.elevateZoom();

	img.attr('src', $scope.product.productImage[0]);	
 	img.attr('data-zoom-image', $scope.product.productLargeImage[0]);	

 	$('.zoomContainer').remove();
	img.removeData('elevateZoom');
	img.removeData('zoomImage');

	img.elevateZoom();
	 $(window).scrollTop(0);
	}

})

.controller('LoginController', function($scope,$location,$http,sharedProperties,$window,AuthSvc){
$scope.userSession = sharedProperties.getUserSession();
$scope.showMap = 'false';
$scope.obj.homepage = false;
$scope.registerResult = null;
$scope.otpRequired = sharedProperties.getOtpRequired();
//$scope.product = productService.product;
$scope.registerBtnDisabled = 'false';
$('.zoomContainer').remove();

$scope.registerUser = function() {
	 $scope.registerResult = null;
    $http({
        url: sharedProperties.getServiceURL() + "bidzilla/Rest/appService/registeruserotp",
        data : $.param({
            'name' : $scope.username,
            'email' : $scope.useremail,
            'password' : $scope.userpassword,
            'phone' : $scope.userphone
        }),
        header : {
            'Content-Type' : 'application/json'
        },
        method: "POST"
    }).then(function(response) {
    	 console.log(response);
        console.log(response.data);
        var result = angular.fromJson(response.data);
        $scope.registerResult = result[0].status;
        
        console.log($scope.registerResult);
        if($scope.registerResult == "Success"){
        	$scope.userID = result[0].userID;
        	$scope.otpRequired = true;
        	sharedProperties.setOtpRequired(true);
        }else if(result[0].message !=null){
        	$scope.userSession = null;
        	sessionStorage.userSession = null;
        	$scope.errorMsgOnRegistration = result[0].message;
        	$scope.userpassword = '';
        }
        else{
        	$scope.userSession = null;
        	sessionStorage.userSession = null;
        	$scope.errorMsgOnRegistration = "There was a problem in registration. Please try again!";
        }
    },function(){
    	$scope.userSession = null;
    	sessionStorage.userSession = null;
    	$scope.errorMsgOnRegistration = "There was a problem in registration. Please try again!";
    });
    
    
}

$scope.registerUserConfirm = function() {
  	 $scope.registerResult = null;
      $http({
          url: sharedProperties.getServiceURL() + "bidzilla/Rest/appService/registeruserconfirm",
          data : $.param({
              'userID' : $scope.userID,
              'OTP' : $scope.userOTP
          }),
          header : {
              'Content-Type' : 'application/json'
          },
          method: "POST"
      }).then(function(response) {
        //  console.log(response.data);
          var result = angular.fromJson(response.data);
          $scope.registerResult = result[0].status;
          console.log($scope.registerResult);
          if($scope.registerResult == "Success"){
         	sharedProperties.setUserSession(result[0].name);
          	$scope.userSession = result[0].name;
          	$scope.registerBtnDisabled = 'true';
          	console.log(sharedProperties.getLastPath());
          	 $scope.username = '';
               $scope.useremail = '';
               $scope.userpassword = '';
               $scope.userphone = '';
          	//$location.path(sharedProperties.getLastPath());
          	sessionStorage.userSession = JSON.stringify($scope.userSession);
          	sessionStorage.userID = JSON.stringify(result[0].userID);
          	$scope.successMsgOnRegistration = result[0].message;
          	//$cookies.put('userSession', $scope.userSession);
          	//$window.sessionStorage["userSession"] = $scope.userSession;
          	//AuthSvc.login();
        	$scope.otpRequired = false;
        	sharedProperties.setOtpRequired(false);
          }else if(result[0].message !=null){
          	$scope.userSession = null;
          	sessionStorage.userSession = null;
          	$scope.errorMsgOnRegistration = result[0].message;
          	$scope.userpassword = '';
          }
          else{
          	$scope.userSession = null;
          	sessionStorage.userSession = null;
          	$scope.errorMsgOnRegistration = "There was a problem in registration. Please try again!";
          }
      },function(){
		$scope.userSession = null;
      	sessionStorage.userSession = null;
      	$scope.errorMsgOnRegistration = "There was a problem in registration. Please try again!";
    });
}


$scope.loginUser = function() {

    $http({
        url: sharedProperties.getServiceURL() + "bidzilla/Rest/appService/getuser",
        data : $.param({
            'email' : $scope.userloginemail,
            'password' : $scope.userloginpassword
        }),
        header : {
            'Content-Type' : 'application/json'
        },
        method: "POST"
    }).then(function(response) {
      //  console.log(response.data);
        var result = angular.fromJson(response.data);
        console.log(result);
        //$scope.loginResult = result[0].status;
      //  console.log($scope.loginResult);
        if(result.name!=null){
        	sharedProperties.setUserSession(result.name);
        	$scope.userSession = result.name;
        	$scope.loginBtnDisabled = 'true';
        	$location.path(sharedProperties.getLastPath());
        	console.log(sharedProperties.getLastPath());
        	sessionStorage.userObj = JSON.stringify(result);
        	sessionStorage.userSession = JSON.stringify($scope.userSession);
        	sessionStorage.userID = JSON.stringify(result.id);       	
        	AuthSvc.login(result);
        	localStorage.setItem('user',JSON.stringify(result));

        }else{
        	sharedProperties.setUserSession(null);
        	$scope.userSession = null;
        	sessionStorage.userSession = null;
        	$scope.loginResult = "Error";
        }
    },function(){
    	sharedProperties.setUserSession(null);
    	$scope.userSession = null;
    	sessionStorage.userSession = null;
    	$scope.loginResult = "Error";
    });
}

$scope.registerSeller = function() {
	  $http({
	        url: sharedProperties.getServiceURL() + "bidzilla/Rest/appService/registerseller",
	        data : $.param({
	        	 'name' : 'Gaurish',
	             'email' : 'gsharma@seller.com',
	             'phone' : '98283932220',
	             'password' : 'gs',
	             'regid' : 'hello123'
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
	        url: sharedProperties.getServiceURL() + "bidzilla/Rest/appService/registerSellerBid",
	        data : $.param({
	        	 'sellerID' : '19',
	             'bidID' : '89',
	             'sellerPrice' : '5600',
	             'sellerOffers' : 'Free home delivery'
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
	        url: sharedProperties.getServiceURL() + "bidzilla/Rest/appService/getActiveBids",
	        data : $.param({
	        	 'sellerID' : '11'
	        }),
	        header : {
	            'Content-Type' : 'application/json'
	        },
	        method: "POST"
	    }).then(function(response) {
	        console.log(response.data);
	    });
}

$scope.getSellerBids = function() {
	  $http({
	        url: sharedProperties.getServiceURL() + "bidzilla/Rest/appService/getSellerBids",
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


.controller('AccountController', function($scope,$location,$routeParams,$http,$filter,sharedProperties,AuthSvc,Bids,$interval,$q){
$scope.user = AuthSvc.user;
$scope.tab = 1;
$scope.conversation = null;
$scope.bidsResult = null;
$scope.activeBid = null;
$scope.activeIndex = 0;
$scope.activeParentIndex = 0;
var promise;
$scope.changeTab = function(tabNo){
	$scope.tab = tabNo;
	if(tabNo===2){
		if($scope.user.userID!=0)
		{
		 $http({
		      //  url: sharedProperties.getServiceURL() + "bidzilla/Rest/appService/getuserprocessedbids",
			    url: sharedProperties.getServiceURL() + "bidzilla/Rest/appService/getusersellersconversation",
		        data : $.param({
		        	 'userID' : $scope.user.userID
		        }),
		        header : {
		            'Content-Type' : 'application/json'
		        },
		        method: "POST"
		    }).then(function(response) {
		        console.log(response.data);
		        Bids.waitOver(response.data);
		        var totalUnreadCount = 0;
		        angular.forEach(response.data, function(r) {
		        	totalUnreadCount = totalUnreadCount + r.unread;
		        });
		        $scope.obj.unreadCount = totalUnreadCount;
		        $scope.bidWait = Bids.status.wait;
		        $scope.processedBidsList = Bids.status.list;
		        if($scope.processedBidsList!=null && $scope.processedBidsList[0]!=null && 
		        		$scope.processedBidsList[0].userBidsSellerUpdates!=null && 
		        		$scope.processedBidsList[0].userBidsSellerUpdates[0]!=null){
		        	$scope.conversation = $scope.processedBidsList[0].userBidsSellerUpdates[0].updates;
		        	$scope.sellerPrice = $scope.processedBidsList[0].userBidsSellerUpdates[0].updates[0].sellerPrice;
		    		$scope.sellerOffers = $scope.processedBidsList[0].userBidsSellerUpdates[0].updates[0].sellerOffers;
		    		$scope.sellerBidID = $scope.processedBidsList[0].userBidsSellerUpdates[0].updates[0].sellerBidID;
		    		$scope.activeBidID = $scope.processedBidsList[0].userBidsSellerUpdates[0].updates[0].bidID;
		        	$scope.bidsResult = $scope.processedBidsList[0];
		        	$scope.activeBid = $scope.processedBidsList[0].userBidsSellerUpdates[0];
		        	$scope.activeIndex = 0;
		        	$scope.activeParentIndex = 0;
		        	$scope.childIndex = 0;
		        	$scope.parentIndex = 0;
		        }
		        $('#activeBids').removeClass('loading').loader('hide');
		    });
		}
	}
};

if(!$scope.user.loggedIn && JSON.parse(localStorage.getItem('user'))!=null){
	AuthSvc.login(JSON.parse(localStorage.getItem('user')));
	$scope.user = AuthSvc.user;
}
console.log($scope.user.userID);
$scope.updateUserResult = null;
$scope.obj.homepage = false;
if(!$scope.user.loggedIn){
	$location.path('/login');
	sharedProperties.setLastPath('/account');
}else{
	//code to be done for account
	//$scope.user = angular.fromJson(sessionStorage.userObj);
	if($scope.user!=null){
		$scope.useraccname = $scope.user.name;
		$scope.useraccemail= $scope.user.email;
		$scope.useraccphone= $scope.user.phone;
	}
	sharedProperties.setLastPath('/account');

//$scope.getUserBidsUpdates =  function(){
	console.log("$scope.user.userID -> " + $scope.user.userID);
	if($scope.user.userID!=0)
	{
	 $http({
	      //  url: sharedProperties.getServiceURL() + "bidzilla/Rest/appService/getuserprocessedbids",
		    url: sharedProperties.getServiceURL() + "bidzilla/Rest/appService/getuseractivebids",
	        data : $.param({
	        	 'userID' : $scope.user.userID
	        }),
	        header : {
	            'Content-Type' : 'application/json'
	        },
	        method: "POST"
	    }).then(function(response) {
	    	console.log(response.data);
	    	$scope.myBids = response.data;
	    	$scope.activeBidIndex = 0;
	    	$scope.myBid = $scope.myBids[0];
	    });
	 
	 
	}
	
	$scope.addToCartFromAcc = function(bestPrice,bestOffers,bestSellerBidID,bidID){
		console.log(bestPrice + " " + bestOffers + " " + bestSellerBidID + " " + bidID);
		$http({
			    url: sharedProperties.getServiceURL() + "bidzilla/Rest/appService/addbidtocart",
		        data : $.param({
		        	 'bestPrice' : bestPrice,
		        	 'bestOffers' : bestOffers,
		        	 'bestSellerBidID' : bestSellerBidID,
		        	 'bidID' : bidID
		        }),
		        header : {
		            'Content-Type' : 'application/json'
		        },
		        method: "POST"
		    }).then(function(response) {
		    	console.log(response.data);
		    	$location.path('/cart');
		    });
	};
	
	$scope.showConversations = function(result,r,childIndex,parentIndex){
		$scope.conversation = r.updates;
		$scope.sellerPrice = r.updates[0].sellerPrice;
		$scope.sellerOffers = r.updates[0].sellerOffers;
		$scope.sellerBidID = r.updates[0].sellerBidID;
		$scope.activeBidID = r.updates[0].bidID;
		$scope.bidsResult = result;
    	$scope.activeBid = r;
    	$scope.childIndex = childIndex;
    	$scope.parentIndex = parentIndex;
    	$scope.activeIndex = childIndex;
    	$scope.activeParentIndex = parentIndex;
	};
	
	$scope.showMyBid = function(r,currentIndex){
		$scope.myBid = r;
		$scope.activeBidIndex = currentIndex;
	};
	
	$scope.set_color = function(currentIndex,parentIndex){
		if(currentIndex===$scope.activeIndex && parentIndex === $scope.activeParentIndex){
			return { background: "rgba(254, 152, 15, 0.75)" }
		}
	};
	
	$scope.set_active_color = function(currentIndex){
		if(currentIndex===$scope.activeBidIndex){
			return { background: "rgba(254, 152, 15, 0.75)" }
		}
	};
	
	$http({
		    url: sharedProperties.getServiceURL() + "bidzilla/Rest/appService/setuserread",
	        header : {
	            'Content-Type' : 'application/json'
	        },
	        method: "GET"
	    }).then(function(response) {
	       console.log(response.data);
	    });
	
	 $scope.start = function() {
	      // stops any running interval to avoid two intervals running at the same time
	      $scope.stop(); 
	      
	      // store the interval promise
	 	 promise = $interval(getUserSellerConversations, 30000);
	    };
	    
	 // stops the interval
	    $scope.stop = function() {
	      $interval.cancel(promise);
	    };
	 
	function getUserSellerConversations(){
		 $http({
			 url: sharedProperties.getServiceURL() + "bidzilla/Rest/appService/getusersellersconversation",
		        data : $.param({
		        	 'userID' : $scope.user.userID
		        }),
		        header : {
		            'Content-Type' : 'application/json'
		        },
		        method: "POST"
		    }).then(function(response) {
		        console.log(response.data);
		        Bids.waitOver(response.data);
		        var totalUnreadCount = 0;
		        angular.forEach(response.data, function(r) {
		        	totalUnreadCount = totalUnreadCount + r.unread;
		        });
		        $scope.obj.unreadCount = totalUnreadCount;
		        $scope.bidWait = Bids.status.wait;
		        $scope.processedBidsList = Bids.status.list;
		        if($scope.processedBidsList!=null && $scope.processedBidsList[$scope.activeParentIndex]!=null && 
		        		$scope.processedBidsList[$scope.activeParentIndex].userBidsSellerUpdates!=null && 
		        		$scope.processedBidsList[$scope.activeParentIndex].userBidsSellerUpdates[$scope.activeIndex]!=null){
		        	$scope.conversation = $scope.processedBidsList[$scope.activeParentIndex].userBidsSellerUpdates[$scope.activeIndex].updates;
		        	$scope.sellerPrice = $scope.processedBidsList[$scope.activeParentIndex].userBidsSellerUpdates[$scope.activeIndex].updates[0].sellerPrice;
		    		$scope.sellerOffers = $scope.processedBidsList[$scope.activeParentIndex].userBidsSellerUpdates[$scope.activeIndex].updates[0].sellerOffers;
		    		$scope.sellerBidID = $scope.processedBidsList[$scope.activeParentIndex].userBidsSellerUpdates[$scope.activeIndex].updates[0].sellerBidID;
		    		$scope.activeBidID = $scope.processedBidsList[$scope.activeParentIndex].userBidsSellerUpdates[$scope.activeIndex].updates[0].bidID;
		    		$scope.bidsResult = $scope.processedBidsList[$scope.activeParentIndex];
		        	$scope.activeBid = $scope.processedBidsList[$scope.activeParentIndex].userBidsSellerUpdates[$scope.activeIndex];
		        	$scope.childIndex = $scope.activeIndex;
		        	$scope.parentIndex = $scope.activeParentIndex;
		        }
		    });
		};
		
		$scope.start();
		
		 $scope.$on('$destroy', function() {
		      $scope.stop();
		    });
}

$scope.addConversation = function(result,r,userMessage,childIndex,parentIndex){
	 $http({
		    url: sharedProperties.getServiceURL() + "bidzilla/Rest/appService/addusersellerconversations",
	        data : $.param({
	        	 'userID' : $scope.user.userID,
	        	 'sellerID' :r.SellerID,
	        	 'bidID' : result.bidID,
	        	 'sellerBidID' : r.updates[0].sellerBidID,
	        	 'update' : userMessage,
	        	 'updatedBy' : 'U',
	        	 'status' : '1',
	        	 'productName' : result.productName,
	        	 'sellerName' : r.sellerName,
	        	 'userName' : $scope.user.name
	        }),
	        header : {
	            'Content-Type' : 'application/json'
	        },
	        method: "POST"
	    }).then(function(response) {
	        console.log(response.data);
	        Bids.waitOver(response.data);
	        $scope.bidWait = Bids.status.wait;
	        $scope.processedBidsList = Bids.status.list;
	        $scope.userMessage = "";
	        if($scope.processedBidsList!=null && $scope.processedBidsList[parentIndex]!=null && 
	        		$scope.processedBidsList[parentIndex].userBidsSellerUpdates!=null && 
	        		$scope.processedBidsList[parentIndex].userBidsSellerUpdates[childIndex]!=null){
	        	$scope.conversation = $scope.processedBidsList[parentIndex].userBidsSellerUpdates[childIndex].updates;
	        	$scope.sellerPrice = $scope.processedBidsList[parentIndex].userBidsSellerUpdates[childIndex].updates[0].sellerPrice;
	    		$scope.sellerOffers = $scope.processedBidsList[parentIndex].userBidsSellerUpdates[childIndex].updates[0].sellerOffers;
	    		$scope.sellerBidID = $scope.processedBidsList[parentIndex].userBidsSellerUpdates[childIndex].updates[0].sellerBidID;
	    		$scope.activeBidID = $scope.processedBidsList[parentIndex].userBidsSellerUpdates[childIndex].updates[0].bidID;
	    		$scope.bidsResult = $scope.processedBidsList[parentIndex];
	        	$scope.activeBid = $scope.processedBidsList[parentIndex].userBidsSellerUpdates[childIndex];
	        	$scope.activeIndex = childIndex;
	        }
	    });
	
}

$scope.editUser = function(){
	$scope.updateUserResult = null;
	 $http({
		    url: sharedProperties.getServiceURL() + "bidzilla/Rest/appService/editUser",
	        data : $.param({
	        	 'userID' : $scope.user.userID,
	        	 'name' :$scope.useraccname,
	        	 'email' : $scope.useraccemail,
	        	 'password' : $scope.useraccpassword,
	        	 'phone' : $scope.useraccphone
	        }),
	        header : {
	            'Content-Type' : 'application/json'
	        },
	        method: "POST"
	    }).then(function(response) {
	    	  var result = angular.fromJson(response.data);
	          console.log(result);
	        if(result.name!=null){
	        AuthSvc.login(response.data);
	        $scope.updateUserResult = 'Success';
	        }
	        else{
	        	$scope.updateUserResult = 'Error';
	        }
	    });
	
}


})

.controller('CheckoutController', function($scope,$location,$routeParams,$http,$filter,sharedProperties,AuthSvc){
$scope.user = AuthSvc.user;
if(!$scope.user.loggedIn && JSON.parse(localStorage.getItem('user'))!=null){
	AuthSvc.login(JSON.parse(localStorage.getItem('user')));
	$scope.user = AuthSvc.user;
}
console.log($scope.user.userID);

})

.controller('CartController', function($scope,$location,$routeParams,$http,$filter,sharedProperties,AuthSvc){
$scope.user = AuthSvc.user;
if(!$scope.user.loggedIn && JSON.parse(localStorage.getItem('user'))!=null){
	AuthSvc.login(JSON.parse(localStorage.getItem('user')));
	$scope.user = AuthSvc.user;
}
$http({
	    url: sharedProperties.getServiceURL() + "bidzilla/Rest/appService/getcartbids",
      data : $.param({
      	 'userID' : $scope.user.userID
      }),
      header : {
          'Content-Type' : 'application/json'
      },
      method: "POST"
  }).then(function(response) {
  	console.log(response.data);
  	$scope.cartBids = response.data;
  });

$scope.getTotal = function(){
    var total = 0;
    if($scope.cartBids!=null){
    for(var i = 0; i < $scope.cartBids.length; i++){
        var product = $scope.cartBids[i];
        total += (product.finalPrice * product.qty);
    }
    }
    return total;
};

$scope.removeFromCart = function(bidID){
	console.log(bidID);
	$http({
		    url: sharedProperties.getServiceURL() + "bidzilla/Rest/appService/removefromcart",
	        data : $.param({
	        	 'bidID' : bidID,
	        	 'userID' : $scope.user.userID
	        }),
	        header : {
	            'Content-Type' : 'application/json'
	        },
	        method: "POST"
	    }).then(function(response) {
	    	console.log(response.data);
	    });
};

})


.controller('resultsController', function($scope,$routeParams,$http,$filter){
$scope.param = $routeParams.countryParam;
})

.filter('encodeURI', function(){
return window.encodeURI;
});

