Content Scraper
This is the 6th project of my Techdegree program
Note: Download zip file from github.

Run npm start to run the program.

This program allows users to create a csv file from the site 
http://shirts4mike.com/.
The csv file will contain all of the shirts listed on the main 
page of the site and the following details under the following headings:
Title, Price, ImageURL, URL, Time

The csv file will be stored in the data folder and the file name will 
contain the date and time it was created.

New runs result in the old csv being deleted and a new one with
the correct timestamp created.

If an error occurs connecting to the site the errors will be logged in the
scraper-error-log file.
