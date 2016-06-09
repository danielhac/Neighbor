var app = angular.module("NeApp", []);

app.factory('WebSiteService', function($http) {
	var findAll = function(callback) { // Connects down below
		$http.get('/api/website')
		.success(callback);
	};
	var create = function(website, callback) {
		$http.post('/api/website', website)
		.success(callback);
	};
	var createReply = function(id, reply, callback) {
		$http.post('/api/website/'+id+'/rreplys', reply)
		.success(callback);
	};
	var remove = function(id, callback) {
		$http.delete('/api/website/'+id)
		.success(callback);
	};
	var update = function(id, site, callback) {
		$http.put('/api/website/'+id, site)
		.success(callback);
	}
	// var createReply = function(id, callback) {
	// 	$http.post('/api/website/'+id+'/rreplys', id)
	// 	.success(callback);
	// };
	return {
		create: create,
		findAll: findAll,
		remove: remove,
		createReply: createReply,
		update: update
	};
});

app.controller("NeController", function ($scope, $http, WebSiteService) {
	WebSiteService.findAll(function (response) { // Connects up above
		$scope.websites = response;
	}); 

	$scope.add = function(website) {
		WebSiteService.create(website, function (response) {
			$scope.websites = response;
		});
	}

	$scope.addd = function(id, rreplys) {
		WebSiteService.createReply(id, rreplys, function (response) {
			$scope.websites = response;
		});
		// alert(rreplys);
	}

	$scope.remove = function(id) {
		WebSiteService.remove(id, function (response) {
			$scope.websites = response;
		});
	}
	// $scope.aaddd = function(id) {
	// 	alert(id);

	// 	// 1. Get id of doc
	// 	// 2. Post reply into that id
	// }


});