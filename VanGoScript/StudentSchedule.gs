/** 
 * This class represents the student's request for shuttle service, including
 * their weekly desired drop-off and arrival times for each day of the week.
 */

/** Constructor for StudentSchedule to initalize dates and times */
var StudentSchedule = function(lastEntry) {
  
  // Date that the student wishes to start using the shuttle service
  this.startDate = lastEntry[7];
  
  // Date that the student will stop using the shuttle service
  this.endDate = lastEntry[8];
  
  // Store all of the times that the student wishes to be dropped-off and picked-up for each day.
  // Here, the index is mapped to a day of the week: 1 = Monday, 2 = Tuesday, ... , 5 = Friday.
  // E.g. "times[1].dropoffDeparture" yields the time to depart from Allegheny on Monday to drop-off
  // this student at a work site.
  this.times = {};
  
  // Iterate through the cells from the Google sheet from Monday(columns 9+10) through Friday (columns 17+18)
  for(var columnIndex = 9, dayIndex = 1; dayIndex <= 5; columnIndex += 2, dayIndex++) {
    
    // Store the dropoffTime (first column) and pickupTime (second column)
    var dropoffTime = lastEntry[columnIndex];
    var pickupTime = lastEntry[columnIndex + 1];
    
    // Store the dropoff and pickup times if both cells are non-empty in the corresponding sheet
    if(dropoffTime.length != 0 && pickupTime != 0) {
        
      this.times[dayIndex] = {dropoffDeparture : this.subtract15Minutes(dropoffTime),
                              dropoffArrival : this.createDateFromTime(dropoffTime),
                              pickupDeparture : this.subtract15Minutes(pickupTime),
                              pickupArrival : this.createDateFromTime(pickupTime)};
    }
  }
}

/** Subtract a total of 15 minutes from a given Date object, then return the modified date*/
StudentSchedule.prototype.subtract15Minutes = function(startTime) {
  
  // Normalize the given date to fit within current semester
  var startDate = this.createDateFromTime(startTime);
  
  // Subtract a total of 15 minutes from the given starting date/time
  var startTime = startDate.getTime();
  var endTime = startTime - (1000 * 60 * 15);
  var endDate = new Date(endTime);
  
  return endDate;
}

/** Normalize a Date object intialized with only HH:MM values to a standard Date using
  * the current startDate for the year/month/date */
StudentSchedule.prototype.createDateFromTime = function(startTime) {

  //Isolate the Year/Month/Date from the startDate, and the Hours/Minutes from the startTime  
  var splitTime = startTime.split(":");   
  var year = this.startDate.getYear();
  var month = this.startDate.getMonth();
  var date = this.startDate.getDate();
  var hours = Number(splitTime[0]);
  var minutes = String(splitTime[1]).substring(0,2);
  
  // Correct the hours for AM or PM
  if(hours != 12 && splitTime[1].substring(3) == "PM") {
    hours += 12;
  }

  // Create and return a new Date object with these values
  var normalizedDate = new Date();  
  normalizedDate.setYear(year);
  normalizedDate.setMonth(month);
  normalizedDate.setDate(date);
  normalizedDate.setHours(hours);
  normalizedDate.setMinutes(minutes);
  normalizedDate.setSeconds(0);
  
  return normalizedDate;
}