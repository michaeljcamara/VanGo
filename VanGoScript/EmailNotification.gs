/** 
 * This class handles email communication with the student.  It will only send an email if
 * a conflict was encountered when scheduling an event.
 */

/** Constructor for EmailNotification to intialize variables*/
var EmailNotification = function(email) {
  this.email = email;
  this.subject = "Allegheny Shuttle Van: Scheduling Error";
  this.body = "At least one of the time slots that you scheduled for the Allegheny shuttle " +
    "van service is not currently available due to a limited number of seats.  The conflicting times include:\n\n";
}

/** Send an email to the student with a list of the time slots that have conflicts. Indicate that the
 *  student should re-submit the form by choosing a different time slot for those conflicting days */
EmailNotification.prototype.sendEmail = function(conflictEvents) {
  
  // Iterate through all time slots that have encounered conflicts (i.e. the shuttle was full at that time)
  for(var i = 0; i < conflictEvents.length; i++) {
    var event = conflictEvents[i];
    var endTime = event.getEndTime();
    
    // Add a formatted message to the email body indicating the weekday, the type of event
    // (drop-off or pick-up), and the time slot that could not be scheduled.
    this.body += this.convertDateToDayEventTime(event, endTime);
  }
  
  this.body += "\nPlease use the following link to resubmit your form with new times for the above conflict(s):\n\n";
  this.body += "https://docs.google.com/a/allegheny.edu/forms/d/1aTNVBvwU8JhAF5eqtEkrBQfcxoUCxXZFkYVp3ptMz30/viewform\n\n";
  this.body += "If you require special accomodation for a certain time, then please contact Lee Scandinaro at lscandinaro@allegheny.edu\n\n" +
    "Thank you.";
  
  MailApp.sendEmail(this.email, this.subject, this.body);
}

/* This method creates a formatted string from an event and specific date:
* Syntax: Weekday TypeOfEvent: HH:MM AM/PM
* E.g. Monday Drop-off: 11:15 AM */
EmailNotification.prototype.convertDateToDayEventTime = function(event, date) {
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var day = days[date.getDay()];
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var amOrPm = "AM";
  
  if(hours >= 12) {
    amOrPm = "PM";
    if(hours > 12) {
      hours -= 12;
    }
  } 
  
  if(minutes < 10) {
    minutes = "0" + minutes;
  }
  
  var time = hours + ":" + minutes + " " + amOrPm;
  var typeOfEvent = event.getTag("typeOfEvent");
  var convertedDate = day + " " + typeOfEvent + ": " + time + "\n";
  
  return convertedDate;
}