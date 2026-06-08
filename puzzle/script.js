// Khởi tạo game
let tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0]; // 0 là ô trống
let emptyIndex = 8;

const puzzleContainer = document.getElementById('puzzle');
const shuffleBtn = document.getElementById('shuffle-btn');
const message = document.getElementById('message');

// Tạo bảng xếp hình
function createPuzzle() {
    puzzleContainer.innerHTML = '';
    tiles.forEach((tile, index) => {
        const tileElement = document.createElement('button');
        tileElement.classList.add('tile');
        
        if (tile === 0) {
            tileElement.classList.add('empty');
        } else {
            tileElement.textContent = tile;
            tileElement.addEventListener('click', () => moveTile(index));
        }
        
        puzzleContainer.appendChild(tileElement);
    });
}

// Di chuyển ô
function moveTile(index) {
    const validMoves = getValidMoves(emptyIndex);
    
    if (validMoves.includes(index)) {
        // Hoán đổi vị trí
        [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];
        emptyIndex = index;
        
        createPuzzle();
        checkWin();
    }
}

// Lấy các nước đi hợp lệ
function getValidMoves(emptyPos) {
    const moves = [];
    const row = Math.floor(emptyPos / 3);
    const col = emptyPos % 3;
    
    // Trên
    if (row > 0) moves.push(emptyPos - 3);
    // Dưới
    if (row < 2) moves.push(emptyPos + 3);
    // Trái
    if (col > 0) moves.push(emptyPos - 1);
    // Phải
    if (col < 2) moves.push(emptyPos + 1);
    
    return moves;
}

// Trộn bài
function shuffle() {
    message.textContent = '';
    
    // Thực hiện 100 nước đi ngẫu nhiên hợp lệ
    for (let i = 0; i < 100; i++) {
        const validMoves = getValidMoves(emptyIndex);
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        
        [tiles[randomMove], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[randomMove]];
        emptyIndex = randomMove;
    }
    
    createPuzzle();
}

// Kiểm tra thắng
function checkWin() {
    const winCondition = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    const isWin = tiles.every((tile, index) => tile === winCondition[index]);
    
    if (isWin) {
        message.textContent = '🎉 Chúc mừng! Bạn đã thắng! 🎉';
        puzzleContainer.classList.add('win');
        setTimeout(() => {
            puzzleContainer.classList.remove('win');
        }, 500);
    }
}

// Sự kiện
shuffleBtn.addEventListener('click', shuffle);

// Khởi tạo game
createPuzzle();