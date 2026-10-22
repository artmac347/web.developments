const $ = (s) => document.querySelector(s);

/* progress bar + sticky header */
const header = $("#header"), bar = $("#progress");
addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (scrollY / max) * 100 + "%";
  header.classList.toggle("scrolled", scrollY > 60);
}, { passive: true });

/* mobile menu */
const menuBtn = $("#menuBtn"), nav = $("#nav");
menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
});
nav.addEventListener("click", (e) => { if (e.target.tagName === "A") nav.classList.remove("open"); });

/* reveal + active nav link */
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
}), { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

const links = [...nav.querySelectorAll("a")];
const spy = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.hash === "#" + e.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
links.forEach((a) => { const s = document.querySelector(a.hash); if (s) spy.observe(s); });

/* typewriter */
const codeLines = ["<!DOCTYPE html>", "<html>", "<head>", "  <title>My first page</title>", "</head>", "<body>", "  <h1>Hello, world!</h1>", "  <p>Welcome to the web.</p>", "</body>", "</html>"];
const target = $("#typewriter");
let run = 0;
function typeCode() {
  const id = ++run;
  target.innerHTML = "";
  let l = 0, c = 0, span = null;
  (function tick() {
    if (id !== run || l >= codeLines.length) return;
    if (c === 0) { span = document.createElement("span"); span.className = "code-line"; target.appendChild(span); }
    const cursor = target.querySelector(".cursor");
    if (cursor) cursor.remove();
    span.textContent = codeLines[l].slice(0, ++c);
    const cur = document.createElement("span");
    cur.className = "cursor"; cur.textContent = "|";
    span.appendChild(cur);
    if (c >= codeLines[l].length) { l++; c = 0; }
    setTimeout(tick, 55);
  })();
}
$("#replay").addEventListener("click", typeCode);
new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { typeCode(); o.disconnect(); } }, { threshold: 0.4 }).observe(target);

/* frontend tabs */
const tabData = {
  html: { text: "HTML builds the structure: headings, paragraphs, links.", code: "<h1>My heading</h1>\n<p>Some text.</p>\n<a href=\"#\">A link</a>" },
  css: { text: "CSS controls how things look: color, size, spacing.", code: "h1 {\n  color: blue;\n  font-size: 3rem;\n}" },
  js: { text: "JavaScript makes the page react to people.", code: "document.querySelector(\"h1\")\n  .addEventListener(\"click\", () => {\n    alert(\"Hi!\");\n  });" }
};
function showTab(key) {
  document.querySelectorAll(".tab").forEach((t) => {
    const on = t.dataset.tab === key;
    t.classList.toggle("is-active", on);
    t.setAttribute("aria-selected", on);
  });
  $("#tabText").textContent = tabData[key].text;
  $("#tabCode").textContent = tabData[key].code;
}
document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => showTab(t.dataset.tab)));
showTab("html");

$("#copyBtn").addEventListener("click", async (e) => {
  try { await navigator.clipboard.writeText($("#tabCode").textContent); e.target.textContent = "Copied"; }
  catch { e.target.textContent = "Copy failed"; }
  setTimeout(() => (e.target.textContent = "Copy code"), 1500);
});

/* try-it color */
$("#colorInput").addEventListener("input", (e) => {
  const v = e.target.value.trim();
  if (CSS.supports("color", v)) $("#tryDemo").style.color = v;
});

/* quiz */
const quiz = [
  { q: "Which language gives a page its structure?", o: ["HTML", "CSS", "Python"], a: 0 },
  { q: "Which one changes colors and spacing?", o: ["JavaScript", "CSS", "Node.js"], a: 1 },
  { q: "Where does the backend run?", o: ["In the browser", "On a server", "In the CSS file"], a: 1 }
];
let qi = 0, score = 0;
function showQ() {
  const item = quiz[qi];
  $("#quizQ").textContent = item.q;
  $("#quizFb").textContent = "";
  $("#quizNext").hidden = true;
  const box = $("#quizOpts");
  box.innerHTML = "";
  item.o.forEach((text, i) => {
    const b = document.createElement("button");
    b.textContent = text;
    b.addEventListener("click", () => answer(i, b));
    box.appendChild(b);
  });
}
function answer(i, btn) {
  const ok = i === quiz[qi].a;
  if (ok) score++;
  btn.classList.add(ok ? "right" : "wrong");
  [...$("#quizOpts").children].forEach((b, n) => { b.disabled = true; if (n === quiz[qi].a) b.classList.add("right"); });
  $("#quizFb").textContent = ok ? "Correct!" : "Not quite. The green answer is correct.";
  $("#quizNext").textContent = qi === quiz.length - 1 ? "See score" : "Next question";
  $("#quizNext").hidden = false;
}
$("#quizNext").addEventListener("click", () => {
  if (qi < quiz.length - 1) { qi++; showQ(); return; }
  $("#quizQ").textContent = `You got ${score} of ${quiz.length}.`;
  $("#quizOpts").innerHTML = "";
  $("#quizFb").textContent = "Nice work. Keep building small projects.";
  $("#quizNext").textContent = "Try again";
  $("#quizNext").onclick = () => location.reload();
});
showQ();