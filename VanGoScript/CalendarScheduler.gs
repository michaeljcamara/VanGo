/** 
 * This class controls creating, editing, and removing Google Calendar events.
 */

/** CalendarScheduler constructor for initializing variables based on Student object*/
var CalendarScheduler = function(student) {
  
  // The student for which events will be created
  this.student = student;
  
  // The student's indicated startdDate and endDate for the shuttle service
  this.startDate = student.schedule.startDate;
  this.endDate = student.schedule.endDate;
  
  // Store lists containing the events successfully created, and those that have conflicts;
  // i.e. events where the shuttle is full at a desired time
  this.createdEvents = [];
  this.conflictEvents = [];
}

/** This method controls the overall sequence of events needed to update the Google Calendar
 *  using a particular student's information */
CalendarScheduler.prototype.updateCalendarSchedule = function() {
  
  // Remove any events in the calendar, from the student's startDate to endDate, where this student
  // is the only guest.  If multiple guests are in the event, just remove this student.
  this.removeExistingEvents();
  
  // Attempt to create (or edit existing) calendar events based on the student's desired pick-up and
  // drop-off times.
  this.createCalendarEvents();
  
  // If a certain time-slot has a conflict, ensure that any events that were created for that time-slot
  // are removed to ensure consistency of the schedule
  this.removeConflictEvents();
  
   // If conflicts have been encountered, send student an email
  var emailNotification = new EmailNotification(this.student.email);
  if(this.conflictEvents.length != 0) {
    emailNotification.sendEmail(this.conflictEvents);
  }
}

/** Iterate through all events in the calendar between the student's start-date and end-date.
 *  If an event exists with just this student as a guest, then delete the event.
 *  If an event exists with multiple guests, including this student, then remove the student
 *  from the guest list and update the description.
 *  This is done to ensure that no duplicate events are created if the student re-submits their
 *  Google Form request for shuttle times.  */
CalendarScheduler.prototype.removeExistingEvents = function() {
  
  // Get all events for the VanSchedule calendar between the startDate and endDate requested by student
  var existingEvents = CalendarApp.getCalendarById("allegheny.edu_93fhcf7oq8i7771q4ehm76k814@group.calendar.google.com").getEvents(this.startDate, this.endDate);

  // Iterate through each event between the startDate and endDate
  for(i = 0; i < existingEvents.length; i++) {
    var targetEvent = existingEvents[i];
    
    // Only consider events where this student is a guest
    if(targetEvent.getGuestByEmail(this.student.email) != null) {
      
      // If this student is the only one scheduled for the time slot, delete the event
      if(targetEvent.getGuestList().length == 1) {
        targetEvent.deleteEvent();
      }
      
      // If other students are scheduled for the time slot, remove this student and update the description/title
      else {
        
        // Remove the guest and associated tag
        targetEvent.removeGuest(this.student.email);
        targetEvent.deleteTag(this.student.email);
        
        // Iterate through tags for the remaining guests to re-create the description (sans this student)
        var updatedDescription = "";
        var tags = targetEvent.getAllTagKeys();
        for(var i = 0; i < tags.length; i++) {
          updatedDescription += targetEvent.getTag(tags[i]);
        }
        
        // Update the description and title
        targetEvent.setDescription(updatedDescription);
        targetEvent.setTitle("Students: " + targetEvent.getGuestList().length); 
      }
    }
  }
}

/** Create or edit Google Calendar events for each time slot desired by the student.
 *  If no events exist at a time slot, then create the event as planned.
 *  If an event exists, then edit it to include the student. */
