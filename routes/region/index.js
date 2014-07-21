var async = require('async'),
    logger = require('../../public/js/lib/logger.js'),
    models = require('../../models'),
    constant = require('../../config/const'),
	hbs = require('hbs'),
	sanitize = require('validator').sanitize,
    Validator = require('validator').Validator,
    ArticleModel = models.ArticleModel;

exports.showRegionList = function (req, res, next) {
	var hokkaidoCnt,tohokuCnt,kantoCnt,chubuCnt,kansaiCnt,chugokuCnt,shikokuCnt,kyushuCnt;
	async.series([
		function (callback) {
			ArticleModel.count()
			.where('prefectureCd').equals(constant.PREFECTURES.HOKKAIDO)
        	.sort({create_date: 'desc'})
        	.exec( function (err, hokkaidoCount) {
        		if (err) {
	                callback(err);
	                return;
        		}
        		hokkaidoCnt = hokkaidoCount;
        		callback();
        	});
		},
		function (callback) {
			ArticleModel.count()
    		.where('prefectureCd').in([constant.PREFECTURES.AOMORI,constant.PREFECTURES.IWATE,constant.PREFECTURES.MIYAGI,constant.PREFECTURES.AKITA,constant.PREFECTURES.YAMAGATA,constant.PREFECTURES.FUKUSHIMA])
        	.sort({create_date: 'desc'})
        	.exec( function (err, tohokuCount) {
        		if (err) {
	                callback(err);
	                return;
        		}
        		tohokuCnt = tohokuCount;
        		callback();
        	});
		},
		function (callback) {
			ArticleModel.count()
    		.where('prefectureCd').in([constant.PREFECTURES.IBARAGI,constant.PREFECTURES.TOCHIGI,constant.PREFECTURES.GUNMA,constant.PREFECTURES.SAITAMA,constant.PREFECTURES.CHIBA,constant.PREFECTURES.TOKYO,constant.PREFECTURES.KANAGAWA])
        	.sort({create_date: 'desc'})
        	.exec( function (err, kantoCount) {
        		if (err) {
	                callback(err);
	                return;
        		}
        		kantoCnt = kantoCount;
        		callback();
        	});
		},
		function (callback) {
			ArticleModel.count()
    		.where('prefectureCd').in([constant.PREFECTURES.NIIGATA,constant.PREFECTURES.TOYAMA,constant.PREFECTURES.ISHIKAWA,constant.PREFECTURES.FUKUI,constant.PREFECTURES.YAMANASHI,constant.PREFECTURES.NAGANO,constant.PREFECTURES.GIFU,constant.PREFECTURES.SHIZUOKA,constant.PREFECTURES.AICHI])
        	.sort({create_date: 'desc'})
        	.exec( function (err, chubuCount) {
        		if (err) {
	                callback(err);
	                return;
        		}
        		chubuCnt = chubuCount;
        		callback();
        	});
		},
		function (callback) {
			ArticleModel.count()
    		.where('prefectureCd').in([constant.PREFECTURES.MIE,constant.PREFECTURES.SHIGA,constant.PREFECTURES.KYOTO,constant.PREFECTURES.OSAKA,constant.PREFECTURES.HYOGO,constant.PREFECTURES.NARA,constant.PREFECTURES.WAKAYAMA])
        	.sort({create_date: 'desc'})
        	.exec( function (err, kansaiCount) {
        		if (err) {
	                callback(err);
	                return;
        		}
        		kansaiCnt = kansaiCount;
        		callback();
        	});
		},
		function (callback) {
			ArticleModel.count()
    		.where('prefectureCd').in([constant.PREFECTURES.TOTTORI,constant.PREFECTURES.SHIMANE,constant.PREFECTURES.OKAYAMA,constant.PREFECTURES.HIROSHIMA,constant.PREFECTURES.YAMAGUCHI])
        	.sort({create_date: 'desc'})
        	.exec( function (err, chugokuCount) {
        		if (err) {
	                callback(err);
	                return;
        		}
        		chugokuCnt = chugokuCount;
        		callback();
        	});
		},
		function (callback) {
			ArticleModel.count()
    		.where('prefectureCd').in([constant.PREFECTURES.TOKUSHIMA,constant.PREFECTURES.KAGAWA,constant.PREFECTURES.EHIME,constant.PREFECTURES.KOUCHI])
        	.sort({create_date: 'desc'})
        	.exec( function (err, shikokuCount) {
        		if (err) {
	                callback(err);
	                return;
        		}
        		shikokuCnt = shikokuCount;
        		callback();
        	});
		},
		function (callback) {
			ArticleModel.count()
    		.where('prefectureCd').in([constant.PREFECTURES.FUKUOKA,constant.PREFECTURES.SAGA,constant.PREFECTURES.NAGASAKI,constant.PREFECTURES.KUMAMOTO,constant.PREFECTURES.OOITA,constant.PREFECTURES.MIYAZAKI,constant.PREFECTURES.KAGOSHIMA,constant.PREFECTURES.OKINAWA])
        	.sort({create_date: 'desc'})
        	.exec( function (err, kyushuCount) {
        		if (err) {
	                callback(err);
	                return;
        		}
        		kyushuCnt = kyushuCount;
        		callback();
        	});
		},
	], function (err) {
		if (err) {
            logger.error('Error: ' + err.message);
			next(err);
            return;
		}
		res.render("regionlist.hbs", {
			hokkaidoCnt: hokkaidoCnt,
			tohokuCnt: tohokuCnt,
			kantoCnt: kantoCnt,
			chubuCnt: chubuCnt,
			kansaiCnt: kansaiCnt,
			chugokuCnt: chugokuCnt,
			shikokuCnt: shikokuCnt,
			kyushuCnt: kyushuCnt
		});
	});
};

exports.showRegionHokkaido = function (req, res, next) {
    res.render('hokkaido.hbs');
};

exports.showRegionTohoku = function (req, res, next) {
    res.render('tohoku.hbs');
};

exports.showRegionKanto = function (req, res, next) {
    res.render('kanto.hbs');
};

exports.showRegionChubu = function (req, res, next) {
    res.render('chubu.hbs');
};

exports.showRegionKansai = function (req, res, next) {
    res.render('kansai.hbs');
};

exports.showRegionChugoku = function (req, res, next) {
    res.render('chugoku.hbs');
};

exports.showRegionShikoku = function (req, res, next) {
    res.render('shikoku.hbs');
};

exports.showRegionKyushu = function (req, res, next) {
    res.render('kyushu.hbs');
};