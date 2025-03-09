// firebase.js
import "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js";
import "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js";
import "https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js";
import "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage-compat.js";

const firebaseConfig = {
    apiKey: "AIzaSyB99yoNSTVUeAy5AqeoeARZInrKF-N1WYg",
    authDomain: "bookstore-eeca9.firebaseapp.com",
    databaseURL: "https://bookstore-eeca9-default-rtdb.firebaseio.com/",
    projectId: "bookstore-eeca9",
    storageBucket: "bookstore-eeca9.appspot.com",
    messagingSenderId: "946960951445",
    appId: "1:946960951445:web:302a9f90c32ebcd4ba939c",
    measurementId: "G-WJ8H7HFYXD"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

export { auth, database, storage };