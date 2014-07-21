var fs = require('fs'),
    path = require('path');

exports.showFullSizeImage = function (req, res) {
  var img = fs.readFileSync(path.dirname(process.mainModule.filename) + "/uploads/fullsize/" + req.params.file);
  res.writeHead(200, {'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
}
