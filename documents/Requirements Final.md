+ Herbie

#Requirements Document

##Purpose

This document details the functionality of the VanGo system.

##Document Conventions

Although this document is intended as a set of requirements, some technical
information has been provided for the audience.

##Intended Audience

The primary audience of this document will be the developers of VanGo and those working to transition to the VanGo system.

##Product Scope

This product is intended to replace a manual van scheduling system with an automated one.

##Product Functions
> This program will be implemented in Apps Script.
> There will be a Google form which will place information into a Google Spreadsheet about ride times and locations.
> Apps Script will pull ride time information from Google sheets.
> This program will use information from the students to create a schedule for which the van will run.
> Apps Scipt will place ride times into Google Calender
> The program will check to ensure that there are no conflicts.
> The program will handle time conflicts by notifying the individual of the conflict and requesting a new time.
> The program will be set to handle set intervals of 15 minutes.
> The scheduling should assume no trip will take longer than 15 minutes.
> If scheduling changes the program will notify the individual with an automated email.
> The schedule's focus will be on a week to week basis.
> The calendar is updated every time a student submits a form.
> A separate Google Doc will be create for printing. It will match the format of the previous schedule.
> Google Calendar will automatically send scheduled students a notification on any day when they have scheduled the shuttle.
> The way implemention will occur with the use of Google forms, Speadsheet, and Calendar will allow system to be available from anywhere to anyone with access. 
