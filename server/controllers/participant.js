'use strict';

module.exports = function() {
    var ParticipantModel = require('../models/participant')();
    var EventThread = require('../models/eventThread')();
    var config = require('../config/environment');
    var errorHandler = require('../services/error_handler/errors')();

    return {
        /**
         * save participant 
         * @param req
         * @param res
         */
        saveParticipants: function(req, res) {
            ParticipantModel.create(req.body, function(error, participant) {
                if (error) {
                    res.send(error);
                } else {
                    EventThread.getThreadHaveSpecifiedEventId(req.body.event_id, function(err, threads) {
                        if (err) {
                            console.log('getThreadHaveSpecifiedEventId-error=> ', err);
                            res.send(error);
                        } else {
                            for (var j = 0; j < threads.length; j++) {
                                for (var k = 0; k < threads[j].events.length; k++) {
                                    if (threads[j].events[k].id == req.body.event_id) {
                                        threads[j].events[k].participants = req.body.attendees;
                                    }
                                }
                                EventThread.update(threads[j], function(err, resp) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                            }
                            res.send(participant);
                        }
                    });
                }
            });
        },

        getParticipants: function(req, res) {
            ParticipantModel.getParticipants(req.params.event_id, function(error, participant) {
                if (error) {
                    res.send(error);
                } else {
                    res.send(participant);
                }
            });
        }

    }
};
