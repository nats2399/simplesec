
var os = require('os');
if (os.platform() == 'win32') {  
    if (os.arch() == 'ia32') {
        var chilkat = require('@chilkat/ck-node11-win-ia32');
    } else {
        var chilkat = require('@chilkat/ck-node11-win64'); 
    }
} else if (os.platform() == 'linux') {
    if (os.arch() == 'arm') {
        var chilkat = require('@chilkat/ck-node11-arm');
    } else if (os.arch() == 'x86') {
        var chilkat = require('@chilkat/ck-node11-linux32');
    } else {
        var chilkat = require('@chilkat/ck-node11-linux64');
    }
} else if (os.platform() == 'darwin') {
    var chilkat = require('@chilkat/ck-node11-macosx');
}
var express = require('express');
var router = express.Router();

function chilkatExample(subject, body, to) {

    // This example requires the Chilkat API to have been previously unlocked.
    // See Global Unlock Sample for sample code.

    // The mailman object is used for sending and receiving email.
    var mailman = new chilkat.MailMan();

    // Set the SMTP server.
    mailman.SmtpHost = "smtp.gmail.com";

    // Set the SMTP login/password (if required)
    mailman.SmtpUsername = "simplesec.info@gmail.com";
    mailman.SmtpPassword = "Simplesec123.";
    
    mailman.SmtpSsl = true;
    mailman.SmtpPort = 465;

    var cert = new chilkat.Cert();
    var success = cert.LoadFromFile("google.cer");
    if (success !== true) {
        console.log(cert.LastErrorText);
        return;
    }

    // Create a new email object
    var email = new chilkat.Email();

    email.Subject = subject;
    email.Body = body;
    email.From = "SimpleSec Support <simplesec.info@gmail.com>";
    var success = email.AddTo("Chilkat Admin",to);
    // To add more recipients, call AddTo, AddCC, or AddBcc once per recipient.

    // Call SendEmail to connect to the SMTP server and send.
    // The connection (i.e. session) to the SMTP server remains
    // open so that subsequent SendEmail calls may use the
    // same connection.  

    var glob = new chilkat.Global();
    var success = glob.UnlockBundle("Anything for 30-day trial");
    if (success !== true) {
        console.log(glob.LastErrorText);
        return;
    }

    var status = glob.UnlockStatus;
    if (status == 2) {
        console.log("Unlocked using purchased unlock code.");
    }
    else {
        console.log("Unlocked in trial mode.");
    }

    //Indicate that the email is to be sent encrypted.
    email.SendEncrypted = true;

    // Specify the certificate to be used for encryption.
    success = email.SetEncryptCert(cert);

    success = mailman.SendEmail(email);
    if (success !== true) {
        console.log(mailman.LastErrorText);
        return;
    }

    // Some SMTP servers do not actually send the email until 
    // the connection is closed.  In these cases, it is necessary to
    // call CloseSmtpConnection for the mail to be  sent.  
    // Most SMTP servers send the email immediately, and it is 
    // not required to close the connection.  We'll close it here
    // for the example:
    success = mailman.CloseSmtpConnection();
    if (success !== true) {
        console.log("Connection to SMTP server not closed cleanly.");
    }

    console.log("Mail Sent!");

}

chilkatExample("HEllo THere","Encrypted Message","mifidoor@gmail.com");

module.exports = router;