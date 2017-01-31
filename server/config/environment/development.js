'use strict';

// Development specific configuration
// ==================================
module.exports = {
	
  // Server port
port:     process.env.OPENSHIFT_NODEJS_PORT ||
        process.env.PORT ||
        9080,
            
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/calendar-app'
  },

  seedDB: true
};
