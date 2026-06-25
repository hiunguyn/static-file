var board = null;
var game = new Chess();
var $status = $('#status');

// Initialize Stockfish engine
var engine = new Worker('./stockfish.js');
var engineReady = false;
var moveCallback = null;

engine.onmessage = function(event) {
  var line = event.data;
  if (line === 'readyok') {
    engineReady = true;
    console.log('Engine sẵn sàng!');
  } else if (line.startsWith('bestmove')) {
    var move = line.split(' ')[1];
    if (move && move !== '(none)' && typeof moveCallback === 'function') {
      var cb = moveCallback;
      moveCallback = null;
      cb(move);
    }
  }
};

engine.postMessage('uci');
engine.postMessage('isready');

function onDragStart(source, piece, position, orientation) {
  if (game.game_over()) return false;
  if (piece.search(/^b/) !== -1) return false;
}

function makeAiMove() {
  $status.html('AI đang suy nghĩ...');
  var fen = game.fen();

  if (!engine || !engineReady) {
    $status.html('Động cơ chưa sẵn sàng!');
    return;
  }

  moveCallback = function (move) {
    try {
      var result = game.move({
        from: move.substring(0, 2),
        to: move.substring(2, 4),
        promotion: move.length > 4 ? move[4] : 'q'
      });

      if (result === null) {
        console.error('Invalid move for game:', move);
        var moves = game.moves();
        if (moves.length > 0) {
          game.move(moves[Math.floor(Math.random() * moves.length)]);
        }
      }

      board.position(game.fen());
      updateStatus();
    } catch (e) {
      console.error('Error applying move:', e);
    }
  };

  engine.postMessage('position fen ' + fen);
  engine.postMessage('go depth 15');
}

function onDrop(source, target) {
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  });

  if (move === null) return 'snapback';

  updateStatus();
  window.setTimeout(makeAiMove, 250);
}

function onSnapEnd() {
  board.position(game.fen());
}

function updateStatus() {
  var status = '';
  var moveColor = 'White';
  if (game.turn() === 'b') moveColor = 'Black';

  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.';
  } else if (game.in_draw()) {
    status = 'Game over, drawn position';
  } else {
    status = moveColor + ' to move';
    if (game.in_check()) status += ', ' + moveColor + ' is in check';
  }

  $status.html(status);
}

function resetGame() {
  game.reset();
  board.start();
  updateStatus();
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
};
board = Chessboard('board', config);
updateStatus();
