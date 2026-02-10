
// 🔹 DEBUG
console.log("auth.js loaded");

const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");

  // 🔒 STOP if this page is not signup.html
  if (!signupForm) {
    console.log("signupForm not found — skipping signup logic");
    return;
  }

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // 🔥 prevents page reload

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
});
    alert(error.message);
  }
});

