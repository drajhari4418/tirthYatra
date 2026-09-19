import { auth, onAuthStateChanged } from "./firebase-app.js";
import { bindServices } from "./cms.js";

onAuthStateChanged(auth, user => {
  if (!user) { location.replace("auth.html"); return; }
  bindServices();
});
