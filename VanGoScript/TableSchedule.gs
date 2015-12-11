/********************************************************
 * This class creates a Google Doc table for displaying the current
 * week's schedule, as pulled from the ShuttleVanCalendar.
 ********************************************************/
function createDocEvents() {
  
  var doc = DocumentApp.openById("1CKWk5bT8n5h2-Dx__9LANFMpvFUUIalmx06inaGC7xk");
  var body = doc.getBody();
  var tables = body.getTables();
  
  // Delete contents of existing table before creating new events
  for(var x = 1; x < 43; x++) {
    for(var y = 1; y < 6; y++) {
      tables[0].getCell(x,y).clear();
      tables[0].getCell(x,y).setBackgroundColor("#FFFFFF");
    }
  }
  
  // Delete current header
  var header = doc.getHeader();
  header.setText("");
  
  // Get VanSchedule calendar and the current date
  var cal = CalendarApp.getCalendarById("allegheny.edu_93fhcf7oq8i7771q4ehm76k814@group.calendar.google.com");
  var today = new Date();
  var currentWeekday = today.getDay();
  var currentTime = today.getTime();
  
  // Get the date for the Monday that begins the current week
  var targetDate = new Date(currentTime - (1000 * 60 * 60 * 24 * (currentWeekday - 1)));
  
  // Set the header to display the current week for which the schedule applies (from Monday to Friday)
  var startDate = targetDate;
  var endDate = new Date(targetDate.getTime() + (1000 * 60 * 60 * 24 * 4));
  header.insertParagraph(0,"Shuttle Van Schedule").setHeading(DocumentApp.ParagraphHeading.TITLE).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  header.insertParagraph(1,"Week of: " + startDate.toDateString() + " to " + endDate.toDateString()).setAlignment(DocumentApp.HorizontalAlignment.CENTER).editAsText().setItalic(true);
                       
  // Iterate through the columns in the table (from Monday to Friday, column 1 to column 5)
  for(var y = 1; y < 6; y++) {
    
    // get events from calendar for the targetDate
    var events = cal.getEventsForDay(targetDate)

    // Iterate through all events for the targetDate
    for(var e = 0; e<events.length; e++) {
      
      // Record start time of each event
      var event = events[e];
      var startTime = event.getStartTime()
      h = startTime.getHours();
      m = startTime.getMinutes();
      
      // Record the guest list for the event
      var guests = event.getGuestList();
      
      // Convert the time into an appropriate format for parsing
      var t = getTime(m,h);
      
      // Iterate through all 15 minute time slots in first column of table
      // Attempt to match the startTime of the event with the time in the table cell
      for(var x = 1; x < 43; x++) {    
        
          // Check if t is equal to the value in each cell.
          if(tables[0].getCell(x,0).getText() == t) {
            
            // Iterate through all guests for the given event
            for(var j = 0, offset = 0; j < guests.length; j++) {    
            
              // Get the pertinent info from the guest
              var email = guests[j].getEmail();
              var currentDescription = event.getTag(email);
              var descriptors = currentDescription.split("\n");
              var typeOfEvent = descriptors[0].split(":")[0];
              var name = descriptors[0].split(":")[1];
              var site = descriptors[1].split(":")[1];
              
              // Insert this info neatly into the table cell for each guest
              tables[0].getCell(x,y).insertParagraph(offset++,typeOfEvent).setAlignment(DocumentApp.HorizontalAlignment.LEFT).editAsText().setBold(true).setUnderline(true);
              tables[0].getCell(x,y).insertParagraph(offset++,name).setAlignment(DocumentApp.HorizontalAlignment.RIGHT).editAsText().setBold(false).setUnderline(false);
              tables[0].getCell(x,y).insertParagraph(offset++,site).setAlignment(DocumentApp.HorizontalAlignment.RIGHT).editAsText().setBold(false).setUnderline(false);
            
          }// if statmement
            
            // Event was found in the table, so break to next event for the day
            break;
        }
      } // time for-loop
    }// event loop
    
    // Increment the targetDate by one day
    targetDate = new Date(targetDate.getTime() + (1000 * 60 * 60 * 24));
    
  } // weekday for-loop
  
} // method

//Gets the right departure time format for Google Docs schedule: (HH:MM)
function getTime(m,h) {
  if(h>12)
    h = h-12;
  if(m<10)
    var t = h.toString()+":0"+m.toString();
  else 
    var t = h.toString()+":"+m.toString();

  return t
} // END OF FUNCTION