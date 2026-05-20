import { initializeApp } from "firebase/app";

import { getDatabase } from "firebase/database";

import { getAuth } from "firebase/auth";

const firebaseConfig = {

  apiKey: "AIzaSyB0DH4p4b7ewFpiDz-81qWsnuckk0tfeck",

  authDomain: "smart-attendance-system-5410b.firebaseapp.com",

  databaseURL:
    "https://smart-attendance-system-5410b-default-rtdb.europe-west1.firebasedatabase.app",

  projectId: "smart-attendance-system-5410b",

  storageBucket:
    "smart-attendance-system-5410b.firebasestorage.app",

  messagingSenderId: "56059362005",

  appId:
    "1:56059362005:web:6b6991228efa09a191c05c"

};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);

export const auth = getAuth(app);