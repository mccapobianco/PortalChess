
// var game = {"game_over":function(){return false},
// 			"turn":function(){return "w"},
// 			"move":function(){return null},
// 			"moves":function(a){return [{"to":a.square[0]+(parseInt(a.square[1])+1)}]},
// 			"fen":function(){return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"}}

var game = {
	"turn":1, //1:white, -1:black
	"board":[['R','N','B','Q','K','B','N','R'],['P','P','P','P','P','P','P','P'],['1','1','1','1','1','1','1','1'],['1','1','1','1','1','1','1','1'],['1','1','1','1','1','1','1','1'],['1','1','1','1','1','1','1','1'],['p','p','p','p','p','p','p','p'],['r','n','b','q','k','b','n','r']],
	"castling":['K','Q','k','q'],
	"check":function(){return is_check(this.turn==1 ? 'w' : 'b', this.board)},
	"game_over":function(){return this.check_mate() || this.stale_mate()},
	"stale_mate":function(){let b=!this.check() && is_mate(this);if (b){window.alert('Stalemate'); return b;}},//return this.moves().length == 0 && !this.check()},
	"check_mate":function(){let b=this.check() && is_mate(this);if (b){window.alert('Checkmate!'); return b;}},//return this.moves().length == 0 && this.check()},
	"moves":function(square){return moves(square, this.board)},
	"move":function(obj){return execute_move(obj, this)},
	"fen":function(){return fen(this.board)}//let a=[];for(let i=7;i>=0;i--){a.push(this.board[i].join(''))}a=a.join('/');return `${a}`}// ${this.turn==1 ? 'w' : 'b'} ${this.castling.length==0 ? '-' : this.castling.join('')} - 0 1`}
}

function fen(board){
	let a=[];
	for(let i=7;i>=0;i--){
		a.push(board[i].join(''))
	}
	a=a.join('/');
	return a;
}

function cr2sq(c,r){
	return String.fromCharCode('a'.charCodeAt()+c)+(r+1);
}

function sq2cr(sq){
	return {'column':sq[0].charCodeAt()-'a'.charCodeAt(), 'row':parseInt(sq[1])-1}
}

function piece_color(piece){
	if (piece == '1')
		return ''
	return piece==piece.toLowerCase() ? 'b' : 'w'
}

function execute_move(obj, game){
	if (game.moves(obj.from).includes(obj.to)){
		let crfrom=sq2cr(obj.from);
		let crto=sq2cr(obj.to);
		game.turn*=-1
		if (game.board[crfrom.row][crfrom.column].toLowerCase() == 'k'){	
			//check for castling
			let dir = crfrom.row ? -1 : 1;
			let diff = crfrom.column-crto.column
			if (Math.abs(diff)==2){
				game.castling[dir+1] = '';
				game.castling[dir+2] = '';
				let rookFrom = cr2sq((diff+2)*7/4, crfrom.row);
				let rookTo = cr2sq(crto.column+diff/2, crfrom.row);
				game.board[crto.row][crto.column+diff/2]=game.board[crfrom.row][(2-diff)*7/4];
				game.board[crfrom.row][(2-diff)*7/4]='1';
			}
		}
		if (obj.from=='e1'){
			game.castling[0] = '';
			game.castling[1] = '';
		}
		if (obj.from=='e8'){
			game.castling[2] = '';
			game.castling[3] = '';
		}
		if (obj.from=='a1' || obj.to=='a1'){
			game.castling[1] = '';
		}
		// console.log(game.fen())
		if (obj.from=='a8' || obj.to=='a8'){
			// console.log('HERE')
			game.castling[3] = '';
		}
		if (obj.from=='h1' || obj.to=='h1'){
			game.castling[0] = '';
		}
		if (obj.from=='h8' || obj.to=='h8'){
			game.castling[2] = '';
		}
		
		game.board[crto.row][crto.column]=game.board[crfrom.row][crfrom.column];
		game.board[crfrom.row][crfrom.column]='1';
		//check for promotion
		if (game.board[crto.row][crto.column] =='P' && (crto.row == 7)){
			game.board[crto.row][crto.column] ='Q';
		}
		if (game.board[crto.row][crto.column] =='p' && (crto.row == 0)){
			game.board[crto.row][crto.column] ='q';
		}
		// console.log(is_check('w', game.board))
		// console.log(is_check('b', game.board))
		// board.position(game.fen());

	} else {
		return 'snapback'
	}
}

