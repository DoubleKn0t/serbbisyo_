// js/auth.js

const auth = firebase.auth();
const db = firebase.firestore();

function loginUser(email, password) {
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const uid = userCredential.user.uid;

      // Get role from Firestore
      return db.collection('users').doc(uid).get();
    })
    .then((doc) => {
      if (!doc.exists) {
        throw new Error("User record not found.");
      }

      const role = doc.data().role;

      if (role === "provider") {
        window.location.href = "/provider/dashboard.html";
      } else if (role === "client") {
        window.location.href = "/client/c_dashboard.html";
      } else {
        throw new Error("Invalid user role.");
      }
    })
    .catch((error) => {
      console.error("Login error:", error);
      alert(error.message);
    });
}

  // Logout function (NOW PROPERLY CLOSED)
function logout() {
  auth.signOut()
    .then(() => {
      window.location.href = "/index.html";
    })
    .catch((error) => {
      console.error("Logout error:", error);
      alert("Failed to log out.");
    });
}
