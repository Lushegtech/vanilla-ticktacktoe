const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6] 
];

let board = Array(9).fill(null);
let xIsNext = true;
let history = [];
let scores = { X:0, O:0, D:0 };
let round = 1;
let mode = 'cpu';
let celebrating = false;
let focusIndex = 4;

const boardEl = document.getElementById('board');
const cells = [...document.querySelectorAll('[data-cell]')];
const statusEl = document.getElementById('status');
const roundEl = document.getElementById('round');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');
const scoreD = document.getElementById('scoreD');
const undoBtn = document.getElementById('undo');
const resetBtn = document.getElementById('reset');
const nextBtn = document.getElementById('next');
const modeSel = document.getElementById('mode');

function getWinner(b){
  for(const [a,b2,c] of LINES){
    if(b[a] && b[a]===b[b2] && b[a]===b[c]) return { player:b[a], line:[a,b2,c] };
  } return null;
}
function availableMoves(b){ const m=[]; for(let i=0;i<9;i++) if(!b[i]) m.push(i); return m; }

function cpuBestMove(b,cpu,hum){
  const moves = availableMoves(b); if(!moves.length) return -1;
  const tryPlay=(i,p)=>{ const clone=b.slice(); clone[i]=p; return clone };
  for(const m of moves) if(getWinner(tryPlay(m,cpu))) return m;
  for(const m of moves) if(getWinner(tryPlay(m,hum))) return m;
  if(moves.includes(4)) return 4;
  for(const c of [0,2,6,8]) if(moves.includes(c)) return c;
  return moves[0];
}

function markHTML(type){
  return type;
}

function announce(text){
  console.log(text);
}

function setStatus(text){ statusEl.textContent = text; }

function updateScores(){ scoreX.textContent = scores.X; scoreO.textContent = scores.O; scoreD.textContent = scores.D; }

function clearWinline(){ cells.forEach(c=>c.classList.remove('win')); }

function drawWinline(line){
  line.forEach(i=> cells[i].classList.add('win'));
}

function createBurst(){
}

function resetBoard(nextRound=false){
  board = Array(9).fill(null);
  xIsNext = true; history = []; celebrating=false; clearWinline();
  cells.forEach(c=>{ c.innerHTML=''; });
  nextBtn.style.display = 'none'; setStatus("X's turn"); roundEl.textContent = round;
}

function endRound(winner){
  if(winner){ scores[winner.player]++; drawWinline(winner.line); announce(`${winner.player} wins the round!`); }
  else { scores.D++; announce(`It's a draw.`); }
  updateScores(); celebrating=true; nextBtn.style.display='block';
}

function placeAt(i){
  if(board[i] || celebrating) return;
  const curr = xIsNext ? 'X' : 'O';
  board[i]=curr; cells[i].innerHTML = markHTML(curr); history.push(i); xIsNext=!xIsNext;
  announce(`${curr} placed at cell ${i+1}.`);

  const win = getWinner(board);
  if(win) return endRound(win);
  if(board.every(Boolean)) return endRound(null);

  setStatus(xIsNext ? "X's turn" : "O's turn");

  if(mode==='cpu' && !xIsNext){
    setTimeout(()=>{
      const idx = cpuBestMove(board,'O','X');
      if(idx>=0) placeAt(idx);
    },420);
  }
}

function undo(){
  if(!history.length || celebrating) return;
  const last = history.pop();
  board[last]=null; cells[last].innerHTML=''; xIsNext=!xIsNext; setStatus(xIsNext?"X's turn":"O's turn");
  cells[last].focus(); focusIndex=last;
}

modeSel.addEventListener('change', e=>{ mode = e.target.value; resetBoard(false); });
undoBtn.addEventListener('click', undo);
resetBtn.addEventListener('click', ()=> resetBoard(false));
nextBtn.addEventListener('click', ()=>{ round++; resetBoard(true); roundEl.textContent = round; });

cells.forEach((btn,i)=>{
  btn.addEventListener('click', ()=> placeAt(i));
});

resetBoard(false);
updateScores();
