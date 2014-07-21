var logger = require('../../public/js/lib/logger.js'),
    models = require('../../models'),
    constant = require('../../config/const'),
    ThreadModel = models.ThreadModel,
    UserModel = models.UserModel,
    // nodeUuid = require('node-uuid'),
    geoip = require('geoip'),
    async = require('async');

exports.evaluateComment = function(req, res, next) {
	var post_data = req.body.post_data,
		judge = req.body.judge,
		uuid = req.cookies.uuid,
		categoryId,threadId,postId,
		country, city, country_code,
		ipaddress = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

	logger.debug("post_data = " + post_data);
	logger.debug("judge = " + judge);

    var City = geoip.City;
    var city = new City('./geodata/GeoLiteCity.dat');
    // Synchronous method
    var city_obj = city.lookupSync(ipaddress);

    city.update('./geodata/GeoLiteCity.dat');

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

	if (post_data && judge) {
		var parameters = String(post_data).split("_");
		categoryId = parameters[0];
    	threadId = parameters[1];
    	postId = parameters[2];
    	async.waterfall([
    		function (callback) { // userInfoから既に評価済みかどうかを調べる
    			if (uuid) {
    				async.waterfall([
    					function (callback2) {
			                UserModel.findOne({uuid: uuid}).exec(function (err, userModel) {
			                    if (err) {
			                        if (err.name === 'ValidationError') {
			                            logger.error("err == " + err);
			                        }
			                        logger.error('Error: ' + err.message);
			                        callback(err);
			                        return;
			                    }
			                    callback2(null, userModel);
			                });
			            },
			            function (userModel, callback2) { // 削除されたスレッドがあれば、evaluationsのデータも削除しておく
			            	if (userModel) {
                                var evaluations = userModel.evaluations;
                                var i = 0;
                                async.forEachSeries(evaluations, function (evaluation, callback3) {
                                    ThreadModel.findOne({
                                        category_id: evaluation.category_id,
                                        post_id: evaluation.thread_id
                                    }).exec(function (err, result) {
                                        if (!result) { // スレッド自体が削除されている場合
                                            userModel.evaluations.splice(i, 1);
                                        } else {
                                        	var reply_post = result.replies.id(evaluation.post_id);
                                        	if (!reply_post) { // スレッドはあるがポストが削除されている場合
                                        		userModel.evaluations.splice(i, 1);
                                        	}
                                        }
                                        i++;
                                        callback3();
                                    });
                                }, function (err) {
                                    if (err) {
                                        logger.error('Error: ' + err.message);
                                        callback(err);
                                        return;
                                    }
                                    userModel.access_date = new Date(Date.now());
                                    userModel.save(function (err, savedUserModel) {
				                        if (err) {
				                            if (err.name === 'ValidationError') {
				                                logger.error("err == " + err);
				                            }
				                            logger.error('Error: ' + err.message);
				                            callback(err);
				                            return;
				                        }
				                        logger.debug("UserModel save completed!!");
				                        callback2(null, userModel);
				                    });
                                });
			            	} else {
			            		callback2(null, userModel);
			            	}
			            },
			    		function (userModel, callback2) {
				            if (userModel) {
				                logger.debug('uuidが既にありuserModelがある場合上書きする');

				                // 過去に同じポストを評価していれば画面に戻す
			                    var evaluations = userModel.evaluations;
			                    async.forEachSeries(evaluations, function (evaluation, callback3) {
			                        if (categoryId === evaluation.category_id &&
			                        	threadId === evaluation.thread_id &&
			                        	postId === evaluation.post_id) {
			                        	err = new Error();
			                        	err.message = 'evaluate error';
			                        	callback(err);
			                        	return;
			                        }
			                    	callback3();
			                    }, function (err) {
			                        if (err) {
			                            logger.error('Error: ' + err.message);
			                            callback(err);
			                            return;
			                        }
				                    userModel.ipaddress = ipaddress;
				                    userModel.evaluations.push({category_id: categoryId, thread_id: threadId, post_id: postId});
				                    userModel.country = country;
				                    userModel.city = city;
				                    userModel.country_code = country_code;
				                    userModel.access_date = new Date(Date.now());
				                    callback2(null, userModel);
			                    });
				            } else { // 検索しても対象のuuidがない場合、新しくuuidを振り直す
				                logger.debug('検索しても対象のuuidがない場合、新しくuuidを振り直す');
				                var userModel = new UserModel({
				                    // uuid: nodeUuid.v4(),
				                    ipaddress: ipaddress,
				                    country: country,
				                    city: city,
				                    country_code: country_code,
				                    access_date: new Date(Date.now())
				                });
				                userModel.evaluations.push({category_id: categoryId, thread_id: threadId, post_id: postId});
				                callback2(null, userModel);
				            }
			    		},
	                ], function (err, userModel) {
	                	if (err) {
	                		logger.error('Error: ' + err.message);
                            callback(err);
                            return;
	                	}
	                	res.cookie('uuid', userModel.uuid, {expires: new Date(Date.now() + constant.cookie.EXPIRES), secure: true});
	                    userModel.save(function (err, savedUserModel) {
	                        if (err) {
	                            if (err.name === 'ValidationError') {
	                                logger.error("err == " + err);
	                            }
	                            logger.error('Error: ' + err.message);
	                            callback(err);
	                            return;
	                        }
	                        logger.debug("UserModel save completed!!");
	                        callback();
	                    });
	                });
            	} else {
	                logger.debug('uuidがない場合、userModelを作成してuuidを作成');
	                var user = new UserModel({
	                    // uuid: nodeUuid.v4(),
	                    ipaddress: ipaddress,
	                    country: country,
	                    city: city,
	                    country_code: country_code,
	                    access_date: new Date(Date.now())
	                });
	                user.evaluations.push({category_id: categoryId, thread_id: threadId, post_id: postId});
	                res.cookie('uuid', user.uuid, {expires: new Date(Date.now() + constant.cookie.EXPIRES), secure: true});
	                user.save(function (err, savedUserModel) {
	                    if (err) {
	                        if (err.name === 'ValidationError') {
	                            logger.error("err == " + err);
	                        }
	                        logger.error('Error: ' + err.message);
	                        callback(err);
	                        return;
	                    }
	                    logger.debug("UserModel save completed!!");
	                    callback();
	                });
            	}
    		},
	        function (callback) { // スレッドを検索
	            ThreadModel.findOne({
	            	category_id: categoryId,
	                post_id: threadId
	            }, function (err, threadData) {
	                if (err) {
	                    logger.error('Error: ' + err.message);
	                    callback(err);
	                    return;
	                }
	                callback(null, threadData);
	            });
	        },
	        function (threadData, callback) {
	        	if (threadData) {
		        	var postData = threadData.replies.id(postId);
		        	if (postData) {
			        	if (judge === constant.judge.GOOD) {
			        		postData.good = Number(postData.good) + 1;
			        		logger.debug('postData.good = ' + postData.good);
			        	} else if (judge === constant.judge.BAD) {
			        		postData.bad = Number(postData.bad) + 1;
			        		logger.debug('postData.bad = ' + postData.bad);
			        	} else {
			        		// バリデーション処理
			        	}
			        	threadData.save(function (err) {
			        		if (err) {
			                    logger.error('Error: ' + err.message);
			                    callback(err);
			                    return;
			        		}
			        		logger.debug('threadData更新完了！');
			        		callback(null, threadData);
			        	});
			        } else {
			        	callback(null, threadData);
			        }
	        	} else {
					callback(null, threadData);
	        	}
	        }
        ], function (err, threadData) {
        	if (err) {
		        if (err.message === 'evaluate error') {
		        	var returnJson = JSON.stringify({
		        		result: 'ng'
		        	});
		        	logger.debug("returnJson = " + returnJson);
		        	res.setHeader('content-type', 'application/json');
		        	res.send(returnJson);
		        	return;
                }
	        	var returnJson = JSON.stringify({
	        		result: 'else'
	        	});
	        	logger.debug("returnJson = " + returnJson);
	        	res.setHeader('content-type', 'application/json');
	        	res.send(returnJson);
                return;
        	}
        	logger.debug('threadData = ' + JSON.stringify(threadData));
        	if (threadData) {
        		var postData = threadData.replies.id(postId);
        		if (postData) {
		        	var returnJson = JSON.stringify({
		        		result: 'ok',
		        		good: postData.good,
		        		bad: postData.bad
		        	});
	        	} else {
	        		var returnJson = JSON.stringify({
		        		result: 'else'
		        	});
	        	}
        	} else {
        		var returnJson = JSON.stringify({
	        		result: 'else'
	        	});
        	}
        	logger.debug("returnJson = " + returnJson);
        	res.setHeader('content-type', 'application/json');
        	res.send(returnJson);
        	return;
        });
	} else {
		// バリデーション処理
		err = new Error();
		err.message = 'wrong parameters';
		next(err);
		return;
	}

}

exports.searching = function(req, res, next) {
    var queryDatas = req.body;
    logger.debug("accessing from browser ........ queryDatas = " + JSON.stringify(queryDatas));
    var resultIds = [];
    async.forEachSeries(queryDatas, function (queryData, callback) {
        ThreadModel.findOne({
            post_id: queryData.thread_id,
            category_id: queryData.category_id
        }, function (err, thread) {
            if (thread) {
                resultIds.push(1);
                callback();
            } else {
                resultIds.push(0);
                callback();
            }
        });
    }, function (err) {
        if (err) {
        	logger.error('Error: ' + err.message);
            next(err);
            return;
        }
        logger.debug('resultIds = ' + JSON.stringify(resultIds));
        res.send(resultIds);
        return;
    });
}
