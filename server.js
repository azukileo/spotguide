var application_root = __dirname,
  express = require('express'), // web framework
  routes = require('./routes'),
  path = require('path'), // Utilities for dealing with file paths
  http = require('http'),
  models = require('./models'),
  lib = require('./lib'),
  logger = require('./public/js/lib/logger.js'),
  Validator = require('validator').Validator,
  flash = require('connect-flash');

 //Create server
 var app = express();

 // Configure server
 app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.use(logger.log4js.connectLogger(
      logger,
      { level: logger.log4js.levels.INFO,
        nolog: ["\\.css", "\\.js", "\\.jpg", "\\.jpeg", "\\.gif"]
      })
  );
  app.use(express.logger('dev'));
  app.use(express.limit('2mb'));
  app.use(express.bodyParser({
      keepExtensions: true,
      uploadDir: './uploads/fullsize'
  }));
  app.use(express.cookieParser());
  app.use(express.session({secret: 'secret'}));
  app.use(express.csrf());
  app.use(express.methodOverride());
  app.use(express.static(path.join(application_root, 'public')));
  app.use(flash());
  app.use(express.compress());
  app.use(app.router);
  app.use(lib.notFoundHandler);
  app.use(lib.errorHandler);
 });


function csrf(req, res, next) {
    res.locals.token = req.session._csrf;
    next();
}

// エラー画面ページ
app.get('/post/error', routes.error.error);

app.get('/', routes.top);

app.get('/articles/companyInfo', routes.companyInfo);

app.get('/articles/make', csrf, routes.article.showMakeArticle);

app.get('/articles/list/:local', routes.article.showArticleList);

app.get('/articles/article', function (req, res, next) {
    res.render('article.hbs');
});

app.get('/region/list', routes.region.showRegionList);

app.get('/region/hokkaido', routes.region.showRegionHokkaido);

app.get('/region/tohoku', routes.region.showRegionTohoku);

app.get('/region/kanto', routes.region.showRegionKanto);

app.get('/region/chubu', routes.region.showRegionChubu);

app.get('/region/kansai', routes.region.showRegionKansai);

app.get('/region/chugoku', routes.region.showRegionChugoku);

app.get('/region/shikoku', routes.region.showRegionShikoku);

app.get('/region/kyushu', routes.region.showRegionKyushu);

// スレッド作成
app.post('/makeArticle', routes.article.makeArticle);

// Show files
app.get('/uploads/fullsize/:file', routes.uploads.showFullSizeImage);

// out of route error
app.get('/*', routes.error.outOfRoute);

Validator.prototype.error = function(msg) {
  this._errors.push(msg);
}

Validator.prototype.getErrors = function() {
  return this._errors;
}

app.configure('development', function(){
  models.init('127.0.0.1', 'spotguide_dev');
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true}));
});

app.configure('production', function(){
  models.init('127.0.0.1', 'spotguide_prod');
  app.use(express.errorHandler());
});

app.configure('test', function(){
  models.init('127.0.0.1', 'spotguide_test');
  app.use(express.errorHandler());
});

var webServer = http.createServer(app).listen(app.get('port'), function () {
    logger.info("Server ready on port " + app.get('port'));
});