function moves(square, board, check_if_check=true){
	// board = gm.board
	let cr = sq2cr(square);
	let column = cr.column
	let row = cr.row
	let piece = board[row][column]
	if (piece == '1'){
		return [];
	}
	let isBlack = piece==piece.toLowerCase();
	let color = piece_color(piece)
	let dir = isBlack ? -1 : 1;
	let squares = [];
	switch(piece.toLowerCase()){
		case 'p':
			if (row == 0 || row == 7)
				break;
			if (board[row+1*dir][column] == '1'){
				if (!check_if_check || if_not_check({'column':column, 'row':row}, {'column':column, 'row':row+dir}, board))
					squares.push(cr2sq(column, row+1*dir))
				if (row == 3.5-2.5*dir && board[row+2*dir][column] == '1'){
					if (!check_if_check || if_not_check({'column':column, 'row':row}, {'column':column, 'row':row+2*dir}, board))
						squares.push(cr2sq(column, row+2*dir))
				}
			}
			let capture_square = board[row+1*dir][(column+1)%8];
			if (piece_color(capture_square) != color && capture_square!='1'){
				if (!check_if_check || if_not_check({'column':column, 'row':row}, {'column':(column+1)%8, 'row':row+dir}, board))
					squares.push(cr2sq((column+1)%8, row+1*dir));
			}
			capture_square = board[row+1*dir][(column+7)%8];
			if (piece_color(capture_square) != color && capture_square!='1'){
				if (!check_if_check || if_not_check({'column':column, 'row':row}, {'column':(column+7)%8, 'row':row+dir}, board))
					squares.push(cr2sq((column+7)%8, row+1*dir));
			}
			break;
		case 'n':
			for (let i=-2; i<=2; i++){
				for (let j=-2; j<=2; j++){
					if (Math.abs(i)+Math.abs(j)==3){
						let R = row+i;
						let C = (column+j+8)%8;
						if (0 <= R && R < 8){
							if (piece_color(board[R][C]) != color){
								if (!check_if_check || if_not_check({'column':column, 'row':row}, {'column':C, 'row':R}, board))
									squares.push(cr2sq(C, R))
							}
						}
					}
				}
			}
			break;
		case 'q':
		case 'b':
			for (let i=-1; i<=1; i+=2){
				for (let j=-1; j<=1; j+=2){
					let R = row+1*i;
					let C = (column+1*j+8)%8;
					while (0 <= R && R < 8){
						let square = board[R][C];
						if (square != 1){
							if (piece_color(square) != color){
								if (!check_if_check || if_not_check({'column':column, 'row':row}, {'column':C, 'row':R}, board))
									squares.push(cr2sq(C,R));
							}
							break;
						}
						if (!check_if_check || if_not_check({'column':column, 'row':row}, {'column':C, 'row':R}, board))
							squares.push(cr2sq(C,R))
						R = R+1*i;
						C = (C+1*j+8)%8;
					}
					
				}
			}
			if (piece.toLowerCase() == 'b')
				break;
		case 'r':
			let i = 1;
			let j = 0;
			for (let k=0; k<4; k++){
				let R = row+1*i;
				let C = (column+1*j+8)%8;
				while (0 <= R && R < 8){
					let square = board[R][C];
					if (square != 1){
						if (piece_color(square) != color){
							if (!check_if_check || if_not_check({'column':column, 'row':row}, {'column':C, 'row':R}, board))
								squares.push(cr2sq(C,R));
						}
						break;
					}
					if (!check_if_check || if_not_check({'column':column, 'row':row}, {'column':C, 'row':R}, board))
						squares.push(cr2sq(C,R))
					R = R+1*i;
					C = (C+1*j+8)%8;
				}
				// i = j and j = -i
				i = i+j;
				j = j-i;
				i = i+j;
			}
			break;
		case 'k':
			for (let i=-1; i<=1; i++){
				for (let j=-1; j<=1; j++){
					if (i+j != i*j){
						let R = row+1*i;
						let C = (column+1*j+8)%8;
						if (0 <= R && R < 8){
							let square = board[R][C];
							if (piece_color(square) != color){
								if (!check_if_check || if_not_check({'column':column, 'row':row}, {'column':C, 'row':R}, board))
									squares.push(cr2sq(C,R));
							}
						}
					}
				}
			}
			if (game.castling[1-dir] != ''){ //
				if (board[row][column+1] == board[row][column+2] == '1')
					if (!check_if_check || if_not_check({'column':column, 'row':row}, {'column':column, 'row':row}, board))
						if (!check_if_check || if_not_check({'column':column, 'row':row}, {'column':column+1, 'row':row}, board))
							if (!check_if_check || if_not_check({'column':column, 'row':row}, {'column':column+2, 'row':row}, board))
								squares.push(cr2sq(column+2, row))
			}
			if (game.castling[2-dir] != ''){
				if (board[row][column-1] == board[row][column-2] == board[row][column-3] == '1')
					if (!check_if_check || if_not_check({'column':column, 'row':row}, {'column':column, 'row':row}, board))
						if (!check_if_check || if_not_check({'column':column, 'row':row}, {'column':column-1, 'row':row}, board))
							if (!check_if_check || if_not_check({'column':column, 'row':row}, {'column':column-2, 'row':row}, board))
								squares.push(cr2sq(column-2, row))
			}
	}
	return squares;
}

