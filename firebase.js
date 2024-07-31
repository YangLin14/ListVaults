// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDOvrUoCaU4UbT67f3Y44hu-sA2ZRGckn0",
  authDomain: "inventory-management-2f6ec.firebaseapp.com",
  projectId: "inventory-management-2f6ec",
  storageBucket: "inventory-management-2f6ec.appspot.com",
  messagingSenderId: "326647180117",
  appId: "1:326647180117:web:7d29c6f1bdc9b2ec4f1ddc",
  measurementId: "G-VP3XJ43XJ4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore };
