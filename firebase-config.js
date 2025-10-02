<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDqglS0qb_BVE5BxNyQPJdt1BLrJd7hCro",
    authDomain: "stock-prediction-dashboa-17c16.firebaseapp.com",
    projectId: "stock-prediction-dashboa-17c16",
    storageBucket: "stock-prediction-dashboa-17c16.firebasestorage.app",
    messagingSenderId: "893151736538",
    appId: "1:893151736538:web:d9e1bf9e5a6e598fb02be3",
    measurementId: "G-6T6MK4HTPK"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>