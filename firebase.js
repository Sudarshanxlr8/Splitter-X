
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";



const firebaseConfig = {
    apiKey: "your api key",
    authDomain: "your authdomain ",
    projectId: "your project id",
    storageBucket: "your storageBucket ",
    messagingSenderId: "your messagingSenderId ",
    appId: "your appID",
    measurementId: "your measurement id"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);


export { db, analytics };
