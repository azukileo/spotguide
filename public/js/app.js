var AppRouter = Backbone.Router.extend({
	routes: {
		"menu-items/new": "itemForm",
		"menu-items/:item": "itemDetails"
	},

	initialize: function  () {
		console.log("app.js initialize start");
		this.threadCollections = new ThreadCollections();
		this.threadModel = new ThreadModel();
		this.threadView = new ThreadsView();
	},

});

var app = new AppRouter();

$(function() {
	Backbone.history.start();
});