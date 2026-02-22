
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
  import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
  import { getDatabase, ref, push, set, onValue, onDisconnect }  from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

  const FirebaseConfig = {
    apiKey: "AIzaSyARxUcggEuk67uLdtbNXrf2yLAM6Nx-_DM",
    authDomain: "chat-pw-2026.Firebaseapp.com",
    databaseURL: "https://chat-pw-2026-default-rtdb.Firebaseio.com",
    projectId: "chat-pw-2026",
    storageBucket: "chat-pw-2026.Firebasestorage.app",
    messagingSenderId: "16351330668",
    appId: "1:16351330668:web:4ff97a14054fc271fd7349"
  };

 export const app = initializeApp(FirebaseConfig);
 export const auth = getAuth(app);
 export const database = getDatabase(app);
 export const googleProvider = new GoogleAuthProvider();
