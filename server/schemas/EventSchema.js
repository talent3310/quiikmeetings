
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

var EventSchema = new Schema({
  summary: {type : String},
  start: { type: Date, default: Date.now},
  end : { type: Date},
  google_event : {type : Boolean},
  participants : {type: Array, default: [] },
  emailCount: {type: Number, default: 0},
  reviewCount: {type: Number, default: 0}
},schemaOptions);

module.exports = mongoose.model('Event', EventSchema);
 