function is_check(king_color, board, ret_square=false){
	let king = king_color=='w' ? 'K' : 'k';
	let attacked_squares = [];
	let king_square = '';
	for (let i=0; i<8; i++){
		for (let j=0; j<8; j++){
			if (board[i][j] == king){
				king_square = cr2sq(j,i);
			} else {
				let color = piece_color(board[i][j]);
				if (color != king_color && color != '') {
					attacked_squares = attacked_squares.concat(moves(cr2sq(j,i), board, check_if_check=false));
				}
			}
		}
	}
	if (ret_square){
		return {'is_check':attacked_squares.includes(king_square), 'square':king_square};
	}
	return attacked_squares.includes(king_square);
}

function is_mate(game){
	for (let i=0; i<8; i++){
		for (let j=0; j<8; j++){
			if (piece_color(game.board[i][j]) == (game.turn==1 ? 'w' : 'b')){
				if (moves(cr2sq(j,i), game.board).length > 0)
					return false
			}
		}
	}
	return true;
}

function if_not_check(from, to, board){
	let copy = [];
	for (let i=0; i<8; i++){
		copy.push([])
		for (let j=0; j<8; j++){
			copy[i].push(board[i][j])
		}
	}
	// console.log(copy)
	let color = piece_color(copy[from.row][from.column], copy);
	copy[to.row][to.column] = copy[from.row][from.column];
	copy[from.row][from.column] = '1';
	return !is_check(color, copy);
}

var whiteSquareGrey = '#a9a9a9'
var blackSquareGrey = '#696969'

function removeGreySquares () {
  $('#myBoard .square-55d63').css('background', '')
  let ic = is_check(game.turn==1 ? 'w' : 'b', game.board, ret_square=true);
		if (ic.is_check){
			var $square = $('#myBoard .square-' + ic.square)
			$square.css('background', '#ff0000')
		}
}

function greySquare (square) {
  var $square = $('#myBoard .square-' + square)

  var background = whiteSquareGrey
  if ($square.hasClass('black-3c85d')) {
    background = blackSquareGrey
  }

  $square.css('background', background)
}

function onDragStart (source, piece) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false
  // or if it's not that side's turn
  if ((game.turn == 1 && piece.search(/^b/) !== -1) ||
      (game.turn === -1 && piece.search(/^w/) !== -1)) {
    return false
  }
}

function onDrop (source, target) {
  removeGreySquares()
  
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'
}

function onMouseoverSquare (square, piece) {
  // get list of possible moves for this square
  var moves = game.moves(square)
  // exit if there are no moves available for this square
  if (moves.length === 0) return

  if ((game.turn==1) != (piece.search(/^w/) !== -1))
  	return
  // highlight the square they moused over
  greySquare(square)

  // highlight the possible squares for this piece
  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i])
  }
}

function onMouseoutSquare (square, piece) {
  removeGreySquares()
}

function onSnapEnd () {
  board.position(game.fen())
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd
}

var board = null;
setTimeout(function() {
    board = new ChessBoard('myBoard', config);
}, 0);
