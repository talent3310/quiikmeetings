
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var schemaOptions = {
  toObject: {
    virtuals: true
  }
  ,toJSON: {
    virtuals: true
  }
};

var UserReviewSchema = new Schema({
  rank_value :  Number,
  rank_progress :  Number,
  comment :  String,
  thread_id : {type : ObjectId, required : true, ref : 'EventThread' },
  event_id : String,
  user_id :  {type : ObjectId, required : false, ref : 'User' },
  user_email : String

},schemaOptions);

module.exports = mongoose.model('UserReview', UserReviewSchema);