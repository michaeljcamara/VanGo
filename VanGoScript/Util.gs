/******************************************************************************************
 * Use these functions to maintain your Google Calendar.
 * Click the "Run" button in the top toolbar, and then click the function you wish to run.
 * NOTE: Certain functions may require you to edit some of the code below, see the README
 *       for additional details.
 *****************************************************************************************/
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Delete ALL events from the VanSchedule Google Calendar between a specified start and end date
// Useful for removing erroneous data and starting from a clean slate.
function deleteAllEvents() {
  
  //*****************************************************************************************
  // ONLY EDIT: startDate AND endDate
  //*****************************************************************************************
  // Enter the start and end date for the events you want to delete:
  // Use the format: "MM/DD/YYYY".  E.g. enter "11/05/2015" for Nov. 5 2015
  var startDate = "12/01/2015";
  var endDate = "12/30/2015";
  //******************************************************************************************
  
  // Set hours to ensure that the entire day is included for the startDate and endDate
  startDate = new Date(startDate);
  startDate.setHours(0);
  endDate = new Date(endDate);
  endDate.setHours(23);
  
  // Get all events for the VanSchedule calendar
  var eventSeries = CalendarApp.getCalendarById("allegheny.edu_93fhcf7oq8i7771q4ehm76k814@group.calendar.google.com").getEvents(startDate, endDate);

  // Iterate through the events and delete each one
  for(i = 0; i < eventSeries.length; i++) {
    Utilities.sleep(500);
    eventSeries[i].deleteEvent();
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Remove a specific student from all events in the entire Google Calendar.
// If the student is the only one scheduled for an event, then the event will be deleted;
// If other students are scheduled for the same time, this student will be removed and the description
// and title of the event will be updated
function removeStudentFromEvents(){
  
  //*****************************************************************************************
  // ONLY EDIT: email
  // Enter the email address of the student who you want to remove from the VanSchedule Calendar
  //*****************************************************************************************
  var email = "";
  //*****************************************************************************************

  var calendar = CalendarApp.getCalendarById("allegheny.edu_93fhcf7oq8i7771q4ehm76k814@group.calendar.google.com");
  var sheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1qjh1UbBCpMU0obs-D6CP6WFEYRkZBZ7GXn-jp6SUeus/edit?ts=5653900e#gid=1564913810&vpid=A2");
  var columnNumber = sheet.getLastColumn();  // stores the number of columns that the sheet has
  var rowNumber = sheet.getLastRow();   // stores the number of rows that the sheet has
  var values = sheet.getSheetValues(2,1, rowNumber, columnNumber);
  var index = 0;
  
  for(var i =0; i<values.length; i++){
    for(var j =0; j<values[i].length; j++){
      if(email == values[i][j]){
        index=i;
      }
    }
  }
  var startTime = values[index][7];
  var endTime = values[index][8];
  var events = calendar.getEvents(startTime, endTime);

  for(var i =0; i<events.length; i++){
    var event = events[i];
    var GuestList=event.getGuestList();
    for(var j =0; j<GuestList.length; j++){
      if(GuestList[j].getEmail() == email){
        
        // If this student is the only one scheduled for this event, delete entire event
        if(GuestList.length == 1) {
          event.deleteEvent();
        }
        
        // If other students are also scheduled for the same time, only remove this student from the event
        // and edit the description + title to reflect this change
        else {
          event.removeGuest(email);
          event.deleteTag(email);
          
          // Iterate through tags for the remaining guests to re-create the description (sans this student)
          var updatedDescription = "";
          var tags = targetEvent.getAllTagKeys();
          for(var i = 0; i < tags.length; i++) {
            updatedDescription += event.getTag(tags[i]);
          }
          
          // Update the description and title
          event.setDescription(updatedDescription);
          event.setTitle("Students: " + targetEvent.getGuestList().length); 
        }
      }
    }
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Use this function to add a student to a certain event (or events) on the Google Calendar, even if the event
// already has 6 students as guests
function addStudentToEvent() {
  
  //*****************************************************************************************
  // ONLY EDIT: firstName, lastName, phone, email, site, program, typeOfEvent, targetDate,
  //            startTime, endTime
  //
  // Sample Input:
  // var firstName = "Joe";
  // var lastName = "Smith";
  // var phone = "123-456-7890";
  // var email = "smithj123@allegheny.edu";
  // var site = "Second District";
  // var program = "America Reads";
  // var typeOfEvent = "Drop-off";  // or "Pick-up"
  // var targetDate = "12/09/2015";
  // var startTime = "9:00 AM";
  // var endTime = "9:15 AM";
  //*****************************************************************************************
  var firstName = "";
  var lastName = "";
  var phone = "";
  var email = "";
  var site = "";
  var program = "";
  var typeOfEvent = "";  // "Pick-up" or "Drop-off"
  var targetDate = "";   // "MM/DD/YYYY"
  var startTime = "";    // "HH:SS AM" or "HH:SS PM"
  var endTime = "";      // "HH:SS AM" or "HH:SS PM"
  //*****************************************************************************************
  
  // Target the VanSchedule Google Calendar
  var calendar = CalendarApp.getCalendarById("allegheny.edu_93fhcf7oq8i7771q4ehm76k814@group.calendar.google.com");
  
  // Create proper Date objects based on user input
  startTime = new Date(targetDate + " " + startTime);
  endTime = new Date(targetDate + " " + endTime);
  
  // Create description based on student's contact info and destination
  var description = typeOfEvent + ": " + firstName + " " + lastName + "\n" +
      "\tWork Site: " + site + "\n" +
        "\tProgram: " + program + "\n" + 
          "\tPhone: " + phone + "\n" +
            "\tEmail: " + email + "\n";
  
  var events = calendar.getEvents(startTime, endTime);
  
  if(events.length == 0) {
    // Create event between startTime and endTime
    var createdEvent = calendar.createEvent("Students: 1", startTime, endTime);
    
    // Set description based on student's contact info and destination
    createdEvent.setDescription(description);
    
    // Add this student as a guest to the event, and set tags for future reference
    createdEvent.addGuest(email);
    createdEvent.setTag(email, description);
    createdEvent.setTag("typeOfEvent",typeOfEvent);
    createdEvent.setAnyoneCanAddSelf(false);
    createdEvent.setGuestsCanInviteOthers(false);
    createdEvent.setGuestsCanModify(false);
  }
  
  else {
    // Get the event in the desired time slot
    var editedEvent = events[0];
    
    // Get the list of guests for the existing event
    var guests = editedEvent.getGuestList();
    
    // Add this student to the event and set the corresponding tag with his/her description
    editedEvent.addGuest(email);
    editedEvent.setTag(email, description);
    
    // Iterate through all existing tags to re-populate description and set new description
    var updatedDescription = "";
    var tags = editedEvent.getAllTagKeys();
    for(var i = 0; i < tags.length; i++) {
      updatedDescription += editedEvent.getTag(tags[i]);
    }    
    editedEvent.setDescription(updatedDescription);
    
    // Set the title and type of event ("Pick-up" or "Drop-off")
    editedEvent.setTitle("Students: " + editedEvent.getGuestList().length);
    editedEvent.setTag("typeOfEvent",typeOfEvent);
    editedEvent.setAnyoneCanAddSelf(false);
    editedEvent.setGuestsCanInviteOthers(false);
    editedEvent.setGuestsCanModify(false);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Clears the events from the table in the VanShuttleSchedule Google Doc.
function clearScheduleTable() {
  
  //************************************************************************************************
  // NOTE: NO EDITING NEEDED
  //************************************************************************************************
  var doc = DocumentApp.openById("1CKWk5bT8n5h2-Dx__9LANFMpvFUUIalmx06inaGC7xk");
  var body = doc.getBody();
  var tables = body.getTables();
  for(var x = 1; x < 43; x++) {
    for(var y = 1; y < 6; y++) {
      tables[0].getCell(x,y).clear();
      tables[0].getCell(x,y).setBackgroundColor("#FFFFFF");
    }
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Force the ShuttleVanTable Google Doc to update
// (This is normally triggered automatically daily at midnight, but can be forced
// to update via this function)
function updateScheduleTable() {
  
  //************************************************************************************************
  // NOTE: NO EDITING NEEDED
  //************************************************************************************************
  createDocEvents();
}