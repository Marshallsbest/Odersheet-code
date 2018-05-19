/*******   /\
 *        /||\
  *      / || \
   *       ||
   *       ||
   *       
   * --- USE THE PUBLISH MENU DIRECTLY ABOVE TO DEPLOY THE APP ---
   *    
   *    
   *     Click on 'Depoly as Web App' in the option window that loads choose the following:
   *      
   *     Execute the App as: 
   *     ---------------------------------------
   *     |  "Me ( your@gmailacountname.com) "  |
   *     ---------------------------------------
   *     Who has access to the App:
   *     ---------------------------------------
   *     |  "Anyone Including Annonymous"      |
   *     ---------------------------------------
   *     
   *   
   * --- Click the 'Update Button' then close the Tab the the editor is in and refresh the --- 
   *     
   *
   *   Attribution:
   *   Bruce McPherson for the use of his C useFull Library which provides a fiddler used to handle 
   *   the main set of Data returned from the web form learn more at https://github.com/brucemcpherson/cUseful
   * 
   *   I was also able to find a script which made the templating of invoices am umderstandable process. How ever I lost 
   *   the link so I can't give him proper thanks. 
   *
   *   Also check out the Google+ Apps Script Group for help and to meet others.
   *
   *
   *
  *
 *
**/

//////////////////////////////////////////////////////////////////////////////////////////////
// Set Global variables for quick addressing                                                //
// Global Variable                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////


var LOCAL = SpreadsheetApp.getActiveSpreadsheet();
var intro1 =  LOCAL.getSheetByName('Intro1'); //
var intro2 =  LOCAL.getSheetByName('Intro2'); // Used for the set up procedure 
var intro3 =  LOCAL.getSheetByName('Intro3'); //
var welcome =  LOCAL.getSheetByName('Welcome');
var INV_DB = LOCAL.getSheetByName('INVOICE_DB').getDataRange();
var SHEET = LOCAL.getActiveSheet();
var PDF_FILE_NAME = ''; // Leave Blank to use the invoice number
var getTemplate = LOCAL.getRangeByName("TEMPLATE_ID"); 
var TEMPLATE_ID = getTemplate.getValue(); // Template for the PDF Invoice
var RESULTS_FOLDER = LOCAL.getRangeByName("Results_Folder"); // The folder in which the invoices will be saved
var RESULTS_FOLDER_ID = RESULTS_FOLDER.getValues();
var FILE_NAME_COLUMN_NAME = "Invoice";
var EMAIL_COLUMN_NAME = "Email"; // 3. If an email address is specified you can email the PDF
var EMAIL_CUSTOMER = "Send";
var DATE_FORMAT = 'yyyy/MM/dd';
var userProp = PropertiesService.getUserProperties();
var owner = SpreadsheetApp.getActiveSpreadsheet().getOwner().getEmail();
var user = Session.getEffectiveUser().getEmail();
var RMT = owner;
 
/////////////////////////////////////////////////////////////////////////////////////////////
// For returning the Contact info to the form                                              //
/////////////////////////////////////////////////////////////////////////////////////////////

function doGet(request) {
  return HtmlService.createTemplateFromFile('index').evaluate();}
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();}
function getInvoice() {
      var INVOICE = LOCAL.getRangeByName("INVOICE_COUNT").getValue();
      var INV_PREFIX = LOCAL.getRangeByName("INVOICE_PREFIX").getValue();
      var INVOICENUM = (INV_PREFIX+INVOICE);
  return INVOICENUM}

/////////////////////////////////////////////////////////////////////////////////////////////
/// Processing the form submission                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////

function processForm(formObject) {
      var invoiceValues = INV_DB.getValues();
      var fiddler = new cUseful.Fiddler().setValues(invoiceValues);  //Create a new Fiddler for handling Invoice Data
      var getInvoiceNum = getInvoice();
      var recordDate = new Date();
      var newInvoice = [{
          Invoice:getInvoiceNum,
          Date:recordDate,
          Invoice_Date:new Date(formObject.Invoice_Date),
          First_Name:formObject.First_Name,
          Last_Name:formObject.Last_Name,
          Email:formObject.Email,
          Phone:formObject.Phone,
          Treatment:formObject.Treatment,
          Osteopathy:parseFloat(formObject.OsteoAmount).toFixed(2),
          Massage:parseFloat(formObject.MassageAmount).toFixed(2),
          HST:parseFloat(Number(formObject.Hst)+0).toFixed(2),
          Rent:parseFloat(formObject.Rental).toFixed(2),
          Redeem:parseFloat(Number(formObject.Redeem)+0).toFixed(2),
          Paid:parseFloat(Number(formObject.Paid)+0).toFixed(2),
          Total:parseFloat(Number(formObject.Total)+0).toFixed(2),
          Send:formObject.Send,
          Note:formObject.Note,
          Osteo_Gift:parseFloat(formObject.osteoGift).toFixed(2),
          Massage_Gift:parseFloat(formObject.massageGift).toFixed(2)}];
          fiddler.insertRows(0,1,newInvoice);
          showFiddler(fiddler,INV_DB); // write to a sheet and take a look
          createPdf();
      var INVOICE_SH = LOCAL.getSheetByName('INVOICE_DB');
      var INVOICEURL = INVOICE_SH.getRange(2,INVOICE_SH.getLastColumn() ,1, 1).getValue(); //console.log('returned object',INVOICEURL) 
        return INVOICEURL};

