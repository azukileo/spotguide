var util = require('util'),
	hbs = require('hbs'),
	models = require('../models'),
	CategoryModel = models.CategoryModel;

// Error
// 404用のエラー
// リクエストされたURIを受け取ることができる。
function NotFound(path) {
	Error.call(this, 'Not Found');
	Error.captureStackTrace(this, this.constructor); // stacktraceの格納
	this.name = 'Not Found';
	this.path = path;
}

util.inherits(NotFound, Error);

exports.NotFound = NotFound;

exports.notFoundHandler = function(err, req, res, next) {
	if (err instanceof NotFound) {
	 	hbs.registerHelper('makeErrorMessages', function (errors) {
			console.log("++++++++  makeErrorMessages +++++++");
			var resArray = String(errors).split(",");
			var out = "<ul class='center'>";
			for (var i=0, l=resArray.length; i<l; i++) {
				out = out + "<li>" + resArray[i] + "</li>"
			}
			out = out + "</li>";
			return new hbs.SafeString(out);
		});
		res.render('error.hbs', {
		  errors: "お探しのページは見つかりません。Page Not Found."
		});
	} else if (err.name === "Forbidden") {
	 	hbs.registerHelper('makeErrorMessages', function (errors) {
			console.log("++++++++  makeErrorMessages +++++++");
			var resArray = String(errors).split(",");
			var out = "<ul class='center'>";
			for (var i=0, l=resArray.length; i<l; i++) {
				out = out + "<li>" + resArray[i] + "</li>"
			}
			out = out + "</li>";
			return new hbs.SafeString(out);
		});
		res.render('error.hbs', {
		  errors: "閲覧禁止エラー(Forbidden Error)です。"
		});
	} else if (err.status == 413) {
	 	hbs.registerHelper('makeErrorMessages', function(errors) {
			console.log("++++++++  makeErrorMessages +++++++");
			console.log("errors = " + errors);
			var resArray = String(errors).split(",");
			var out = "<ul class='center'>";
			for(var i=0, l=resArray.length; i<l; i++) {
				out = out + "<li>" + resArray[i] + "</li>"
			}
			out = out + "</li>";
			console.log("out = " + out);
			return new hbs.SafeString(out);
		});
		console.log("error.hbsへ");

		res.render('error.hbs', {
		  errors: "ファイルサイズが大きすぎます。ファイルサイズは2MBまでです。"
		});
	} else if (err.status == 404) {
	 	hbs.registerHelper('makeErrorMessages', function(errors) {
			console.log("++++++++  makeErrorMessages +++++++");
			console.log("errors = " + errors);
			var resArray = String(errors).split(",");
			var out = "<ul class='center'>";
			for(var i=0, l=resArray.length; i<l; i++) {
				out = out + "<li>" + resArray[i] + "</li>"
			}
			out = out + "</li>";
			console.log("out = " + out);
			return new hbs.SafeString(out);
		});
		console.log("error.hbsへ");

		res.render('error.hbs', {
		  errors: "お探しのページは見つかりません。"
		});
	} else {
		return next(err);
	}
}

exports.errorHandler = function(err, req, res, next) {
	console.error(err.stack);
	res.render('sysError.hbs', {
		status: 500,
		title: '500 Internal Server Error',
		err: err
	});
};