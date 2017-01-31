/**
 * Created by sohel on 7/6/15.
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

var EventThreadSchema = new Schema({
  user_id: {type : ObjectId, required : true, ref : 'User' },
  name : {type : String},
  date: { type: Date, default: Date.now },
  events: { type: Array, default: [] },
  meeting_type: {type: String, enum: ['Executive', 'Marketing', 'Sales', 'Development', 'Client / Project'], default: 'Executive'},
  comment_type: {type: String, enum: ['Enable', 'Anonymous', 'Auto'], default: 'Enable'},
  meeting_purpose : {type : String },
  reason : { type : String},
  from_google_event : {type : Boolean},
  archivedFlag: {type: Boolean, default: false}
},schemaOptions);


module.exports = mongoose.model('EventThread', EventThreadSchema); 