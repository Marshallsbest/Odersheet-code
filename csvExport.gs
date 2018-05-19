////////////////////////////////////////////////////////////////////////////////////////////////
/// Future .CSV file export                                                                   //
////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * For generating the csv file
 */
 /*
 function convertRangeToCsvFile_(csvFileName) {
    // Get the selected range in the spreadsheet
    var ws = SpreadsheetApp.getActiveSpreadsheet().getRange("TotalsData") ;
    try {
      var data = ws.getValues();
      var csvFile = undefined;
      */
/** 
 * Loop through the data in the range and build a string with the CSV data 
 * 
 */
 /*
 if (data.length > 1) {
 var csv = "";
        for (var row = 0; row < data.length; row++) {
          for (var col = 0; col < data[row].length; col++) {
            if (data[row][col].toString().indexOf(",") != -1) {
              data[row][col] = "\"" + data[row][col] + "\"";
            }
          }
          // Join each row's columns
          // Add a carriage return to end of each row, except for the last one
          if (row < data.length-1) {
            csv += data[row].join(",") + "\r\n";
          }
          else {
            csv += data[row];
          }
        }
        csvFile = csv;
      }
      return csvFile;
    }
    catch(err) {
        Logger.log(err);
      Browser.msgBox(err);
    }  
   */