/////////////////////////////////////////////////////////////////////////////////////////
/// Re Apply the teh values to the INVOICE_DB                                          //
/////////////////////////////////////////////////////////////////////////////////////////

function showFiddler(fiddlerObject, outputRange) {   // clear and write result 
        outputRange.getSheet().clearContents();
        fiddlerObject.getRange(outputRange).setValues(fiddlerObject.createValues());
          LOCAL.toast('Invoice Logged to INVOICE_DB', 'Status', 3);
          updateInvoiceNum();}

/////////////////////////////////////////////////////////////////////////////////////////
/// Update the Invoice Count                                                           //
/////////////////////////////////////////////////////////////////////////////////////////

function updateInvoiceNum() {
      var newNumber = LOCAL.getRangeByName("INVOICE_COUNT").getValue()
        newNumber++
          LOCAL.getRangeByName("INVOICE_COUNT").setValue(newNumber)}
          
/////////////////////////////////////////////////////////////////////////////////////////
/// Reseting the Invoice numbering system                                              //
/////////////////////////////////////////////////////////////////////////////////////////

function resetInvoiceNum() {
  var ui = SpreadsheetApp.getUi(); // Same variations.
  var result = ui.prompt(
    'You\'ve selected the invoice numbering reset option. '+
    'You can choose a prefix to the count if you like. '+
    'ie:OSTEO. '+
    'This would make your next invoice number OSTEO-0001. '+
    'Leave it blank for a numbered invoice. 00001 ',
    ui.ButtonSet.OK_CANCEL); // Process the user's response.
  var button = result.getSelectedButton();
  var text = result.getResponseText();
  if (button == ui.Button.OK) { // User clicked "OK".
    INVOICE = 1000;
    LOCAL.getRangeByName("INVOICE_COUNT").setValue(INVOICE);
    console.log("Invoice", INVOICE)
    console.log(text);
    INV_PREFIX = (text + "-");
    console.log("INV_PREFIX",INV_PREFIX);
    LOCAL.getRangeByName("INVOICE_PREFIX").setValue(INV_PREFIX);
    console.log("Together", INV_PREFIX + INVOICE);
    var message = ("Invoice Count Reset in Memory to " + INV_PREFIX + INVOICE);
    LOCAL.toast(message, "Status", 3);
  } else if (button == ui.Button.CANCEL) {  // User clicked "Cancel".
    ui.alert("Invoice count has not been Changed");
  } else if (button == ui.Button.CLOSE) {   // User clicked X in the title bar.
    ui.alert("You cancelled the operation.");}}

//////////////////////////////////////////////////////////////////////////////////////////
/// Applying the accountant info                                                        //
//////////////////////////////////////////////////////////////////////////////////////////

function acctInfo() {
  Logger.log("open Login Called!");
  var html = HtmlService.createHtmlOutputFromFile('acctForm').setWidth(300).setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html,"Please enter your Acountants info")};
function acctUpdate(newObject) {
  var firstName = newObject.acctFirst;
  var lastName = newObject.acctLast;
  var acctEmail = newObject.acctEmail;
  var reportDay = newObject.reportDay;
  var fnRange = LOCAL.getRangeByName("Acct_Given").setValue(firstName);
  var lnRange = LOCAL.getRangeByName("Acct_Family").setValue(lastName);
  var elRange = LOCAL.getRangeByName("Acct_Email").setValue(acctEmail);
  var rdRange = LOCAL.getRangeByName("reportDay").setValue(reportDay);
  intro() }

/////////////////////////////////////////////////////////////////////////////////////////////
////// Daily Reporting.                                                                    //
////// Schedule the trigger to execute at 11 pm every day in the US/eastern time zone      //
/////////////////////////////////////////////////////////////////////////////////////////////

function grabTotals() {
  var totals = LOCAL.getRangeByName("DAILY_TOTALS");
  var values = totals.getValues();
  var summary = LOCAL.getSheetByName("Summary");
  var newLine = summary.insertRowBefore(3).getRange(3,1,1,totals.getLastColumn());
  newLine.setValues(values);}

