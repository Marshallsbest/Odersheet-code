////////////////////////////////////////////////////////////////
// Create The Data Sheet which we use to calculate and feed to the invoice template
////////////////////////////////////////////////////////////////

  var dataSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("INVOICE_DB")
  var dataSheetName = dataSheet.getName();
function createPdfDataSheet() {
  var colNum = dataSheet.getLastColumn();
  var Invoice_Cred = SpreadsheetApp.getActiveSpreadsheet().getRangeByName('Invoice_Cred_Range').getFormula();
  var dataHeaders = dataSheet.getRange(1, 1, 1, colNum ).getValues();
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('PDF_DATA');
  if (sheet != null){
    var result = ui.alert(
      'You Already have a Sheet called PDF_DATA and the data will be deleted if you proceed',
      'Are you sure you want to continue?',
      ui.ButtonSet.YES_NO);
    if (result == ui.Button.YES) {
      ui.alert('Confirmation received.')
    } else { return }
  } else {
    var pdfDataSheetName = SpreadsheetApp.getActiveSpreadsheet().insertSheet().setName('PDF_DATA');}
    var pdfDataSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('PDF_DATA');
          pdfDataSheet.getRange(1,1,1,colNum).setValues(dataHeaders);
          pdfDataSheet.getRange(1,colNum + 1).setValue('Invoice_Credentials');
          pdfDataSheet.getRange(1,colNum + 2).setValue('Final_Cost');
          pdfDataSheet.getRange(4,1).setValue('=DATA!A11');
          pdfDataSheet.getRange(4,2).setValue('=DATA!A12');
          pdfDataSheet.getRange(5,1).setValue('=DATA!A14');
          pdfDataSheet.getRange(5,2).setValue('=DATA!A15');
          pdfDataSheet.getRange(2,1).setFormula('=INVOICE_DB!A2');
          pdfDataSheet.getRange(2,colNum + 2).setFormula('=SUM(H2:J2,L2:M2)');
          pdfDataSheet.getRange(2,colNum + 1).setFormula(Invoice_Cred);
    var sourceRange = pdfDataSheet.getRange(2,1);
    var destination = pdfDataSheet.getRange(2,1,1,colNum);
          sourceRange.autoFill(destination, SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES);}

//////////////////////////////////////////////////////////////////////////////////////////
// Create and Mail the Invoice
//////////////////////////////////////////////////////////////////////////////////////////

  function createPdf() {
    // Set up the docs and the spreadsheet access
    var pdfData = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("PDF_DATA")
    var pdfDataCol = pdfData.getLastColumn()
    var templateFile = DriveApp.getFileById(TEMPLATE_ID)
    var data = pdfData.getRange(1, 1, 2, pdfDataCol).getValues()
    var headerRow = data.shift()
    var dataRow = data.pop()
    var Send
    var headerValue
    var activeCell
    var copyFile
    var ID = null
    var recipient = null
    var numberOfColumns = headerRow.length
    var copyFile = templateFile.makeCopy()      
    var copyId = copyFile.getId()
    var copyDoc = DocumentApp.openById(copyId)
    var copyBody = copyDoc.getActiveSection()
      var urlRange = dataSheet.getRange(2,dataSheet.getLastColumn(),1, 1)

/////////////////////////////////////////////////////////////////////////////////////////
// Replace the keys with the spreadsheet values and look for a couple of specific values
//////////////////////////////////////////////////////////////////////////////////////////  
  
    for (var columnIndex = 0; columnIndex < numberOfColumns; columnIndex++) {
      headerValue = headerRow[columnIndex];
      activeCell = dataRow[columnIndex];
      activeCell = formatCell(activeCell);
      copyBody.replaceText('<<' + headerValue + '>>', activeCell);
    if (headerValue === FILE_NAME_COLUMN_NAME) {ID = activeCell; console.log("File Header header ok")};
    if (headerValue === EMAIL_CUSTOMER) {Send = activeCell; console.log("Email ok to send",Send)};
    if (headerValue === EMAIL_COLUMN_NAME) {recipient = activeCell;console.log("Email header ok", recipient)}};
      copyDoc.saveAndClose()                        // Create the PDF file 
    var newFile = DriveApp.createFile(copyDoc.getAs('application/pdf'))
      copyFile.setTrashed(true)                     // Rename the new PDF file
  
    if (PDF_FILE_NAME !== ''){newFile.setName(PDF_FILE_NAME)
    } else if (ID !== null){newFile.setName(ID)};   // Put the new PDF file into the results folder

    if (RESULTS_FOLDER_ID !== "") {      // Log the name of every folder in the user's Drive.
    var fileURL = DriveApp.getFolderById(RESULTS_FOLDER_ID).addFile(newFile).getUrl();
      urlRange.setValue(fileURL);
    
    } else {
      var newFolder = DriveApp.getRootFolder().createFolder("Customer Invoices").getId();
    RESULTS_FOLDER.setValue(newFolder);
    var fileURL = DriveApp.getFolderById(RESULTS_FOLDER_ID).addFile(newFile).getUrl();
      urlRange.setValue(fileURL);
      LOCAL.toast("New PDF files created but not emailed please dor to your CUSTOMER INVOICES folder to find the new PDF", 10);
      }
       // Private Functions
    // -----------------
    /**
    * Format the cell's value
    *
    * @param {Object} value
    *
    * @return {Object} value
    */
    function formatCell(value) {
      var newValue = value;
      if (newValue instanceof Date) {
          newValue = Utilities.formatDate(
          value, 
          Session.getScriptTimeZone(),DATE_FORMAT);
    } else if (typeof value === 'number') {
          newValue = Number(value).toFixed(2)}       
      return newValue;}                          // createPdf.formatCell()
  var fileName = newFile.getName();
  emailInvoice(Send, recipient, fileName)
  }                                              // createPdfs.createPdf()
////////////////////////////////////////////////////////////////////////////////////////////////////
// Email the invoice 
////////////////////////////////////////////////////////////////////////////////////////////////////
function emailInvoice(send,To,FileID){
 var client = To
  var sendToClient = send
  var invoicePdf = DriveApp.getFilesByName(FileID).next();
  var Email_Sub = SpreadsheetApp.getActiveSpreadsheet().getRangeByName('Email_Subject').getValue()
  var htmlBody = SpreadsheetApp.getActiveSpreadsheet().getRangeByName('Email_Message').getValue()
  var EMAIL_SUBJECT = (Email_Sub+" "+FileID);
  if (sendToClient == "No") {                        // console.log("Email No Called");
    MailApp.sendEmail({
      to: RMT,
      subject: EMAIL_SUBJECT,
      htmlBody: htmlBody,
      attachments: [invoicePdf]});
  } else { if(sendToClient == "Yes") {                 // console.log("Email Yes Called");
    var TO = (client+","+RMT);
    MailApp.sendEmail({
      to: TO,
      subject: EMAIL_SUBJECT,
      htmlBody: htmlBody,
      attachments: [invoicePdf]});
    LOCAL.toast("The PDF Was Emailed to the Customer", 6)}}; 
  }