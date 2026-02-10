// js/auth-check.js

//  Do NOT protect login or signup pages
const publicPages = ["/login.html", "/signup.html", "/index.html"];

if (publicPages.includes(window.location.pathname)) {
  console.log("Public page, auth check skipped");
} else {
  // Firebase instances
  const auth = firebase.auth();
  const db = firebase.firestore();

  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = "/login.html";
      return;
    }

    const uid = user.uid;

    db.collection("users").doc(uid).get()
      .then((doc) => {
        if (!doc.exists) throw new Error("User record not found");

        const role = doc.data().role;
        const path = window.location.pathname;

        if (role === "client" && path.includes("/provider/")) {
          window.location.href = "/client/c_dashboard.html";
        }

        if (role === "provider" && path.includes("/client/")) {
          window.location.href = "/provider/dashboard.html";
        }

        console.log("Access granted:", role);
      })
      .catch(() => {
        auth.signOut().then(() => {
          window.location.href = "/login.html";
        });
      });
  });
}
