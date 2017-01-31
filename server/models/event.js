
module.exports = function () {
  var Event = require('../schemas/EventSchema');
  return {
    /**
     * saves a new event data to the schema
     * @param eventData
     * @param callback
     */

    create: function(eventData, callback){
      var newEvent = new Event(eventData);
      newEvent.save(function(err, event) {
        if (!err){
          callback(null, event);
        }
        else{
          callback(err);
        }
      });
    },


    /**
     * updates event
     * @param eventData
     * @param callback
     */
    update : function(eventData, callback){
      Event.findOne({_id: eventData._id}, function(error, event){
        event.summary = eventData.summary;
        event.start = eventData.start;
        event.save(function(err, et){
          if (!err){
            callback(null, et);
          }
          else{
            callback(err);
          }
        })
      });
    }
  }
};