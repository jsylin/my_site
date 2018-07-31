const square_size = 26;
const grid_size = 1;
const grid_fix = 0;
const width_num = 10;
const height_num = 20;
const grid_color = "rgb(180,180,180)";
const info_width = 2 * square_size * 4;
const info_font = "14px sans-serif";
const info_next_pos = 32;
const info_t_x = width_num + 4;
const info_t_y = 3;
const tetromino_size = 4;
var key = null;
const normal_square_color = "Green"
const default_square_color = "White"
var score = 0;
var line = 0;
const main_width = (width_num + 1) * grid_size + width_num * square_size;
const main_height = (height_num + 1) * grid_size + height_num * square_size;
var AI = true
var time_ai = 120
var time_man = 1000

function init_grid() {
    var canvas = document.getElementById('tutorial');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');

        canvas.width = main_width + info_width;
        canvas.height = main_height;

        //ctx.strokeStyle = grid_color;
        ctx.fillStyle = grid_color;
        for (var i = 0; i < width_num + 1; i++) {
            /*
            ctx.lineWidth = grid_size;
            ctx.lineCap = "butt";
            ctx.beginPath();
            ctx.moveTo(i * grid_size+grid_fix + i * square_size, 0);
            ctx.lineTo(i * grid_size+grid_fix + i * square_size, main_height);
            ctx.stroke();
            */
            ctx.fillRect(i * grid_size + grid_fix + i * square_size, 0, grid_size, main_height)
        }

        for (var i = 0; i < height_num + 1; i++) {
            /*
            ctx.lineWidth = grid_size;
            ctx.lineCap = "butt";
            ctx.beginPath();
            ctx.moveTo(0, i * grid_size + i * square_size+grid_fix);
            ctx.lineTo(main_width, i * grid_size + i * square_size+grid_fix);
            ctx.stroke();
            */
            ctx.fillRect(0, i * grid_size + i * square_size + grid_fix, main_width, grid_size);
        }
        update_info(ctx)
        return ctx;
    }
}

function update_info(ctx) {
    ctx.font = info_font;
    ctx.textBaseline = "bottom"
    ctx.textAlign = "start"
    ctx.fillStyle = "White"


    ctx.fillRect(main_width, info_next_pos - 18 + square_size * 4, 180, 18)
    ctx.fillRect(main_width, info_next_pos + square_size * 4 + info_next_pos - 18, 180, 18)

    ctx.fillStyle = "Green"
    ctx.fillText("  NEXT:", main_width, info_next_pos)
    let text = "  SCORE: " + score;
    ctx.fillText(text, main_width, info_next_pos + square_size * 4)
    text = "  LINE: " + line
    ctx.fillText(text, main_width, info_next_pos + square_size * 4 + info_next_pos)
    ctx.textAlign = "right"
    ctx.fillText("key: w,a,s,d,space,enter ", main_width + info_width, main_height)
}

var canvas_ctx = init_grid();

function get_real_position(pos) {
    return (pos + 1) * grid_size + pos * square_size
}

