/**
 * VanGoScript starts here.
 *
 * To run the script, click the "Run" button in the menu toolbar and then click "main"
 *
 * This script will trigger every time a student submits the associated Google Form (see below for link)
 *
 * ~~Associated Documents ~~
 * ShuttleVanSchedule Calendar: https://www.google.com/calendar/embed?src=allegheny.edu_93fhcf7oq8i7771q4ehm76k814%40group.calendar.google.com&ctz=America/New_York
 * Form_Responses Sheet: https://docs.google.com/a/allegheny.edu/forms/d/1aTNVBvwU8JhAF5eqtEkrBQfcxoUCxXZFkYVp3ptMz30/viewform
 * ShuttleVanSchedule Doc: https://docs.google.com/document/d/1CKWk5bT8n5h2-Dx__9LANFMpvFUUIalmx06inaGC7xk/edit
 * ShuttleVanForm Form: https://docs.google.com/a/allegheny.edu/forms/d/1aTNVBvwU8JhAF5eqtEkrBQfcxoUCxXZFkYVp3ptMz30/viewform
 *
 * GitHub Repo
 * https://github.com/michaeljcamara/VanGo
 */

// Store the targeted calendar as a global var
var calendar;

/** Program execution starts here! */
function main() {
  
  // Get the current ShuttleVanSchedule Google Calendar
  calendar = CalendarApp.getCalendarById("allegheny.edu_93fhcf7oq8i7771q4ehm76k814@group.calendar.google.com");
  
  // Retrieve student data from associated Google Sheet
  var student = new Student();
  
  // Send debugging output to console (Click "View" >> "Logs" to read after the script runs)
  Logger.log(student.toString()); 
  
  // Use the student's data to update the existing Google Calendar
  var calendarScheduler = new CalendarScheduler(student);
  calendarScheduler.updateCalendarSchedule();
}