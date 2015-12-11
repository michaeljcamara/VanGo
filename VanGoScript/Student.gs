/** 
 * This class represents a student, containing such info as:
 * first/last name, phone number, email address, work site, and requested shuttle times.
 */

/** Student constructor for initializing all variables */
var Student = function(entry) {
  
  // Retrieve the specific spreadsheet where data is stored for each student form submission
  // NOTE: Each row of the sheet corresponds to a unique form submission
  var spreadsheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1qjh1UbBCpMU0obs-D6CP6WFEYRkZBZ7GXn-jp6SUeus/edit?addon_dry_run=AAnXSK_jFglKivhnaLwJk6sKFc89YzzoKsfItGF2iHMiMYYtMU0ShtmTmIN70C2mjpH_XIQMTelDAHOBNiCDSy9MpJQdLbKhNxHrYA5M3W5t6EFg8Ap-z7jV6OstbXDqX7AAzX3p0z3S#gid=5https://docs.google.com/spreadsheets/d/1qjh1UbBCpMU0obs-D6CP6WFEYRkZBZ7GXn-jp6SUeus/edit?addon_dry_run=AAnXSK_jFglKivhnaLwJk6sKFc89YzzoKsfItGF2iHMiMYYtMU0ShtmTmIN70C2mjpH_XIQMTelDAHOBNiCDSy9MpJQdLbKhNxHrYA5M3W5t6EFg8Ap-z7jV6OstbXDqX7AAzX3p0z3S#gid=54212405542124055");
  var sheet = spreadsheet.getSheetByName("Responses");
  
  // Store all values in first column, indicating the time the data was entered
  // i.e. when the corresponding form was submitted
  var timeStampColumn = sheet.getSheetValues(1, 1, sheet.getLastRow(), 1);
  
  // Iterate through all time stamps and find the row corresponding to the most recent entry
  var chosenRow = null;
  var mostRecentDate = new Date("1/1/1970");
  for(var row = 1; row < sheet.getLastRow(); row++) {
    var timeStamp = new Date(timeStampColumn[row]);
    
    if(timeStamp > mostRecentDate) {
      mostRecentDate = new Date(timeStamp);
      chosenRow = row + 1;  // Need to offset by 1 d/t adjusted timeStampColumn range
    }
  }
  
  // Store all of the cells for the chosen row (i.e. the most recent form submission), except for
  // the first column (timestamp omitted)
  var lastEntry = sheet.getSheetValues(chosenRow, 1, 1, sheet.getLastColumn())[0];
  
  // Store all values from the form submission in this Student object
  this.first = lastEntry[1];
  this.last = lastEntry[2];
  this.phone = lastEntry[3];
  this.email = lastEntry[4];
  this.site = lastEntry[5];
  this.program = lastEntry[6];
  
  // Create a StudentSchedule for this student's requested times, indicating when he/she wants to be
  // picked-up and dropped-off from some work site
  this.schedule = new StudentSchedule(lastEntry);
  
  // This object maps days of the week to corresponding drop-off and pick-up times.
  // Here, the index is mapped to a day of the week: 1 = Monday, 2 = Tuesday, ... , 5 = Friday.
  // E.g. "times[1].dropoffDeparture" yields the time to depart from Allegheny on Monday to drop-off
  // this student at a work site.
  this.times = this.schedule.times;
}

/** Create a string representation of this Student */
Student.prototype.toString = function() {
  var desc =  "First name = " + this.first + "\n" +
    "Last name = " + this.last + "\n" +
    "Phone = " + this.phone + "\n" +
    "Email = " + this.email + "\n" +
    "Site = " + this.site + "\n" +
    "Program = " + this.program + "\n" +
    "Start date = " + this.schedule.startDate + "\n" +
    "End date = " + this.schedule.endDate + "\n";
      
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  for(var day in this.times) {
    desc +=
    days[day] + " dropoff departure time = " + this.times[day].dropoffDeparture + "\n" +
    days[day] + " dropoff arrival time time = " + this.times[day].dropoffArrival + "\n" +
    days[day] + " pickup departure time = " + this.times[day].pickupDeparture + "\n" +
    days[day] + " pickup arrival time time = " + this.times[day].pickupArrival + "\n";
  }
  
  return desc;
  
}