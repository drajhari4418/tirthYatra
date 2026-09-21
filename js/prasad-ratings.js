import { auth, db, ref, onValue, set, onAuthStateChanged } from "./firebase-app.js";

const ratings = {};
const getRatingNodes = () => [...document.querySelectorAll("[data-rating-key]")];
const keyOf = node => node.getAttribute("data-rating-key");

function escapeText(value){
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
}

function render(node, average, count, userScore){
  const rating = average ? Number(average) : 0;
  const rounded = Math.round(rating);
  node.innerHTML = "";
  node.classList.add("ty-rating-live");

  for(let i=1;i<=5;i++){
    const star = document.createElement("button");
    star.type = "button";
    star.className = "ty-rating-star " + (i <= rounded ? "mdi mdi-star" : "mdi mdi-star-outline");
    star.setAttribute("aria-label", `Rate ${i} out of 5`);
    star.title = `Rate ${i} out of 5`;
    star.dataset.score = String(i);
    star.addEventListener("click", () => submitRating(keyOf(node), i));
    node.appendChild(star);
  }

  const text = document.createElement("span");
  text.className = "ty-rating-text";
  text.textContent = rating ? `${rating.toFixed(1)}/5 (${count})` : "No ratings yet";
  node.appendChild(text);

  if(userScore){
    node.setAttribute("data-user-rating", String(userScore));
    node.title = `Your rating: ${userScore}/5`;
  } else {
    node.removeAttribute("data-user-rating");
  }
}

function summarize(items){
  const values = Object.values(items || {}).map(v => Number(v?.score)).filter(v => v >= 1 && v <= 5);
  return { average: values.length ? values.reduce((a,b)=>a+b,0)/values.length : 0, count: values.length };
}

function refreshAll(user){
  getRatingNodes().forEach(node => {
    const key = keyOf(node);
    const summary = summarize(ratings[key]);
    const userScore = user?.uid && ratings[key]?.[user.uid]?.score ? Number(ratings[key][user.uid].score) : 0;
    render(node, summary.average, summary.count, userScore);
  });
}

async function submitRating(key, score){
  const user = auth.currentUser;
  if(!user){
    document.getElementById("ty-login-btn")?.click();
    return;
  }

  const ratingRef = ref(db, `prasadRatings/${key}/${user.uid}`);
  try{
    await set(ratingRef, {
      score,
      userId: user.uid,
      userName: user.displayName || user.email || "TirthYatra user",
      updatedAt: Date.now()
    });
  }catch(error){
    console.error("Prasad rating failed:", error);
    alert("Your rating could not be saved. Please try again.");
  }
}

const style = document.createElement("style");
style.textContent = `
.ty-rating-live{display:flex;align-items:center;gap:2px;min-height:28px;flex-wrap:wrap}
.ty-rating-star{border:0;background:transparent;padding:2px;font-size:18px;line-height:1;color:#f59e0b;cursor:pointer}
.ty-rating-star:hover{transform:scale(1.12)}
.ty-rating-text{font:600 11px/1.2 system-ui,Arial,sans-serif;color:#75685d;margin-left:5px}
`;
document.head.appendChild(style);

onValue(ref(db, "prasadRatings"), snap => {
  Object.keys(ratings).forEach(k => delete ratings[k]);
  Object.assign(ratings, snap.val() || {});
  refreshAll(auth.currentUser);
}, error => {
  console.error("Unable to load live prasad ratings:", error);
  getRatingNodes().forEach(node => {
    node.textContent = "Ratings unavailable";
    node.setAttribute("aria-label", "Ratings unavailable");
  });
});

onAuthStateChanged(auth, user => refreshAll(user));


/*
 * Future-proofing:
 * Newly added prasad cards can use a unique data-rating-key.
 * Only react when new rating elements are actually inserted. This avoids
 * observing our own star/text rendering changes and causing an update loop.
 */
const ratingObserver = new MutationObserver(mutations => {
  const hasNewRatingNode = mutations.some(mutation =>
    [...mutation.addedNodes].some(node =>
      node.nodeType === 1 &&
      (node.matches?.("[data-rating-key]") || node.querySelector?.("[data-rating-key]"))
    )
  );

  if(hasNewRatingNode){
    refreshAll(auth.currentUser);
  }
});

ratingObserver.observe(document.body, { childList: true, subtree: true });