var Tetromino = class {
    constructor(x, y, color, layout_index, layout) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.layout_index = layout_index;
        this.color = color;
        this.layout = layout;
        this.path = [];
    }

    rand() {
        // http://tetris.wikia.com/wiki/Tetris_Guideline
        var layouts = [layout_L, layout_J, layout_O, layout_T, layout_I, layout_S, layout_Z]
        var colors = ["Orange", "Blue", "Yellow", "Purple", "Cyan", "Green", "Red"]
        var rand_layout = Math.floor(Math.random() * 10000) % (layouts.length);
        var rand_layout_index = Math.floor(Math.random() * 10000) % (tetromino_size);
        this.color = colors[rand_layout]
        this.layout = layouts[rand_layout]
        this.layout_index = rand_layout_index
        var now_layout = this.layout[this.layout_index];
        outer:
            for (var i = 0; i < tetromino_size; i++) {
                for (var j = 0; j < tetromino_size; j++) {
                    if (now_layout[i][j] === 1) {
                        this.y = 0 - i;
                        this.x = (width_num - tetromino_size) / 2
                        break outer;
                    }
                }
            }
        return this
    }

    update(ctx, is_clear) {
        var real_x = get_real_position(this.x);
        var real_y = get_real_position(this.y);
        var now_layout;

        now_layout = this.layout[this.layout_index];

        for (var i = 0; i < tetromino_size; i++) {
            for (var j = 0; j < tetromino_size; j++) {
                if (now_layout[i][j] === 1) {
                    var tmp_x = get_real_position(this.x + j);
                    var tmp_y = get_real_position(this.y + i);
                    ctx.fillStyle = this.color;
                    if (is_clear) {
                        ctx.clearRect(tmp_x, tmp_y, square_size, square_size);
                    } else {
                        ctx.fillRect(tmp_x, tmp_y, square_size, square_size);
                    }

                } else {

                }
            }
        }
    }

    display_at_info(ctx, is_clear) {
        var tmp_x = this.x;
        var tmp_y = this.y;

        var now_layout = this.layout[this.layout_index];
        for (var i = 0; i < tetromino_size; i++) {
            for (var j = 0; j < tetromino_size; j++) {
                if (now_layout[i][j] === 1) {
                    this.y = info_t_y - i;
                    this.x = info_t_x
                    break;
                }
            }
        }

        this.update(ctx, is_clear)
        this.x = tmp_x;
        this.y = tmp_y;
    }

    fall(board) {
        var now_layout = this.layout[this.layout_index];
        for (var i = 0; i < tetromino_size; i++) {
            for (var j = 0; j < tetromino_size; j++) {
                if (now_layout[i][j] === 1) {
                    if (this.y + i + 1 >= height_num || board[this.x + j][this.y + +i + 1] == 1) {
                        return false
                    }
                } else {

                }
            }
        }
        return true
    }

    update_board(board) {
        var now_layout = this.layout[this.layout_index];
        for (var i = 0; i < tetromino_size; i++) {
            for (var j = 0; j < tetromino_size; j++) {
                if (now_layout[i][j] === 1) {
                    board[this.x + j][this.y + i] = 1;
                }
            }
        }
    }

    check(board) {
        var now_layout = this.layout[this.layout_index];

        for (var i = 0; i < tetromino_size; i++) {
            for (var j = 0; j < tetromino_size; j++) {
                if (now_layout[i][j] == 1) {
                    if (this.x + j >= width_num || this.y + i >= height_num)
                        return false
                    if (this.x + j < 0 || this.y + i < 0)
                        return false
                    if (board[this.x + j][this.y + i] == 1)
                        return false
                }
            }
        }
        return true
    }

    check_end(board) {
        return !this.check(board)
    }

    check_suc(ctx, board) {
        let del_line = 0
        for (var i = 0; i < height_num; i++) {
            let line_ok = true
            for (var j = 0; j < width_num; j++) {
                if (board[j][i] == 0) {
                    line_ok = false
                    break
                }
            }
            if (line_ok) {
                del_line++
                for (var start_line = i; start_line >= 0; start_line--) {
                    for (var each = 0; each < width_num; each++) {
                        if (start_line != 0)
                            board[each][start_line] = board[each][start_line - 1]
                        else
                            board[each][start_line] = 0
                        if (board[each][start_line] != 0) {
                            ctx.fillStyle = normal_square_color;
                            ctx.fillRect(get_real_position(each), get_real_position(start_line), square_size, square_size);
                        } else {
                            ctx.clearRect(get_real_position(each), get_real_position(start_line), square_size, square_size);
                        }
                    }
                }
            }
        }
        switch (del_line) {
            case 1:
                score += 10
                break;
            case 2:
                score += 30
                break;
            case 3:
                score += 60
                break;
            case 4:
                score += 100
                break;
        }
        line += del_line
        update_info(ctx)
    }

    set_path(board) {
        this.path = get_best_path(board, this)
    }
}

var layout_L = [
    [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 0, 0, 0],
        [1, 1, 1, 0],
        [1, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 0, 0, 0],
        [0, 0, 1, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0]
    ]
];

var layout_J = [
    [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 1, 0, 0],
        [0, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0]
    ],
    [
        [1, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ]
];

layout_I = [
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0]
    ],
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0]
    ]
];

var layout_O = [
    [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ]
];

var layout_T = [
    [
        [0, 0, 0, 0],
        [0, 1, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 0, 0, 0],
        [0, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 0, 0]
    ],
    [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 1, 0, 0]
    ],
    [
        [0, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 0, 0]
    ]
];


layout_S = [
    [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0]
    ],
    [
        [1, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0]
    ],
    [
        [1, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0]
    ]
];

layout_Z = [
    [
        [0, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 0, 1, 0],
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 0, 1, 0],
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0]
    ]
];
var start = null;
var start_ai = null;

var now_t = new Tetromino(0, 0, "#000", 0, layout_L);
var next_t = new Tetromino(0, 0, "#000", 0, layout_L);
var stop = false

var game_board = new Array(width_num);
var virtual_board = new Array(width_num);


function reset_virtual_board() {
    for (var i = 0; i < width_num; i++) {
        virtual_board[i] = new Array(height_num);
        for (var j = 0; j < height_num; j++) {
            virtual_board[i][j] = 0;
        }
    }
}


