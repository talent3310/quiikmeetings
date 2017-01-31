/**
 * Created by delwar on 4/26/15.
 */

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

var UserAvailabilitySchema = new Schema({
  user_id: {type :ObjectId, required : true, ref : 'User' },
  date: String,
  free_times:[{
    start_time: String,
    end_time: String
  }]
},schemaOptions);





module.exports = mongoose.model('UserAvailability', UserAvailabilitySchema);
