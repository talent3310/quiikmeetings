/**

 * User: Sohel
 * Date: 3/18/15
 * Time: 12:57 AM
 */

module.exports = function() {

  var mandrill = require('mandrill-api/mandrill');
  var config = require('./mandrill_config.json');
  var log4js = require('log4js'); //used to log the result of email sending attempts.
  log4js.configure('./server/config/log4js_config.json', { reloadSecs: 30 }); //load configuration file
  var logger = log4js.getLogger("email");

  return {

    sendEmail: function (email_address, html, text, subject) {

      var mandrill_client = new mandrill.Mandrill(config.key);

      var message = {
        "html": html,
        "text": text,
        "subject": subject,
        "from_email": config.from_email,
        "from_name": "Calendar App",
        "to": [{
          "email": email_address,
          "name": "Recipient Name",
          "type": "to"
        }],
        "headers": {
          "Reply-To": config.Reply
        },
        "important": false,
        "track_opens": null,
        "track_clicks": null,
        "auto_text": null,
        "auto_html": null,
        "inline_css": null,
        "url_strip_qs": null,
        "preserve_recipients": null,
        "view_content_link": null,
        "bcc_address": "",
        "tracking_domain": null,
        "signing_domain": null,
        "return_path_domain": null,
        "merge": true
        /*
         "google_analytics_domains": [
         "example.com"
         ],
         "google_analytics_campaign": "message.from_email@example.com",
         "metadata": {
         "website": "www.example.com"
         },
         "attachments": [{
         "type": "text/plain",
         "name": "myfile.txt",
         "content": "ZXhhbXBsZSBmaWxl"
         }],
         "images": [{
         "type": "image/png",
         "name": "IMAGECID",
         "content": "ZXhhbXBsZSBmaWxl"
         }]*/
      };
      var async = false;
      var ip_pool = "Main Pool";
      var send_at = "";
      mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at}, function(result) {
        console.log(result);
        logger.info('Subject : '+subject);
        logger.info('Email has been sent');
        logger.warn('User entered wrong credentials');
        logger.error('Internet connection down');
        logger.fatal('Database is not running');
        logger.info(result); //log the result to logfile
        //log.info(result);
        /*
         [{
         "email": "recipient.email@example.com",
         "status": "sent",
         "reject_reason": "hard-bounce",
         "_id": "abc123abc123abc123abc123abc123"
         }]
         */
      }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        //console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        //logger.error('A mandrill error occurred: ' + e.name + ' - ' + e.message);//log the error to log file
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
        logger.error('A mandrill error occurred: ' + e.name + ' - ' + e.message);
      });
    }
  }
};