function reset_game_board(ctx) {
    for (var i = 0; i < width_num; i++) {
        game_board[i] = new Array(height_num);
        for (var j = 0; j < height_num; j++) {
            game_board[i][j] = 0;
            ctx.fillStyle = default_square_color;
            ctx.fillRect(get_real_position(i), get_real_position(j), square_size, square_size);
        }
    }
}

function reset_game(ctx) {
    score = 0;
    line = 0;
    reset_game_board(ctx)
    reset_virtual_board()
    now_t.rand()
    now_t.update(canvas_ctx, false)
    now_t.set_path(game_board)
    next_t.display_at_info(canvas_ctx, true)
    next_t.rand()
    next_t.display_at_info(ctx, false)
    stop = false
}

reset_game(canvas_ctx)

function do_key() {
    if (!key) return
    if (key == "w" || key == "ArrowUp") {
        if (now_t.layout_index < now_t.layout.length) {

            var old_idx = now_t.layout_index
            now_t.layout_index = (now_t.layout_index + 1) % 4;
            var new_idx = now_t.layout_index

            if (now_t.check(game_board)) {
                now_t.layout_index = old_idx
                now_t.update(canvas_ctx, true)
                now_t.layout_index = new_idx
                now_t.update(canvas_ctx, false)
            } else {
                now_t.layout_index = old_idx
            }
        }
    } else if (key == "s" || key == "ArrowDown") {
        do_fall()
    } else if (key == "a" || key == "ArrowLeft") {
        now_t.x--
        if (now_t.check(game_board)) {
            now_t.x++
            now_t.update(canvas_ctx, true)
            now_t.x--
            now_t.update(canvas_ctx, false)
        } else {
            now_t.x++
        }
    } else if (key == "d" || key == "ArrowRight") {
        now_t.x++
        if (now_t.check(game_board)) {
            now_t.x--
            now_t.update(canvas_ctx, true)
            now_t.x++
            now_t.update(canvas_ctx, false)
        } else {
            now_t.x--
        }
    } else if (key == "Enter") {
        reset_game(canvas_ctx)
    }

    key = null
}

function do_fall() {
    if (now_t.fall(game_board)) {
        now_t.update(canvas_ctx, true)
        now_t.y++
        now_t.update(canvas_ctx, false)
    } else {
        if (now_t.check_end(game_board)) {
            now_t.update(canvas_ctx, false)
            stop = true
            return
        }
        now_t.update_board(game_board)
        now_t = next_t
        now_t.update(canvas_ctx, false)
        now_t.set_path(game_board)
        next_t.display_at_info(canvas_ctx, true)
        next_t = new Tetromino(0, 0, "#000", 0, layout_L).rand();
        next_t.display_at_info(canvas_ctx, false)
        next_t.check_suc(canvas_ctx, game_board)

    }
}

function update_game(timestamp) {
    if (!stop) {
        if (!start) start = timestamp
        if (!start_ai) start_ai = timestamp
        //time go 1 s
        if (timestamp - start > time_man && !AI) {
            do_fall(now_t)
            start = timestamp;
        }
        if (timestamp - start_ai > time_ai && AI) {
            start_ai = timestamp;
            var path = now_t.path;
            path.splice(0, 1)

            var next = null

            if (path.length > 0) {
                next = path[0]
            } else {
                do_fall(now_t)
            }
            if (next) {
                if (next.x > now_t.x) {
                    key = "d"
                }
                if (next.x < now_t.x) {
                    key = "a"
                }
                if (next.y > now_t.y) {
                    key = "s"
                }
                if (next.y < now_t.y) {
                    // never
                }
                if (next.idx != now_t.layout_index) {
                    key = "w"
                }
            }
        }
        do_key()
    }
    requestAnimationFrame(update_game)
}

var anime_handle = requestAnimationFrame(update_game)


document.addEventListener('keydown', (event) => {
    const keyName = event.key;
    key = keyName;
    if (key == " ") {
        if (stop) {
            stop = false
        } else {
            stop = true
        }
        key = null
    } else if (key == "Enter") {
        reset_game(canvas_ctx)
        key = null
    }

}, false);

