exports.uploads = require('./uploads');
exports.article = require('./article');
exports.region = require('./region');
exports.error = require('./error');
exports.ajax = require('./ajax');

exports.top = function (req, res, next) {
	res.render('top.hbs');
};

exports.companyInfo = function (req, res, next) {
    res.render("companyInfo.hbs");
};

