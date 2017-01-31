/**
 * Created by ferdous on 4/21/15.
 */

'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var schemaOptions = {
  toObject: {
    virtuals: true
  }
  ,toJSON: {
    virtuals: true
  }
};

var UserSchema = new Schema({
  firstname: String,
  lastname: String,
  email: { type: String, lowercase: true },
  hashedPassword: String,
  salt: String,
  city: String,
  country: String,
  role: {
    type: String,
    default: 'user'
  },
  cronofy_auth_token : String,
  refresh_token: String,
  calendar_id: String,
  channelId: String,
  created_at: String ,   
  updated_at: String ,
},schemaOptions);
 
/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      'name': this.name,
      'role': this.role
    };
  });
//test

UserSchema 
  .virtual('name')
  .set(function(name) {
    var nameParts = name.split(' ');
    this.firstname = nameParts[0] ? nameParts[0] :'';
    this.lastname = nameParts[1] ? nameParts[1] : '';
  })
  .get(function() {
    return this.firstname + ' ' + this.lastname;
  });

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
  }, 'The specified email address is already in use.');

UserSchema.pre('save', function(next){
  var now = Math.round(new Date().getTime()/1000);
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

module.exports = mongoose.model('User', UserSchema);
