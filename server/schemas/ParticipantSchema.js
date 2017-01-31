
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

var ParticipantSchema = new Schema({
  event_id : {type : String},
  thread_id : {type : String},
  attendees : {type: Array, default: [] }
},schemaOptions);

module.exports = mongoose.model('Participant', ParticipantSchema);
