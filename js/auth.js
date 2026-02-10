// auth.js (FINAL SAFE VERSION)

console.log("auth.js loaded");

const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {

 //Sign up
  const signupForm = document.getElementById("signupForm");

  if (signupForm) {
    console.log("Signup page detected");

    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      console.log("Signup form submitted");

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const confirmPassword = document.getElementById("confirmPassword").value.trim();
      const firstName = document.getElementById("firstName").value.trim();
      const lastName = document.getElementById("lastName").value.trim();

      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        console.log("User created:", user.uid);

        await db.collection("users").doc(user.uid).set({
          firstName,
          lastName,
          email,
          role: window.selectedRole || "client",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("User profile saved");

        window.location.href = "/index.html";

      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    });
  } else {
    console.log("signupForm not found — skipping signup logic");
  }
// Log IN
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    console.log("Login page detected");

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      console.log("Login form submitted");

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);

        console.log("User logged in:", userCredential.user.uid);

        window.location.href = "/dashboard.html";

      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    });
  } else {
    console.log("loginForm not found — skipping login logic");
  }

});
