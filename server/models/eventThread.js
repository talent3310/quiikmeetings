/**
 * Created by sohel on 7/6/15.
 */

var _ = require("underscore");

module.exports = function() {
    var EventThread = require('../schemas/EventThreadSchema');
    return {

        /**
         * get all  threads
         * @param userId
         * @param callback
         */
        getAllThreads: function(callback) {
            EventThread.find({}, function(error, threads) {
                if (!error) {
                    callback(null, threads);
                } else {
                    callback(error);
                }
            });
        },


        registerEmailSend: function(thread_id, event_id, count) {
            console.log("Registering an email send");
            EventThread.findOne({ _id: thread_id }, function(error, thread) {
                if (error) {
                    console.warn("there was a problem finding the right item to mark email send");
                } else {
                    _.each(thread.events, function(ev) {
                        if (ev.id === event_id) {
                            console.log("found the event. marking");
                            if (ev.emailCount) {
                                ev.emailCount += count
                            } else {
                                ev.emailCount = count;
                            }
                        }
                    });
                    thread.markModified('events');
                    thread.save(function(err, done) {
                        if (error) {
                            console.warn("problem while updating the mark modified in evetns")
                        }
                    });
                }
            })
        },

        registerReview: function(thread_id, event_id) {
            console.log("Registering an event Completeion");
            EventThread.findOne({ _id: thread_id }, function(error, thread) {
                if (error) {
                    console.warn("there was a problem finding the right item to mark email send");
                } else {
                    _.each(thread.events, function(ev) {
                        if (ev.id === event_id) {
                            console.log("found the event. marking");
                            if (ev.reviewCount) {
                                ev.reviewCount += 1;
                            } else {
                                ev.reviewCount = 1;
                            }
                        }
                    });
                    thread.markModified('events');
                    thread.save(function(err, done) {
                        if (error) {
                            console.warn("problem while updating the mark modified in evetns")
                        }
                    });
                }
            })
        },



        archiveThread: function(thread_id, callback) {
            EventThread.findOne({ _id: thread_id }, function(error, thread) {
                if (!error) {
                    thread.archivedFlag = !thread.archivedFlag;
                    thread.save(function(error, thread2) {
                        if (!error) {
                            console.log("Saved the thread. Archive done.");
                            callback(null);
                        } else {
                            callback(error);
                        }
                    })
                } else {
                    callback(error);
                }
            });
        },

        /**
         * get the event threads
         * @param userId
         * @param callback
         */
        getThreads: function(userId, callback) {
            EventThread.find({ user_id: userId, archivedFlag: { $ne: true } }, function(error, threads) {
                if (!error) {
                    callback(null, threads);
                } else {
                    callback(error);
                }
            });
        },

        /**
         * get the thread details
         * @param thread_id
         * @param callback
         */

        getThreadDetails: function(thread_id, callback) {
            EventThread.find({ _id: thread_id }, function(error, thread) {
                if (!error) {
                    callback(null, thread);
                } else {
                    callback(error);
                }
            });
        },

        /**
         * get the threads which contains specified event
         * @param thread_id
         * @param callback
         */

        getThreadHaveSpecifiedEventId: function(eventId, callback) {
            EventThread.find({ events: { "$elemMatch": { id: eventId } } }, function(error, thread) {
                if (!error) {
                    callback(null, thread);
                } else {
                    callback(error);
                }
            });
        },

        /**
         * saves a new thread to the schema
         * @param threadData
         * @param callback
         */
        create: function(threadData, callback) {
            var newEventThread = new EventThread(threadData);
            newEventThread.save(function(err, eventThread) {
                if (!err) {
                    callback(null, eventThread);
                } else {
                    callback(err);
                }
            });
        },

        /**
         * updates thread
         * @param threadData
         * @param callback
         */
        update: function(threadData, callback) {
            EventThread.findOne({ _id: threadData._id }, function(error, eventThread) {
                eventThread.events = threadData.events;
                eventThread._id = threadData._id;
                eventThread.name = threadData.name;
                eventThread.meeting_purpose = threadData.meeting_purpose;
                eventThread.reason = threadData.reason;
                eventThread.user_id = threadData.user_id;
                eventThread.comment_type = threadData.comment_type;
                eventThread.meeting_type = threadData.meeting_type;
                eventThread.markModified('events');

                eventThread.save(function(err, et) {
                    if (!err) {
                        callback(null, et);
                    } else {
                        callback(err);
                    }
                })
            });
        }
    }
};