function get_all_path(te, board) {

    function where_key(a_te) {
        return "" + a_te.x + ":" + a_te.y + ":" + a_te.layout_index;
    }

    function where(a_te) {
        return {x: a_te.x, y: a_te.y, idx: a_te.layout_index};
    }

    function where_tmp(a_te, prev) {
        return {x: a_te.x, y: a_te.y, idx: a_te.layout_index, prev: prev};
    }

    var te_tmp = new Tetromino(0, 0, "#000", 0, layout_L);
    te_tmp.layout = te.layout;

    var action = [where_tmp(te, -1)];
    var occupy = {}
    occupy[where_key(te)] = true;

    var results = [];
    var head = 0;

    while (head < action.length) {
        var now_l = action[head];

        te_tmp.x = now_l.x;
        te_tmp.y = now_l.y;
        te_tmp.layout_index = now_l.idx;


        // check left
        te_tmp.x--;
        if (te_tmp.check(board)) {
            var key = where_key(te_tmp);
            if (!occupy.hasOwnProperty(key)) {
                action.push(where_tmp(te_tmp, head));
                occupy[key] = true;
            }
        }
        te_tmp.x++;

        // check right
        te_tmp.x++;
        if (te_tmp.check(board)) {
            var key = where_key(te_tmp);
            if (!occupy.hasOwnProperty(key)) {
                action.push(where_tmp(te_tmp, head));
                occupy[key] = true;
            }
        }
        te_tmp.x--;

        // check rotate
        var old_idx = te_tmp.layout_index
        te_tmp.layout_index = (te_tmp.layout_index + 1) % 4;
        if (te_tmp.check(board)) {
            var key = where_key(te_tmp);
            if (!occupy.hasOwnProperty(key)) {
                action.push(where_tmp(te_tmp, head));
                occupy[key] = true;
            }
        }
        te_tmp.layout_index = old_idx;

        // check down
        te_tmp.y++;
        if (te_tmp.check(board)) {
            var key = where_key(te_tmp);
            if (!occupy.hasOwnProperty(key)) {
                action.push(where_tmp(te_tmp, head));
                occupy[key] = true;
            }
        } else {
            te_tmp.y--;
            var moves = [];
            moves.push(where(te_tmp));
            var tprev = now_l.prev;
            while (tprev != -1) {
                te_tmp.x = action[tprev].x
                te_tmp.y = action[tprev].y
                te_tmp.layout_index = action[tprev].idx
                moves.push(where(te_tmp));
                tprev = action[tprev].prev;
            }
            moves.reverse();

            results.push({last: now_l, moves: moves});
        }
        head++;
    }
    return results
}

function rowsEliminated(boards, te) {
    var rownum = height_num
    var colnum = width_num

    var tx = te.x;
    var ty = te.y;
    var shapeArr = te.layout[te.layout_index];

    var eliminatedNum = 0;
    var eliminatedGridNum = 0;
    for (var i = 0; i < rownum; i++) {
        var flag = true;
        for (var j = 0; j < colnum; j++) {
            if (boards[j][i] == 0) {
                flag = false;
                break;
            }
        }
        if (flag === true) {
            eliminatedNum++;
            if (i >= ty && i < ty + 4) {
                for (var s = 0; s < 4; s++) {
                    if (shapeArr[i - ty][s] === 1) {
                        eliminatedGridNum++;
                    }
                }
            }
        }
    }
    return eliminatedNum * eliminatedGridNum;
}

function landingHeight(boards, te) {
    var rownum = height_num
    var colnum = width_num

    var tx = te.x;
    var ty = te.y;
    var shapeArr = te.layout[te.layout_index];

    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (shapeArr[i][j] === 1) {

                return rownum - (ty + i);
            }
        }
    }
}

function rowTransitions(boards) {

    var rownum = height_num
    var colnum = width_num

    var totalTransNum = 0;
    for (var i = 0; i < rownum; i++) {
        var nowTransNum = 0;
        var prevColor = 1;
        for (var j = 0; j < colnum; j++) {
            if (boards[j][i] != prevColor) {
                nowTransNum++;
                prevColor = boards[j][i];
            }
        }
        if (prevColor === 0) {
            nowTransNum++;
        }
        totalTransNum += nowTransNum;
    }

    return totalTransNum;
}

function colTransitions(boards) {
    var rownum = height_num
    var colnum = width_num

    var totalTransNum = 0;
    for (var i = 0; i < colnum; i++) {
        var nowTransNum = 0;
        var prevColor = 1;
        for (var j = 0; j < rownum; j++) {
            if (boards[i][j] != prevColor) {
                nowTransNum++;
                prevColor = boards[i][j];
            }
        }
        if (prevColor === 0) {
            nowTransNum++;
        }
        totalTransNum += nowTransNum;
    }
    return totalTransNum;
}

