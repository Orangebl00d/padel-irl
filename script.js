// The draft board: six rounds of a snake draft, 36 picks for 36 players, with
// a pen line tracing the order. Everything else on the page is plain HTML.

const TEAMS = 6;
const ROUNDS = 6;
const board = document.querySelector(".board-grid");
const badges = [];

for (let round = 1; round <= ROUNDS; round++) {
  const label = document.createElement("span");
  label.className = "row";
  label.textContent = `Round ${round}`;
  board.append(label);
  for (let team = 1; team <= TEAMS; team++) {
    const pick = (round - 1) * TEAMS + (round % 2 ? team : TEAMS + 1 - team);
    const cell = document.createElement("span");
    cell.className = pick === 1 ? "pick first" : "pick";
    const badge = document.createElement("b");
    badge.textContent = pick;
    cell.append(badge);
    badges[pick - 1] = badge;
    board.append(cell);
  }
}

const snake = document.createElementNS("http://www.w3.org/2000/svg", "svg");
snake.setAttribute("class", "snake");
snake.setAttribute("aria-hidden", "true");
snake.innerHTML = '<path class="snake-line"/>';
board.prepend(snake);

function drawSnake() {
  const box = board.getBoundingClientRect();
  const points = badges.map((badge) => {
    const r = badge.getBoundingClientRect();
    return `${(r.left + r.width / 2 - box.left).toFixed(1)} ${(r.top + r.height / 2 - box.top).toFixed(1)}`;
  });
  snake.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
  snake.querySelector(".snake-line").setAttribute("d", "M" + points.join("L"));
}

new ResizeObserver(drawSnake).observe(board);
if (document.fonts) document.fonts.ready.then(drawSnake);
