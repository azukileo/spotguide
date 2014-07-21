var log4js = require('log4js');
log4js.configure('log4js_setting.json', { reloadSec: 300 });
var logger = log4js.getLogger('default');
module.exports = logger;
module.exports.log4js = log4js;