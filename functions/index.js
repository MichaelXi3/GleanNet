const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Cloud Function: addAdminRole
// Implementations: multiple callbacks
// After finished function, you need to deploy it to the firebase function by 'firebase  deploy --only functions' at terminal
const db = admin.firestore();

exports.addAdminRole = functions.https.onCall((data, context) => {
    // Ensure request is made by an admin
    if (context.auth.token.admin !== true) {
        return { error: 'Only admins can add other admins' };
    }

    return admin
        .auth()
        .getUserByEmail(data.email)
        .then((user) => {
            return admin.auth().setCustomUserClaims(user.uid, {
                admin: true,
            });
        })
        .then(() => {
            // Also add the new admin user to Firestore
            return db.collection('admins').doc(data.email).set({});
        })
        .then(() => {
            console.log("Successfully Added!");
            return {
                message: `Success! ${data.email} has been made an admin!`,
            };
        })
        .catch((err) => {
            console.log("Error");
            console.log(err);
            return err;
        });
});


// The email and passward sensitive information is set in firebase environmental variables
// Set command: firebase functions:config:set sendnotification.email="your-email@gmail.com" sendnotification.password="your-password"
// Get command: firebase functions:config:get
// Delete command: firebase functions:config:unset sendnotification
// Update config via deploy: firebase deploy --only functions

const sesEmail = functions.config().sendnotification.email;
const password = functions.config().sendnotification.password;

let mailTransporter = nodemailer.createTransport({
    host: "email-smtp.us-east-1.amazonaws.com",
    port: 587,     // or 25, or 465
    secure: false, // true for 465, false for other ports
    auth: {
        user: "AKIAVIOL4S4UZGKRL6PQ",
        pass: password
    }
});


// AWS SES - https://us-east-1.console.aws.amazon.com/ses/home?region=us-east-1#/verified-identities
const sendEmail = (email, subject, text) => {
    const mailOptions = {
        from: sesEmail,
        to: email,
        subject: subject,
        text: text
    };

    return new Promise((resolve, reject) => {
        mailTransporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Failed to send email:", error);
                reject(error);
            } else {
                console.log("Email sent:", info.response);
                resolve(info);
            }
        });
    });
};

exports.notifyAdminsOnNewResource = functions.firestore
    .document("PendingResources/{resourceId}")
    .onCreate(async (snap, context) => {
        const resourceData = snap.data();
        const subject = `Resource Creation Received: ${resourceData.name}`;
        const html = `
            New Resource Uploaded
            
            Resource Details:
            
            1. Name: ${resourceData.name}
            2. Description: ${resourceData.desc}

            `;
        const adminSnapshot = await db.collection('admins').get();
        const admins = adminSnapshot.docs.map(doc => doc.id);
        
        admins.forEach(admin => {
            sendEmail(admin, subject, html);
        });
    });

    exports.notifyAdminsOnResourceUpdate = functions.firestore
    .document('PendingUpdates/{resourceId}')
    .onCreate(async (snap, context) => {
        const resourceData = snap.data();
        const subject = `Resource Updates Received: ${resourceData.name}`;
        const html = `
            Resource Update Received

            Updated Resource Details:

            Name: ${resourceData.name}
            Description: ${resourceData.desc}

            `;
        const adminSnapshot = await db.collection('admins').get();
        const admins = adminSnapshot.docs.map(doc => doc.id);

        admins.forEach(admin => {
            sendEmail(admin, subject, html);
        });
    });