CalendarScheduler.prototype.createCalendarEvents = function() {
  
  // Iterate through each day individually, from the startDate to the endDate
  for(var currentDate = this.startDate ; currentDate.getTime() <= this.endDate.getTime(); currentDate = this.addDaysToDate(currentDate, 1)) {
    
    // Store the day of the week (0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Sunday)
    var day = currentDate.getDay();
    
    // Only consider days of the week that the student has scheduled time for
    if(this.student.times[day] != undefined) {
      
      // Store the start and end times for the dropoff and pickup events
      // NOTE: These have arbitrary dates (i.e. the MM/DD/YYYY values are place-holders)
      var dropoffDeparture = this.student.times[day].dropoffDeparture;
      var dropoffArrival = this.student.times[day].dropoffArrival;
      var pickupDeparture = this.student.times[day].pickupDeparture;
      var pickupArrival = this.student.times[day].pickupArrival;
      
      // Assign these times the currentDate (MM/DD/YYYY values) under consideration
      dropoffDeparture = this.assignDateToTime(currentDate, dropoffDeparture);
      dropoffArrival = this.assignDateToTime(currentDate, dropoffArrival);
      pickupDeparture = this.assignDateToTime(currentDate, pickupDeparture);
      pickupArrival = this.assignDateToTime(currentDate, pickupArrival);
      
      // Store any events that currently exist in the designated 15 minute time slot on the Google Calendar
      var dropoffEvent = calendar.getEvents(dropoffDeparture, dropoffArrival)[0];
      var pickupEvent = calendar.getEvents(pickupDeparture, pickupArrival)[0];
      
      // Pause the function to prevent overloading Google servers
      Utilities.sleep(250);
      
      // Create or edit existing event, depending on if timeslot for the dropoff time is occupied
      if(dropoffEvent == null) {
        dropoffEvent = this.createNewEvent(currentDate, dropoffDeparture, dropoffArrival, "Drop-off");
      }
      else {
        dropoffEvent = this.editExistingEvent(dropoffEvent, currentDate, dropoffDeparture, dropoffArrival, "Drop-off");
      }
      
      // Pause the function to prevent overloading Google servers
//      Utilities.sleep(2000);
      
      // Create or edit existing event, depending on if timeslot for the pickup time is occupied
      if(pickupEvent == null) {
        pickupEvent = this.createNewEvent(currentDate, pickupDeparture, pickupArrival, "Pick-up");
      }
      else {
        pickupEvent = this.editExistingEvent(pickupEvent, currentDate, pickupDeparture, pickupArrival, "Pick-up");
      }
    }   
  }
}

/** Create a brand new event for the current date between the startTime and endTime. */
CalendarScheduler.prototype.createNewEvent = function(currentDate, startTime, endTime, typeOfEvent) {
  
  // Create event between startTime and endTime
  var event = calendar.createEvent("Students: 1", startTime, endTime);
  
  // Create and set description based on student's contact info and destination
  var description = typeOfEvent + ": " + this.student.first + " " + this.student.last + "\n" +
      "\tWork Site: " + this.student.site + "\n" +
        "\tProgram: " + this.student.program + "\n" + 
          "\tPhone: " + this.student.phone + "\n" +
            "\tEmail: " + this.student.email + "\n";
  event.setDescription(description);
  
  // Add this student as a guest to the event, and set tags for future reference
  event.addGuest(this.student.email);
  event.setTag(this.student.email, description);
  event.setTag("typeOfEvent",typeOfEvent);
  event.setAnyoneCanAddSelf(false);
  event.setGuestsCanInviteOthers(false);
  event.setGuestsCanModify(false);
  
  // Add this event to the list of successfully created events
  this.createdEvents.push(event);
  
  return event;
}

/** Edit an event that currently exists on the Google Calendar between the startTime and endTime */
CalendarScheduler.prototype.editExistingEvent = function(event, currentDate, startTime, endTime, typeOfEvent) {
  
  // Get the list of guests for the existing event
  var guests = event.getGuestList();
  
  // If the shuttle is full for this time (i.e. there are already 6 students scheduled),
  // then do NOT edit the event; instead add this event to the list of conflictEvents
  if(guests.length >= 6) {
    
    // Set tag for the type of event this was going to be for the student ("Pick-up" or "Drop-off")
    event.setTag("typeOfEvent",typeOfEvent);
    
    // Add this event to the list of events NOT scheduled due to a conflict
    this.conflictEvents.push(event);
  }
  
  // If the shuttle is not full, then edit the event
  else {
    
    // Create a description based on student's contact info and destination
    var description = typeOfEvent + ": " + this.student.first + " " + this.student.last + "\n" +
      "\tWork Site: " + this.student.site + "\n" +
        "\tProgram: " + this.student.program + "\n" + 
          "\tPhone: " + this.student.phone + "\n" +
            "\tEmail: " + this.student.email + "\n";
    
    // Add this student to the event and set the corresponding tag with his/her description
    event.addGuest(this.student.email);
    event.setTag(this.student.email, description);
    
    // Iterate through all existing tags to re-populate description and set new description
    var updatedDescription = "";
    var tags = event.getAllTagKeys();
    for(var i = 0; i < tags.length; i++) {
      updatedDescription += event.getTag(tags[i]);
    }    
    event.setDescription(updatedDescription);
    
    // Set the title and type of event ("Pick-up" or "Drop-off")
    event.setTitle("Students: " + event.getGuestList().length);   
    event.setTag("typeOfEvent",typeOfEvent);
    event.setAnyoneCanAddSelf(false);
    event.setGuestsCanInviteOthers(false);
    event.setGuestsCanModify(false);
    
    // Add this event to the list of successfully created events
    this.createdEvents.push(event);
  }
}

