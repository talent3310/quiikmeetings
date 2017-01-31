/**
 * User: David
 * Date: 12/18/16
 */

module.exports = function() {

  var sendgrid  = require('sendgrid').mail;
  var config = require('./sendgrid_config.json');
  var log4js = require('log4js'); //used to log the result of email sending attempts.
  log4js.configure('./server/config/log4js_config.json', { reloadSecs: 30 }); //load configuration file
  var logger = log4js.getLogger("email");

  return {

    sendEmail: function (email_address, html, text, subject) {
  
      var from_email = new sendgrid.Email('test@example.com');
      var to_email = new sendgrid.Email(email_address);
      var subject = subject;
      var content = new sendgrid.Content('text/html', text);
      var mail = new sendgrid.Mail(from_email, subject, to_email, content);
      console.log('content==> ', content);
      var sg = require('sendgrid')(config.api_key);
      var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON(),
      });
       
      sg.API(request, function(error, response) {
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
      });
    }
  }
};

