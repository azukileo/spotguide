var async = require('async'),
    logger = require('../../public/js/lib/logger.js'),
    models = require('../../models'),
    constant = require('../../config/const'),
    fs = require('fs'),
    im = require('imagemagick'),
    gm = require('gm'),
    hbs = require('hbs'),
    path = require('path'),
    geoip = require('geoip'),
    moment = require('moment'),
    sanitize = require('validator').sanitize,
    Validator = require('validator').Validator,
    ArticleModel = models.ArticleModel,
    Counter = models.Counter,
    TagModel = models.TagModel;

exports.showMakeArticle = function (req, res, next) {
    async.waterfall([
        function (callback) {
            TagModel.find()
            //.sort({tag_no: 'asc'})
            .exec( function (err, tagResults) {
                if (err) {
                    logger.error('Error: ' + err.message);
                    callback(err);
                    return;
                }
                callback(null, tagResults);
            });
        }
    ], function (err, tagResults) {
        if (err) {
            logger.error("Error! : " + err.message);
            return next(err);
        }
        res.render("makeArticle.hbs", {
            tags : tagResults,
            apiid: constant.YAHOOAPI.APIID
        });
    });
};

exports.makeArticle = function (req, res, next) {
    logger.info("--- app.post(/makeArticle) in ---");

    // DB登録処理
    var tag = req.param('tag'),
    name    = req.param('name'),
    title   = req.param('title'),
    embedcode = req.param('embedcode'),
    filename1 = req.files.file1.name,
    filetype1 = req.files.file1.type,
    filepath1 = req.files.file1.path,
    prefectureCd = req.param('prefecture_cd'),
    cityCd = req.param('city_cd'),
    comment = hbs.Utils.escapeExpression(req.param('comment')),
    filepathAry = new Array(),
    article,
    validator = new Validator(),
    ipaddress = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

    logger.debug("tag = " + tag);
    logger.debug("name = " + name);
    logger.debug("title = " + title);
    logger.debug("embedcode = " + embedcode);
    logger.debug("filename1 = " + filename1);
    logger.debug("filetype1 = " + filetype1);
    logger.debug("filepath1 = " + filepath1);
    logger.debug("comment = " + comment);
    logger.debug("prefectureCd = " + prefectureCd);
    logger.debug("cityCd = " + cityCd);
    logger.debug("ipaddress = " + ipaddress);

    async.waterfall([
        function (callback) {
            validateArticle (tag,
                            name,
                            title,
                            prefectureCd,
                            cityCd,
                            embedcode,
                            filename1,
                            filetype1,
                            comment,
                            validator,
                            callback);
        },
        function (callback) {
            if (filename1 === 'image.jpg') {
                logger.debug("count up for file1");
                Counter.increment('image', function (err, result) {
                    if (err) {
                        logger.error('Error: ' + err.message);
                        callback(err);
                        return;
                    }
                    filename1 = "mobile" + result.seq + ".jpg";
                    callback();
                });
            } else {
                callback();
            }
        },
        function (callback) {

            var City = geoip.City;
            var city = new City('./geodata/GeoLiteCity.dat');

            // Synchronous method
            var city_obj = city.lookupSync(ipaddress);

            city.update('./geodata/GeoLiteCity.dat');

            var country_code, country, city;

            if (city_obj !== null && city_obj !== undefined) {
                country = city_obj.country_name;
                city = city_obj.city;
                country_code = city_obj.country_code;
                if (country_code !== undefined) {
                    country_code = country_code.toLowerCase();
                }
            } else {
                city = "unknown";
                country = "unknown";
                country_code = "xx";
            }

            article = new ArticleModel({
                ipaddress: ipaddress,
                tag: tag,
                ip_country: country,
                ip_city: city,
                ip_country_code: country_code,
                name: name,
                title: title,
                prefectureCd: prefectureCd,
                cityCd: cityCd,
                embedcode: String(embedcode),
                comment: comment,
                filename1: filename1,
            });
            callback(null, article);
		},
		function (article, callback) {
            if (filename1) {
                var newPath = __dirname + "/uploads/fullsize/" + filename1,
                tempPath = filepath1,
                targetPath = path.resolve('./uploads/fullsize/' + filename1);

                logger.debug("newPath = " + newPath);
                logger.debug('tempPath = ' + tempPath);
                logger.debug('targetPath = ' + targetPath);
                logger.debug('image type = ' + filetype1);

                // アップされた画像ファイルを検索してなければ登録する
				async.waterfall([
					function (callback2) {
		                fs.exists(targetPath, function (fileok){
		                    if (fileok) {
		                        // 同じファイルがあった場合のエラー処理
		                        // エラー画面にて同じファイルがあった旨のメッセージを表示する
		                        // あればエラー画面を表示して、同じファイルがあることを伝える
		                        var err = new Error();
		                        validator.error('同じ名前のファイルが既にあります。違うファイルにしてください。');
		                        callback(err);
		                        return;
		                    } else {
		                    	callback2();
		                    }
		                }); // fs.exists
		            },
                    function (callback2) {
                        fs.rename(tempPath, targetPath, function (err) {
                            if (err) {
                                logger.error('rename error!');
                                callback(err);
                                return;
                            }
                            logger.debug("Upload completed!");
                            callback2();
                        });
                    },
                ], function (err) {
                    if (err) {
                        logger.error('Error: ' + err.message);
                        callback(err);
                        return;
                    }
                    callback();
                });
            } else {
            	callback();
            }
        },
        function (callback) {
            // post_idをインクリメントして登録処理を行う。
            Counter.increment("article", function (err, result) {
                if (err) {
                    logger.error('Error: ' + err.message);
                    callback(err);
                    return;
                }
                article.article_no = result.seq;
                callback();
            });
        },
        function (callback) {
            article.save(function (err, result) {
                logger.debug(result);
                if (err) {
                    if(err.name === 'ValidationError') {
                        logger.error("err == " + err);
                    }
                    logger.error('Error: ' + err.message);
                    callback(err);
                    return;
                }
                res.redirect('/articles/list/japan');
            });
        },
    ], function (err) {
        if (err) {
            async.series([
                function (callback) {
                    var invalidFilepath = filepath1.split('/');
                    path.exists('./uploads/fullsize/' + invalidFilepath[2], function (exists) {
                        if(exists) {
                              fs.unlink('./uploads/fullsize/' + invalidFilepath[2], function (err) {
                                  if (err) {
                                      logger.error('Error: ' + err.message);
                                      callback(err);
                                      return;
                                  }
                                  logger.debug('invalid file deleted!');
                                  callback();
                            });
                        } else {
                        	callback();
                        }
                    });
                },
            ], function () {
                req.flash('errors', validator.getErrors());
                return res.redirect("/post/error");
            });
        }
    });
};

