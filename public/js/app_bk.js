var AppRouter = Backbone.Router.extend({
	routes: {
		"": "list",
		"menu-items/new": "itemForm",
		"menu-items/:item": "itemDetails"
	},

	events: {
		'click input[name="switch-z"]:checked': 'linkClicked'
	},

	initialize: function  () {
		console.log("app.js initialize start");
		this.menuItems = new MenuItems();

		this.menuItemModel = new MenuItem();
		this.menuItemView = new MenuItemDetails(
			{
				model: this.menuItemModel
			}
		);

		this.menuView = new MenuView({collection: this.menuItems});
		this.menuItemForm = new MenuItemForm({model: new MenuItem()});
		this.questionnaire = this.$(".show_questionnaire");
	},

	list: function () {
		$('#app').html(this.menuView.render().el);
	},

	itemDetails: function (item) {
		this.menuItemView.model = this.menuItems.get(item);
		$('#app').html(this.menuItemView.render().el);
	},

	itemForm: function () {
		$('#app').html(this.menuItemForm.render().el);
	},

	linkClicked: function(e) {
		console.log("linkClicked");
		$('input[name="switch-z"]').click(function () {
        	if($(this).prop('checked')){
            	this.questionnaire.show();
            	console.log('checked');
        	} else {
				this.questionnaire.hide();
				console.log('unchecked');
        	}
    	})
	}
});

var app = new AppRouter();

$(function() {
	Backbone.history.start();
});