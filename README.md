


          
# SplitterX

![SplitterX Logo](assets/logo.png) *(Replace with actual logo if available)*

**SplitterX** is an amazing web application designed to simplify bill splitting among friends, family, or colleagues. It allows users to create or join splitting sessions, add transactions, calculate balances, and minimize settlements in real-time using Firebase for data storage. Say goodbye to complicated calculations and hello to hassle-free bill sharing! 💸

## Features

- **Session Management**: Create a new splitting session as a host or join an existing one using a unique 6-character code.
- **Member Management**: Hosts can add members during setup, and participants join by entering their name. Add more members anytime during the session.
- **Transaction Tracking**: Add, edit, or delete transactions with details like description, amount, payer, and split among members.
- **Real-time Updates**: Transactions and balances update in real-time for all participants using Firebase Firestore.
- **Balance Calculation**: Automatically computes each member's balance and suggests minimized settlements (who pays whom).
- **User-Friendly Interface**: Built with Tailwind CSS for a modern, responsive design with gradients and animations.
- **Persistent Data**: All session data is saved in Firebase, allowing seamless continuation.

## Tech Stack

- **Frontend**: HTML, JavaScript, Tailwind CSS
- **Backend/Database**: Firebase Firestore
- **Other**: Firebase Analytics

## Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/splitterx.git
   cd splitterx
   ```

2. **Configure Firebase**:
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
   - Enable Firestore Database and Analytics.
   - Copy your Firebase configuration details.
   - Create a file named `firebase.js` in the root directory with the following content, replacing placeholders with your actual keys:

     ```javascript:f:\Splitter (public)\SplitterX\firebase.js
     import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
     import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
     import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";

     const firebaseConfig = {
         apiKey: "YOUR_API_KEY",
         authDomain: "YOUR_AUTH_DOMAIN",
         projectId: "YOUR_PROJECT_ID",
         storageBucket: "YOUR_STORAGE_BUCKET",
         messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
         appId: "YOUR_APP_ID",
         measurementId: "YOUR_MEASUREMENT_ID"
     };

     const app = initializeApp(firebaseConfig);
     const db = getFirestore(app);
     const analytics = getAnalytics(app);

     export { db, analytics };
     ```

3. **Install Dependencies** (if any, though this app is mostly client-side):
   - The app uses CDN for Tailwind CSS and Firebase SDKs, so no npm install is needed. For backend (if extended), see `requirements.txt` for Python dependencies like Flask and firebase-admin.

4. **Run the App**:
   - Open `index.html` in a modern web browser.
   - For development, use a local server like Live Server in VS Code.

## Usage

1. **Start a Session**:
   - Click "Start a Splitting Session".
   - Enter your name as host and create the session.
   - Add all members' names.

2. **Join a Session**:
   - Click "Join Existing Session".
   - Enter the session code and your name (must be pre-added by host).

3. **Add Transactions**:
   - In the session view, click "Add Transaction".
   - Fill in description, amount, payer, and select members to split among.

4. **View Balances**:
   - Balances and settlement suggestions update automatically.

## Project Structure

- `index.html`: Main HTML file.
- `app.js`: Core JavaScript logic for UI and Firebase interactions.
- `firebase.js`: Firebase configuration (create this file as per setup).
- `requirements.txt`: Python dependencies (for potential backend extensions).

## Contributing

Feel free to fork the repo and submit pull requests. For issues, open a ticket on GitHub.

## License

MIT License. See LICENSE for details.

Made with ❤️ by sudarshanxlr8. Let's split bills the smart way! 🚀
        