exports.showArticleList = function (req, res, next) {
    var local = req.params.local,
        validator = new Validator();

    if (local) {
        validator.check(local, "パラメータが正しくありません。").notNull().isAlpha();
        sanitize(local).trim();
    } else {
        validator.error('パラメータがありません。');
    }

    var errors = validator.getErrors();
    logger.debug("errors = " + errors);
    if (errors.length > 0) {
        req.flash('errors', validator.getErrors());
        return res.redirect("/post/error");
    }

    local = local.toString();
    logger.debug('local = ' + local);


    if (local === "japan") {
        ArticleModel.find()
        .sort({create_date: 'desc'})
        .exec( function (err, articleResults) {
            if (err) {
                logger.error('Error: ' + err.message);
                callback(err);
                return;
            }
            logger.debug('articles = ' + articleResults);
            hbs.registerHelper('timeformat', function (time) {
		        if (time) {
		            var m = moment(time);
		            var output = m.format("YYYY年MM月DD日 HH時mm分");
		            return new hbs.SafeString(output);
		        }
		    });
            res.render('articlelists.hbs', {
                articles: articleResults,
                picture : "/img/JapanMap.jpg",
                link : "/region/list",
                location : "日本全体"
            });
        });
    } else if (local === "hokkaido") {
    	ArticleModel.find()
    	// .where('prefectureCd').in([constant.PREFECTURES.HOKKAIDO])
    	.where('prefectureCd').equals(constant.PREFECTURES.HOKKAIDO)
        .sort({create_date: 'desc'})
        .exec( function (err, articleResults) {
            if (err) {
                logger.error('Error: ' + err.message);
                callback(err);
                return;
            }
            logger.debug('articles = ' + articleResults);
            hbs.registerHelper('timeformat', function (time) {
		        if (time) {
		            var m = moment(time);
		            var output = m.format("YYYY年MM月DD日 HH時mm分");
		            return new hbs.SafeString(output);
		        }
		    });
	        res.render('articlelists.hbs', {
	            picture : "/img/hokkaido.png",
	            articles: articleResults,
	            link : "/articles/list/hokkaido",
	            location : "北海道"
	        });
	    });
    } else if (local === "tohoku") {
    	ArticleModel.find()
    	.where('prefectureCd').in([constant.PREFECTURES.AOMORI,constant.PREFECTURES.IWATE,constant.PREFECTURES.MIYAGI,constant.PREFECTURES.AKITA,constant.PREFECTURES.YAMAGATA,constant.PREFECTURES.FUKUSHIMA])
        .sort({create_date: 'desc'})
        .exec( function (err, articleResults) {
            if (err) {
                logger.error('Error: ' + err.message);
                callback(err);
                return;
            }
	        res.render('articlelists.hbs', {
	        	articles: articleResults,
	            picture : "/img/tohoku.png",
	            link : "/articles/list/tohoku",
	            location : "東北"
	        });
	    });
    } else if (local === "kanto") {
    	ArticleModel.find()
    	.where('prefectureCd').in([constant.PREFECTURES.IBARAGI,constant.PREFECTURES.TOCHIGI,constant.PREFECTURES.GUNMA,constant.PREFECTURES.SAITAMA,constant.PREFECTURES.CHIBA,constant.PREFECTURES.TOKYO,constant.PREFECTURES.KANAGAWA])
        .sort({create_date: 'desc'})
        .exec( function (err, articleResults) {
            if (err) {
                logger.error('Error: ' + err.message);
                callback(err);
                return;
            }
	        res.render('articlelists.hbs', {
	        	articles: articleResults,
	            picture : "/img/kanto.png",
	            link : "/articles/list/kanto",
	            location : "関東"
	        });
	    });
    } else if (local === "chubu") {
    	ArticleModel.find()
    	.where('prefectureCd').in([constant.PREFECTURES.NIIGATA,constant.PREFECTURES.TOYAMA,constant.PREFECTURES.ISHIKAWA,constant.PREFECTURES.FUKUI,constant.PREFECTURES.YAMANASHI,constant.PREFECTURES.NAGANO,constant.PREFECTURES.GIFU,constant.PREFECTURES.SHIZUOKA,constant.PREFECTURES.AICHI])
        .sort({create_date: 'desc'})
        .exec( function (err, articleResults) {
            if (err) {
                logger.error('Error: ' + err.message);
                callback(err);
                return;
            }
	        res.render('articlelists.hbs', {
	        	articles: articleResults,
	            picture : "/img/chubu.png",
	            link : "/articles/list/chubu",
	            location : "中部"
	        });
	    });
    } else if (local === "kansai") {
    	ArticleModel.find()
    	.where('prefectureCd').in([constant.PREFECTURES.MIE,constant.PREFECTURES.SHIGA,constant.PREFECTURES.KYOTO,constant.PREFECTURES.OSAKA,constant.PREFECTURES.HYOGO,constant.PREFECTURES.NARA,constant.PREFECTURES.WAKAYAMA])
        .sort({create_date: 'desc'})
        .exec( function (err, articleResults) {
            if (err) {
                logger.error('Error: ' + err.message);
                callback(err);
                return;
            }
	        res.render('articlelists.hbs', {
	        	articles: articleResults,
	            picture : "/img/kansai.png",
	            link : "/articles/list/kansai",
	            location : "関西"
	        });
	    });
    } else if (local === "chugoku") {
    	ArticleModel.find()
    	.where('prefectureCd').in([constant.PREFECTURES.TOTTORI,constant.PREFECTURES.SHIMANE,constant.PREFECTURES.OKAYAMA,constant.PREFECTURES.HIROSHIMA,constant.PREFECTURES.YAMAGUCHI])
        .sort({create_date: 'desc'})
        .exec( function (err, articleResults) {
            if (err) {
                logger.error('Error: ' + err.message);
                callback(err);
                return;
            }
	        res.render('articlelists.hbs', {
	        	articles: articleResults,
	            picture : "/img/chugoku.png",
	            link : "/articles/list/chugoku",
	            location : "中国"
	        });
	    });
    } else if (local === "shikoku") {
    	ArticleModel.find()
    	.where('prefectureCd').in([constant.PREFECTURES.TOKUSHIMA,constant.PREFECTURES.KAGAWA,constant.PREFECTURES.EHIME,constant.PREFECTURES.KOUCHI])
        .sort({create_date: 'desc'})
        .exec( function (err, articleResults) {
            if (err) {
                logger.error('Error: ' + err.message);
                callback(err);
                return;
            }
	        res.render('articlelists.hbs', {
	        	articles: articleResults,
	            picture : "/img/shikoku.png",
	            link : "/articles/list/shikoku",
	            location : "四国"
	        });
	    });
    } else if (local === "kyushu") {
    	ArticleModel.find()
    	.where('prefectureCd').in([constant.PREFECTURES.FUKUOKA,constant.PREFECTURES.SAGA,constant.PREFECTURES.NAGASAKI,constant.PREFECTURES.KUMAMOTO,constant.PREFECTURES.OOITA,constant.PREFECTURES.MIYAZAKI,constant.PREFECTURES.KAGOSHIMA,constant.PREFECTURES.OKINAWA])
        .sort({create_date: 'desc'})
        .exec( function (err, articleResults) {
            if (err) {
                logger.error('Error: ' + err.message);
                callback(err);
                return;
            }
	        res.render('articlelists.hbs', {
	        	articles: articleResults,
	            picture : "/img/kyushu.png",
	            link : "/articles/list/kyushu",
	            location : "九州"
	        });
	    });
    } else {
        validator.error('パラメータが正しくありません。');
        req.flash('errors', validator.getErrors());
        return res.redirect("/post/error");
    }
};

