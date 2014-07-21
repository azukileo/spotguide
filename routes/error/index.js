var logger = require('../../public/js/lib/logger.js'),
    hbs = require('hbs');

exports.error = function(req, res) {
    hbs.registerHelper('makeErrorMessages', function(errors) {

        var resArray = String(errors).split(",");
        var out = "<ul class='center'>";
        for (var i = 0, l = resArray.length; i < l; i++) {
            out = out + "<li>" + resArray[i] + "</li>"
        }
        out = out + "</li>";
        return new hbs.SafeString(out);
    });
    res.render('error.hbs', {
        errors: req.flash('errors')
    });
}

exports.outOfRoute = function(req, res) {
    hbs.registerHelper('makeErrorMessages', function(errors) {
        logger.debug("++++++++  makeErrorMessages +++++++");
        logger.debug("errors = " + errors);
        var resArray = String(errors).split(",");
        var out = "<ul class='center'>";
        for (var i = 0, l = resArray.length; i < l; i++) {
            out = out + "<li>" + resArray[i] + "</li>"
        }
        out = out + "</li>";
        logger.debug("out = " + out);
        return new hbs.SafeString(out);
    });
    logger.debug("error.hbsへ");

    res.render('error.hbs', {
        errors: "お探しのページは見つかりません。"
    });
}
