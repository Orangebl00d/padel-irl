// The membership card fills in as you type, and "Email it to Brooks" opens an
// email with the details already written. No server: the site is static.

const TO = "brookswiley@gmail.com";
const form = document.getElementById("join");
const card = document.getElementById("carnet");
const note = document.getElementById("level-note");
const status = document.getElementById("join-status");
const slot = (name) => card.querySelector(`[data-field="${name}"]`);
const NBSP = " ";
const LEVEL_NOTE = "The league is aimed at 3.5 to 4.0. Send it anyway and Brooks will get back to you.";

function read() {
  const data = new FormData(form);
  return {
    name: String(data.get("name") || "").trim(),
    club: String(data.get("club") || "").trim(),
    level: String(data.get("level") || "").trim(),
  };
}

// A long name shrinks to fit the signature line instead of running off it.
function fitSignature() {
  const ink = slot("sign");
  ink.style.fontSize = "";
  const room = ink.parentElement.clientWidth - 8;
  if (ink.scrollWidth > room) {
    const size = parseFloat(getComputedStyle(ink).fontSize);
    ink.style.fontSize = `${((size * room) / ink.scrollWidth).toFixed(1)}px`;
  }
}

function sync() {
  const v = read();
  slot("name").textContent = v.name || NBSP;
  slot("sign").textContent = v.name;
  slot("club").textContent = v.club || NBSP;
  slot("level").textContent = v.level || NBSP;
  fitSignature();
  card.classList.remove("is-stamped");
  status.textContent = "";
}

// The league is aimed at Playtomic 3.5 to 4.0. Checked when you leave the
// field, so the note doesn't flash while you're still typing 3.75.
function checkLevel() {
  const raw = form.elements.level.value.trim();
  const level = Number(raw.replace(",", "."));
  note.textContent = raw && Number.isFinite(level) && (level < 3.5 || level > 4) ? LEVEL_NOTE : "";
}

form.addEventListener("input", sync);
form.elements.level.addEventListener("change", checkLevel);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  checkLevel();
  const v = read();
  if (!v.name) {
    form.elements.name.value = "";
    form.reportValidity();
    return;
  }
  const subject = `Put me down: ${v.name}`;
  const body = [
    `Name: ${v.name}`,
    `Home club: ${v.club || "-"}`,
    `Playtomic level: ${v.level || "-"}`,
    "",
    "Put me down for the Austin pilot. Email me when registration opens.",
  ].join("\n");
  const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Say what happens next, with a way through when no mail app opens.
  const gmail = document.createElement("a");
  gmail.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${TO}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  gmail.target = "_blank";
  gmail.rel = "noopener";
  gmail.textContent = "Open it in Gmail";
  status.replaceChildren("Your email should be open. Press send there and you're on the list. Nothing opened? ", gmail, ` or write to ${TO}.`);

  card.classList.add("is-stamped");
  window.location.href = `mailto:${TO}?${query}`;
});

// The draft board: four snake rounds, then two balance rounds where the team
// with the lowest combined level picks first. A pen line traces the snake.
const TEAMS = 6;
const SNAKE_ROUNDS = 4;
const ROUNDS = 6;
const board = document.querySelector(".board-grid");
const badges = [];
const firstBalance = [];

for (let round = 1; round <= ROUNDS; round++) {
  const label = document.createElement("span");
  label.className = "row";
  label.textContent = `Round ${round}`;
  board.append(label);
  for (let team = 1; team <= TEAMS; team++) {
    const cell = document.createElement("span");
    if (round <= SNAKE_ROUNDS) {
      const pick = (round - 1) * TEAMS + (round % 2 ? team : TEAMS + 1 - team);
      cell.className = pick === 1 ? "pick first" : "pick";
      const badge = document.createElement("b");
      badge.textContent = pick;
      cell.append(badge);
      badges[pick - 1] = badge;
    } else {
      cell.className = "balance";
      if (round === SNAKE_ROUNDS + 1) firstBalance[team] = cell;
    }
    board.append(cell);
  }
}

const SVG = "http://www.w3.org/2000/svg";
const snake = document.createElementNS(SVG, "svg");
snake.setAttribute("class", "snake");
snake.setAttribute("aria-hidden", "true");
snake.innerHTML =
  '<defs><marker id="snake-head" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">' +
  '<path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><path class="snake-line" marker-end="url(#snake-head)"/>';
board.prepend(snake);

function drawSnake() {
  const box = board.getBoundingClientRect();
  const centre = (el) => {
    const r = el.getBoundingClientRect();
    return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top];
  };
  const points = badges.map(centre);
  // After the last snake pick the line drops into the balance rounds.
  const lastTeam = SNAKE_ROUNDS % 2 ? TEAMS : 1;
  const into = firstBalance[lastTeam].getBoundingClientRect();
  points.push([points[points.length - 1][0], into.top - box.top + into.height * 0.45]);
  snake.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
  snake.querySelector(".snake-line").setAttribute("d", "M" + points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L"));
}

new ResizeObserver(drawSnake).observe(board);
if (document.fonts) {
  document.fonts.ready.then(() => {
    drawSnake();
    fitSignature();
  });
}