/////////////////////////////////////////////////////////////////////////////////////////////
/////// Create the Invoice Folder and Template                                             //
/////////////////////////////////////////////////////////////////////////////////////////////

function makeFolder() {
  var ui = SpreadsheetApp.getUi();
  var urlRange = LOCAL.getRangeByName('Template_SRC');
  var oldUrl = urlRange.getValue();
  var ID = DriveApp.createFolder('Customer Invoices').getId();
  var docId = DocumentApp.openByUrl(oldUrl).getId();
  console.log('old URL',oldUrl);
  var folder= DriveApp.getFolderById(ID);
  var user = Session.getActiveUser().getEmail();
  console.log('user: ', user);
  var docFile = DriveApp.getFileById(docId).makeCopy(folder).setName('Customer Invoices').setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
  var doc_ID = docFile.getId();
  console.log('template ID',doc_ID);
  var newUrl = docFile.getUrl();
  console.log('newUrl',newUrl);
  urlRange.setValue(newUrl);
  console.log('var test of results folder ID', RESULTS_FOLDER_ID)
  getTemplate.setValue(doc_ID);
  RESULTS_FOLDER.setValue(ID);
  console.log('var test of results folder ID', RESULTS_FOLDER_ID)
  LOCAL.toast("New Folder and template created", 5);
  ui.alert('Time to launch your Web App! Please follow the instructions!');
  intro3.activate()
  acctInfo() };

/////////////////////////////////////////////////////////////////////////////////////////////
/////// Create user instructions and user menus                                            //
/////////////////////////////////////////////////////////////////////////////////////////////

function onOpen(){
  intro()}

/////////////////////////////////////////////////////////////////////////////////////////////
/////// Create user instructions and user menus                                            //
/////////////////////////////////////////////////////////////////////////////////////////////

function intro() {
  var ui =  SpreadsheetApp.getUi();
  console.log('owner', owner)
  console.log('User', user )
  if(user !== owner){intro1.activate();
                     console.log('Event', "New User Detected")
                     LOCAL.getRangeByName("WEBAPP_URL").setValue("")
                     console.log('Event', "Invoice URL Set Blank")
                     ui.alert('You are not the owner please follow the instructions to make your own copy!');}
  else{ 
    if (userProp.getProperty('AuthTo')) {
      console.log('Event', "User Preoperty AuthTo Found true")
      var webApp = LOCAL.getRangeByName("WEBAPP_URL").getValue();
      if ( webApp !=="") {
        userMenu();}
      else{
        webUrl()}
    } else {
     
      SpreadsheetApp.getUi()
      .createMenu('AUTHORIZE HERE')
      .addItem('Authorize', 'authorize')
      .addToUi()
       ui.alert('You are now the owner and must authorize the code before it will work, Follow the instructions');
      intro2.activate()}}}

/////////////////////////////////////////////////////////////////////////////////////////////
// create the menu in the spread sheet                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////

function userMenu() {  
   var ui =  SpreadsheetApp.getUi();
   ui.createMenu('Integrative Vitality')
  .addItem('Make Invoice Folder','makeFolder')
  .addSeparator()
  .addSubMenu(ui.createMenu("Reset and Set up")
              .addItem('Reset Invoice Count','resetInvoiceNum')
              .addItem('Reset Accountant Info','acctInfo')
              .addItem('Reset PDF Data Sheet', 'createPdfDataSheet')
              .addItem('Get Invoice Link', 'webUrl'))
  .addToUi()
    intro1.hideSheet();
    intro2.hideSheet();
    intro3.hideSheet();
    welcome.activate();
}

/////////////////////////////////////////////////////////////////////////////////////////////
// Ensuring that the script gets published as a webapp                                     //
/////////////////////////////////////////////////////////////////////////////////////////////

function webUrl(){
   console.log('webapp url check called',true)
  var svc = ScriptApp.getService();
  // Publish the script as a web app if it isn't currently.
  if (svc.isEnabled()) {
    var url = svc.getUrl();
    LOCAL.getRangeByName("WEBAPP_URL").setValue(url)
    console.log('WEBAPP_URL', url)
   userMenu()
  }else{
    LOCAL.getRangeByName("WEBAPP_URL").setValue(url)
          SpreadsheetApp.getUi().alert('Somthing went wrong please reload the spreadsheet');
      }
}

/////////////////////////////////////////////////////////////////////////////////////////////
// request Authorization                                                                   //
/////////////////////////////////////////////////////////////////////////////////////////////

function authorize() {
  var msg = "Hi, " + user + "\nThanks for authorizing."
  userProp.setProperty('AuthTo', user);
  SpreadsheetApp.getUi()
  .alert(msg);
  makeFolder()
}