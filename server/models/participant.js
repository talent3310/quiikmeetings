module.exports = function() {
    var Participant = require('../schemas/ParticipantSchema');
    return {
        /**
         * saves participant
         * @param participantData
         * @param callback
         */
        create: function(participantData, callback) {
            //check if participant already exists in the list
            Participant.findOne({
                event_id: participantData.event_id
            }).exec(function(err, participant) {
                if (participant) {
                    //update participants
                    participant.attendees = participantData.attendees;
                    participant.markModified('attendees');
                    participant.save(function(error, pnt) {
                        if (!error) {
                            callback(null, pnt);
                        } else {
                            callback(error);
                        }
                    });
                } else {
                    Participant.create(participantData, function(error, participant) {
                        if (!error) {
                            callback(null, participant);
                        } else {
                            callback(error);
                        }
                    });
                }
            });
        },

        /**
         * get participants which have specified event id
         * @param eventId
         * @param callback
         */
        getParticipants: function(eventId, callback) {
            Participant.findOne({
                event_id: eventId
            }).exec(function(err, participant) {
                if (err) {
                    callback(err);
                } else {
                    //update participants
                    callback(null, participant);
                }
            });
        },

        /**
         * update participant
         * @param eventId
         * @param callback
         */
        update: function(participantData, callback) {
            Participant.findOne({ _id: participantData._id }, function(error, participant) {
                participant._id = participantData._id;
                participant.event_id = participantData.event_id;
                participant.attendees = participantData.attendees;
                participant.markModified('attendees');
                participant.save(function(err, et) {
                    if (!err) {
                        callback(null, et);
                    } else {
                        callback(err);
                    }
                });
            });
        },
        /**
         * get participants which have specified event id
         * @param eventId
         * @param callback
         */
        deleteParticipants: function(eventId, callback) {
            Participant.remove({
                event_id: eventId
            },callback);
        },
    }
};
