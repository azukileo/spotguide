var mongoose = require('mongoose');

exports.init = function(host, db) {
	mongoose.connect('mongodb://' + host + '/' + db);
};

var Schema = mongoose.Schema;

var Article = new Schema({
	article_no: {type: Number, required: true},
	ipaddress: {type: String, required: true},
	ip_country: {type: String, trim: true},
	ip_country_code: {type: String, trim: true},
	ip_city: {type: String, trim: true},
	prefectureCd: {type: String, required: true},
	cityCd: {type: String, required: true},
	name: {type: String, required: true},
	title: {type: String, required: true},
	filename1: {type: String, trim: true},
	filenamefornail1: {type: String, trim: true},
	filecaption1: {type: String, trim: true},
	// filename2: {type: String, trim: true},
	// filenamefornail2: {type: String, trim: true},
	// filecaption2: {type: String, trim: true},
	// filename3: {type: String, trim: true},
	// filenamefornail3: {type: String, trim: true},
	// filecaption3: {type: String, trim: true},
	// filename4: {type: String, trim: true},
	// filenamefornail4: {type: String, trim: true},
	// filecaption4: {type: String, trim: true},
	// filename5: {type: String, trim: true},
	// filenamefornail5: {type: String, trim: true},
	// filecaption5: {type: String, trim: true},
	embedcode: {type: String, trim: true},
	comment: {type: String, required: true},
	tags:[],
	create_date: {type: Date, default: Date.now}
})

exports.ArticleModel = mongoose.model('Article', Article);

var Tag = new Schema({
	tag_no: {type: String, required: true},
	name: {type: String, required: true},
	comment: {type: String, required: true},
	tag: {type: String, required: true}
});

exports.TagModel = mongoose.model('Tag', Tag);
/***************************************************************************************************************/


// Counterスキーマを定義
// Counterは_idで複数個管理できる。
var Counter = new Schema({
 _id: String,
 seq: Number
});

// Counterスキーマに新しいIDを発行させるメソッドを追加
// MongoDBのfindAndModifyを用いて参照とともにカウンターの値を＋１する。
// staticsに追加したメソッドは、クラスメソッドのような感覚で使える。
Counter.statics.getNewId = function (name) {
  this.collection.findAndModify(
    { _id: name }, //Query
    [], //sort
    { $inc: { seq: 1 } }, //update document
    { new: true, upsert: true }, //options
    function(err, object) {
        if (err){
            console.warn(err.message);  // returns error if no matching object found
        }else{
            console.dir(object);
        }
    });
    var ret = this.collection.findById(name, function(err, result) {
	    if (err) {
	      console.warn(err.message);
	    }
	    if (!result) {
	      console.dir(object);
	    }
	});
	Console.log("newId = " + ret.seq);
	return ret.seq;
};

Counter.statics.increment = function (counter, callback) {
    return this.findByIdAndUpdate(
    	counter,
    	{ $inc: { seq: 1 } },
    	{new: true, upsert: true, select: {seq: 1}},
    	callback
    );
};

// カウンターテーブルのカウントを+1して、カウントを返す
Counter.statics.getNextSequence = function (counter, callback) {
    return this.findByIdAndUpdate(counter, { $inc: { sec: 1 } }, {new: true, upsert: true, select: {next: 1}}, callback);
};

exports.Counter = mongoose.model('Counter', Counter);
