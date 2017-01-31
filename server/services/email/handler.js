/**

 * User: Sohel
 * Date: 3/18/15
 * Time: 1:12 AM
 */
 


module.exports = function(){
  var emailSender = require('./email.sender')();
  var _ = require('lodash');
  return {

    /**
     * sends account creattion email
     * @param lastname
     * @param host
     * @param password
     * @param email_address
     */
    sendAccountSetupEmail : function(lastname, host, password, email_address){
      host = "http://" + host;
      var html = "Hello " + lastname + ","+
        "<br><br> Your account has been successfully created at CalendarApp. Please visit "+ host + " to logon. " +
        "<br/><br/>admin, " +
        "<br>CalendarApp";

      var subject = "CalendarApp New Account";
      emailSender.sendEmail(email_address, html, html, subject);

    },

    /**
     * sends password changed email notification
     * @param lastname
     * @param host
     * @param password
     * @param email_address
     */
    sendPasswordChangedEmail : function(lastname, host, password, email_address){
      host = "http://" + host;
      var html = "Hi " + lastname + ","+
        "<br><br> Your password has been successfully changed. Please visit "+ host + " to logon. " +
        "<br/><br/>admin, " +
        "<br>CalendarApp";

      var subject = "CalendarApp password change request";
      emailSender.sendEmail(email_address, html, html, subject);

    },
    /**
     * sends password reset email
     * @param lastname
     * @param host
     * @param email_address
     * @param reset_code
     */
    sendPasswordResetEmail : function(lastname, host, email_address, reset_code){
      host = "http://" + host;
      lastname = (typeof (lastname) !== "undefined") ? lastname : "";
      var html = "Hi " + lastname + ","+
        "<br><br>You are receiving this email because you have requested a password reset for your CalendarApp account."+
        "<br/>Please reset the password by clicking "+ "<a href='" + host + "/reset_password/"+ email_address + "/" +reset_code+ "'><button type='button'>Reset Password</button></a>" +
        "<br/><br/>admin, " +
        "<br>CalendarApp";



      var subject = "CalendarApp password reset request";
      emailSender.sendEmail(email_address, html, html, subject);
    },

    /**
     * sends invitation emails
     * @param invitationData{type<Array>}
     * @param callback
     */
    sendInvitationEmails: function (invitationData, callback) {
      var count = 0;
      _.each(invitationData, function(invitation){
        var html = "Hello User,"+
          "<br><br> You are invited for the following times.<br/>" ;

        _.each(invitation.free_times, function(time){
          html = html + '<br/><b>' + ' Agenda: </b>' + invitation.agenda + '' +
          '<br/><b> Agenda Time:' + invitation.agendaTime + '</b> ' +
          '<br/><b> Duration: </b>' + invitation.agendaStartTime + "-" + invitation.agendaEndTime ;
        });

        html = html +  "<br/><br/>admin, " +
          "<br>Calendar App";

        var subject = "Invitation from Calendar app";

        emailSender.sendEmail(invitation.email, html, html, subject);
        count++;
        if(count === invitationData.length){
          callback(null, {success: true});
        }
      });
    },

    /**
     * sends email with a review link
     * @param lastname
     * @param host
     * @param threadID
     * @param eventID
     * @param eventName
     * @param email_address
     */
    sendReviewLinkEmail : function(lastname, host, threadID, eventID, eventName, email_address){
      host = "http://" + host;
      lastname = (typeof (lastname) !== "undefined") ? lastname : "";
      var html = "Hello " + lastname + ","+
        "<br><br> You are invited to review the event <b>" + eventName + "</b> ." +
        "<br><br>Please click here for review "+  "<a href='" + host +"/event_review/"+ email_address+"/" + threadID+"/" +eventID+ "'><button type='button'>Review</button></a>"+
        "<br/><br/>admin, " +
        "<br>Entrymark";
      var subject = "Review the event";
      emailSender.sendEmail(email_address, html, html, subject);
    }
  }
};