/** After creating/editing all appropriate events, iterate through the list of conflict events
 *  (events that were not scheduled due to the shuttle being full), and the list of created events
 *  (events that were able to accomodate the student), and remove the student from all created events
 *  that share the same weekday and time-slot for each conflict event.
 *
 *  Sample scenario:
 *  Student A first schedules Tuesday drop-off for 9:00AM and pick-up for 2:00PM from Dec 1 (Tues) - Dec 15 (Tues),
 *  which fills up the shuttle for those times.  Student B then schedules for Tuesdays the same drop-off/pick-up times
 *  for Dec 8 (Tues) - Dec 22 (Tues).  In this case, Student B will have conflicts for those times for Dec 8 and Dec 15,
 *  but would technically be able to schedule those times for Dec 22.  However, this method will remove the student from
 *  the Dec 22 events due to the previous conflicts for the same time-slots on the same day.
 *  
 *  This is done in order to simplify the scheduling process, and avoid having student schedules that have multiple 
 *  different drop-off/pick-up times that vary week-to-week.  */
 
CalendarScheduler.prototype.removeConflictEvents = function() {
  
  // Iterate through all events with conflicts (which have NOT been scheduled)
  for(var i = 0; i < this.conflictEvents.length; i++) {
    var conflictEvent = this.conflictEvents[i];
    var conflictDay = conflictEvent.getEndTime().getDay();
    var conflictType = conflictEvent.getTag("typeOfEvent");
    
    // Iterate through all created events (which HAVE been scheduled)
    for(var j = 0; j < this.createdEvents.length; j++) {
      var createdEvent = this.createdEvents[j];
      var createdDay = createdEvent.getEndTime().getDay();
      var createdType = createdEvent.getTag("typeOfEvent");
      
      // If the createdEvent matches the same time slot and weekday as the conflict event, then remove it
      if(createdDay == conflictDay && createdType == conflictType) {
        
        // Get the index for the created event matching the conflict event's day and type
        var createdIndex = this.createdEvents.indexOf(createdEvent);
        
        // Remove this event from the list of created events
        this.createdEvents.splice(createdIndex, 1);
        
        // If this student is the only one scheduled for the time slot, delete the event
        if(createdEvent.getGuestList().length == 1) {
          createdEvent.deleteEvent();
        }
        
        // If other students are scheduled for the time slot, remove this student and update the description/title
        else {
          
          // Remove the guest and associated tag
          createdEvent.removeGuest(this.student.email);
          createdEvent.deleteTag(this.student.email);
          
          // Iterate through tags for the remaining guests to re-create the description (sans this student)
          var updatedDescription = "";
          var tags = createdEvent.getAllTagKeys();
          for(var i = 0; i < tags.length; i++) {
            updatedDescription += createdEvent.getTag(tags[i]);
          }
          
          // Update the description and title
          createdEvent.setDescription(updatedDescription);
          createdEvent.setTitle("Students: " + createdEvent.getGuestList().length); 
        }
      }
    }
  }
}


// Modify the targetDate to give it the same time parameters as targetTime
CalendarScheduler.prototype.assignDateToTime = function(targetDate, targetTime) {
  
  var modifiedDate = new Date();
  
  modifiedDate.setYear(targetDate.getYear());
  modifiedDate.setMonth(targetDate.getMonth());
  modifiedDate.setDate(targetDate.getDate());
  modifiedDate.setHours(targetTime.getHours());
  modifiedDate.setMinutes(targetTime.getMinutes());
  modifiedDate.setSeconds(0);
  
  return modifiedDate;       
}

// Increment a date object by a specified number of days
CalendarScheduler.prototype.addDaysToDate = function(currentDate, numDays) {
  
  var startTime = currentDate.getTime();
  var endTime = startTime + (1000 * 60 * 60 * 24 * numDays);
  var endDate = new Date(endTime);
  
  return endDate;
}