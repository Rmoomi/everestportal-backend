// backend/services/firebaseAdmin.js
const admin = require("firebase-admin");

if (!admin.apps.length) {
  let serviceAccount;

  try {
    // ✅ Load local serviceAccount.json
    serviceAccount = require("./serviceAccount.json");
  } catch (error) {
    console.error("❌ Failed to load serviceAccount.json:", error);
    process.exit(1);
  }

  // ✅ Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log(
    "✅ Firebase Admin initialized successfully (using serviceAccount.json)"
  );
}

module.exports = admin;
