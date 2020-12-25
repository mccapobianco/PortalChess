function minimax(node, depth, a, b, max){
	// console.log(`DEPTH: ${depth}`);
	let best_moves = [];
	if (depth == 0){
		return {'value':heuristic(fen(node)), 'moves':[]}
	}
	if (max){
		let value = -Infinity;
		let all_moves = find_all_moves(node, 'w');
		for (let i=0; i < all_moves.length; i++){
			let move = all_moves[i];
			let to = sq2cr(move.to); let from = sq2cr(move.from);
			let copy = make_copy(node);
			copy[to.row][to.column] = copy[from.row][from.column];
			copy[from.row][from.column] = '1';
			let obj = minimax(copy, depth-1, a, b, false)
			let this_val = obj.value;
			// best_moves = obj.moves;
			if (this_val > value){
				value = this_val;
				best_moves = [all_moves[i]];
			} else if (this_val == value){
				best_moves.push(all_moves[i])
			}
			a = Math.max(a, value);
			if (a >= b)
				break;
		}
		return {'value': value, 'moves': best_moves}
	} else {
		let value = Infinity;
		let all_moves = find_all_moves(node, 'b');
		for (let i=0; i < all_moves.length; i++){
			let move = all_moves[i];
			let to = sq2cr(move.to); let from = sq2cr(move.from);
			let copy = make_copy(node);
			copy[to.row][to.column] = copy[from.row][from.column];
			copy[from.row][from.column] = '1';
			let obj = minimax(copy, depth-1, a, b, true)
			let this_val = obj.value;
			// best_moves = obj.moves;
			if (this_val < value){
				value = this_val;
				best_moves = [all_moves[i]];
			} else if (this_val == value){
				best_moves.push(all_moves[i])
			}
			a = Math.min(a, value);
			if (a >= b)
				break;
		}
		return {'value': value, 'moves': best_moves}
	}
}

function make_copy(a){
	let copy = [];
	for (let i=0; i<8; i++){
		copy.push([])
		for (let j=0; j<8; j++){
			copy[i].push(a[i][j])
		}
	}
	return copy;
}

function bot_move(board){
	let copy = make_copy(board);
	let moves = minimax(copy, 3, -Infinity, Infinity, false)
	let value = moves.value
	moves = moves.moves;
	let move = moves[Math.floor(Math.random() * moves.length)];
	console.log(`Last bot move: ${move.from} to ${move.to} (Estimated value: ${value})`)
	return move;
}

function find_all_moves(board, color){
	let moves_a = []
	for (let i=0; i<8; i++){
		for (let j=0; j<8; j++){
			if (piece_color(board[i][j]) == color){
				let piece_moves = moves(cr2sq(j,i), board)
				for (let k=0; k<piece_moves.length; k++){
					moves_a.push({'from':cr2sq(j,i), 'to':piece_moves[k]});
				}
			}
		}
	}
	return moves_a;

}

function heuristic(fen){
	let p = [...fen.matchAll(/P/g)].length - [...fen.matchAll(/p/g)].length;
	let n = [...fen.matchAll(/N/g)].length - [...fen.matchAll(/n/g)].length;
	let b = [...fen.matchAll(/B/g)].length - [...fen.matchAll(/b/g)].length;
	let r = [...fen.matchAll(/R/g)].length - [...fen.matchAll(/r/g)].length;
	let q = [...fen.matchAll(/Q/g)].length - [...fen.matchAll(/q/g)].length;
	let k = [...fen.matchAll(/K/g)].length - [...fen.matchAll(/k/g)].length;
	let weights = [1,3,3,5,9,900]
	return p*weights[0] + n*weights[1] + b*weights[2] + r*weights[3] + q*weights[4] + k*weights[5];
}

function onSnapEndBot() {
  board.position(game.fen());
  onSnapEnd()
  if (game.turn == -1 && !game.game_over()){
  	let ai = bot_move(game.board);
  	execute_move(ai, game)
  }
  onSnapEnd()
}

config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEndBot
}

setTimeout(function() {
    board = new ChessBoard('myBoard', config);
}, 0);