// @brief 空洞个数
function emptyHoles(boards) {
    var rownum = height_num
    var colnum = width_num

    var totalEmptyHoles = 0;
    for (var i = 0; i < colnum; i++) {
        var j = 0;
        var emptyHoles = 0;
        for (; j < rownum; j++) {
            if (boards[i][j] === 1) {
                j++;
                break;
            }
        }
        for (; j < rownum; j++) {
            if (boards[i][j] === 0) {
                emptyHoles++;
            }
        }
        totalEmptyHoles += emptyHoles;
    }
    return totalEmptyHoles;
}

// @brief 井的个数
function wellNums(boards) {
    var rownum = height_num
    var colnum = width_num

    var i = 0, j = 0, wellDepth = 0, tDepth = 0;

    var totalWellDepth = 0;
    // *) 获取最左边的井数
    wellDepth = 0;
    tDepth = 0;
    for (j = 0; j < rownum; j++) {
        if (boards[0][j] === 0 && boards[1][j] === 1) {
            tDepth++;
        } else {
            wellDepth += tDepth * (tDepth + 1) / 2;
            tDepth = 0;
        }
    }
    wellDepth += tDepth * (tDepth + 1) / 2;
    totalWellDepth += wellDepth;

    // *) 获取中间的井数
    wellDepth = 0;
    for (i = 1; i < colnum - 1; i++) {
        tDepth = 0;
        for (j = 0; j < rownum; j++) {
            if (boards[i][j] === 0 && boards[i - 1][j] === 1 && boards[i + 1][j] === 1) {
                tDepth++;
            } else {
                wellDepth += tDepth * (tDepth + 1) / 2;
                tDepth = 0;
            }
        }
        wellDepth += tDepth * (tDepth + 1) / 2;
    }
    totalWellDepth += wellDepth;

    // *) 获取最右边的井数
    wellDepth = 0;
    tDepth = 0;
    for (j = 0; j < rownum; j++) {
        if (boards[colnum - 1][j] === 0 && boards[colnum - 2][j] === 1) {
            tDepth++;
        } else {
            wellDepth += tDepth * (tDepth + 1) / 2;
            tDepth = 0;
        }
    }
    wellDepth += tDepth * (tDepth + 1) / 2;
    totalWellDepth += wellDepth;

    return totalWellDepth;

}

function evaluate_pie(boards, te) {
    var var_1 = (-4.500158825082766) * landingHeight(boards, te)              // 下落高度
    var var_2 = (3.4181268101392694) * rowsEliminated(boards, te)          // 消行个数
    var var_3 = (-3.2178882868487753) * rowTransitions(boards)                // 行变换
    var var_4 = (-9.348695305445199) * colTransitions(boards)                 // 列变化
    var var_5 = (-7.899265427351652) * emptyHoles(boards)                     // 空洞个数
    var var_6 = (-3.3855972247263626) * wellNums(boards);                     // 井数
    return var_1 + var_2 + var_3 + var_4 + var_5 + var_6;
}

function update_virtual_board(te) {
    var i, j;
    for (i = 0; i < height_num; i++) {
        for (j = 0; j < width_num; j++) {
            virtual_board[j][i] = game_board[j][i];
        }
    }
    te.update_board(virtual_board)
    return virtual_board;
}

function get_best_path(board, te) {
    var all_path = get_all_path(te, board)

    var bestScore = -1000000;
    var bestMove = null

    for (var i = 0; i < all_path.length; i++) {
        var step = all_path[i].last;

        var te_tmp = new Tetromino(0, 0, "#000", 0, layout_L);
        te_tmp.x = step.x
        te_tmp.y = step.y
        te_tmp.layout_index = step.idx
        te_tmp.layout = te.layout

        var shapeArrs = te.layout;
        var bkBoards = update_virtual_board(te_tmp)
        var tscore = evaluate_pie(bkBoards, te_tmp);
        if (bestMove === null || tscore > bestScore) {
            bestScore = tscore;
            bestMove = all_path[i].moves;
        }
    }
    return bestMove
}

var switch_ai = document.querySelector("#switch-ai");
var speedup = document.querySelector("#speed-up");
var speeddown = document.querySelector("#speed-down");
switch_ai.addEventListener("click", function () {
    AI = !AI
    if (AI) {
        switch_ai.innerHTML = "点击切换( 当前:AI )";
    } else {
        switch_ai.innerHTML = "点击切换( 当前:键盘控制 )";
    }
})
speedup.addEventListener("click", function () {
    if (AI) {
        if (time_ai > 30)
            time_ai -= 30
    } else {
        if (time_man > 200)
            time_man -= 200
        else
            time_man -= 100
    }
})
speeddown.addEventListener("click", function () {
    if (AI) {
        time_ai += 30
    } else {
        time_man += 200
    }
})