function validateArticle (tag,
						name,
                        title,
                        prefectureCd,
                        cityCd,
                        embedcode,
                        filename1,
                        filetype1,
                        comment,
                        validator,
                        callback) {
	validator._errors = new Array();
    if (tag) {
        var correctTag = new Array();
        correctTag = ["c1","c2","c3","c4","c5","c6","c7","c8","c9","c10","c11","c12","c13"];
        var length = 0;
        if (Array.isArray(tag)){
        	length = tag.length;
        }
        for(var i=0, l = length; i<l; i++) {
            validator.check(tag[i], "不正な値を検知しました。").notNull().isAlphanumeric();
            var judge = correctTag.indexOf(tag[i]);
            if (judge === -1) {
                validator.error('タグのパラメータの値が正しくありません。');
            }
        }
    } else {
        // 必須
        validator.error('いずれかのタグをチェックしてください。');
    }
    if (title) {
        validator.check(title, "タイトルは200文字までです。").len(0,200);
        sanitize(title).trim();
    } else {
        validator.error('タイトルを入力してください。');
    }
    if (name) {
        validator.check(name, "名前は30文字までです。").len(0,30);
        sanitize(name).trim();
    } else {
        validator.error('名前を入力してください。');
    }
    if (embedcode) {
        validator.check(embedcode, "埋め込みコードが長過ぎます。").len(0,100);
    }

    if (prefectureCd) {
        validator.check(prefectureCd, "都道府県のパラメータが正しくありません。").isNumeric();
       // validator.check(prefecture, "パスワードは４文字から７文字までです。").len(4, 7);
    } else {
        validator.error('都道府県を選択してください。');
    }
    if (cityCd) {
        validator.check(cityCd, "市区町村のパラメータが正しくありません。").isNumeric();
       // validator.check(prefecture, "パスワードは４文字から７文字までです。").len(4, 7);
    }
    if (comment) {
        var num = comment.match(/(\r\n|\n|\r)/gm);
        if (num) {
            if (num.length > 300) {
                validator.error('行数が多すぎます。行数は300行までです。');
            }
        }
        sanitize(comment).trim();
        validator.check(comment, "本文が長過ぎます。コメントは20000文字までです。").len(0, 20000);
    } else {
        validator.error('本文を入力してください');
    }
    if (filename1 &&
        filetype1 !== 'image/png' &&
        filetype1 !== 'image/jpeg') {
        validator.error('メイン写真はイメージファイル(png、jpeg)ではありません。');
    }
    var errors = validator.getErrors();
    logger.debug("errors = " + errors);
    if (errors.length > 0) {
        var err = new Error();
        callback(err);
    } else {
        callback();
    }
}