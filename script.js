// The membership card fills in as you type, and "Email it to Brooks" opens an
// email with the details already written. No server: the site is static.

const TO = "brookswiley@gmail.com";
const form = document.getElementById("join");
const card = document.getElementById("carnet");
const note = document.getElementById("level-note");
const slot = (name) => card.querySelector(`[data-field="${name}"]`);
const NBSP = " ";

function read() {
  const data = new FormData(form);
  return {
    name: String(data.get("name") || "").trim(),
    club: String(data.get("club") || "").trim(),
    level: String(data.get("level") || "").trim(),
  };
}

function sync() {
  const v = read();
  slot("name").textContent = v.name || NBSP;
  slot("sign").textContent = v.name;
  slot("club").textContent = v.club || NBSP;
  slot("level").textContent = v.level || NBSP;
  const level = Number(v.level.replace(",", "."));
  note.hidden = !(v.level && Number.isFinite(level) && level < 2.5);
  card.classList.remove("is-stamped");
}

form.addEventListener("input", sync);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const v = read();
  if (!v.name) {
    form.elements.name.focus();
    return;
  }
  const body = [
    `Name: ${v.name}`,
    `Home club: ${v.club || "-"}`,
    `Playtomic level: ${v.level || "-"}`,
    "",
    "Put me down for the Austin pilot. Send me the registration link when it opens.",
  ].join("\n");
  card.classList.add("is-stamped");
  window.location.href = `mailto:${TO}?subject=${encodeURIComponent(`Put me down: ${v.name}`)}&body=${encodeURIComponent(body)}`;
});

// The draft board: six snake rounds, then two balance rounds.
const board = document.querySelector(".board-grid");
for (let round = 1; round <= 8; round++) {
  const label = document.createElement("span");
  label.className = "row";
  label.textContent = `Round ${round}`;
  board.append(label);
  for (let team = 1; team <= 6; team++) {
    const cell = document.createElement("span");
    if (round <= 6) {
      const pick = (round - 1) * 6 + (round % 2 ? team : 7 - team);
      cell.className = pick === 1 ? "pick first" : "pick";
      cell.textContent = pick;
    } else {
      cell.className = "balance";
    }
    board.append(cell);
  }
}
