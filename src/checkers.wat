(module $checkers

  ;; Imports are functions defined on the Javascript side.
  (import "imports" "notifyPieceCrowned" (func $notify_piececrowned (param $pieceX i32) (param $pieceY i32)))
  (import "imports" "notifyPieceMoved" (func $notify_piecemoved (param $fromX i32) (param $fromY i32) (param $toX i32) (param $toY i32)))

  ;; Define a memory of at least 1 page (1 page is 64KB)
  ;; Memory can grow at the request of either the wasm module or the host.
  (memory $mem 1)

  (global $TRUE i32 (i32.const 1))
  (global $FALSE i32 (i32.const 0))

  ;; Constants that define the checkers board
  (global $BOARD_COLUMNS i32 (i32.const 7))
  (global $BOARD_ROWS i32 (i32.const 7))
  (global $BYTES_PER_SQUARE i32 (i32.const 4))
  (global $SQUARES_PER_ROW i32 (i32.const 8))
  (global $MAX_JUMP_DISTANCE i32 (i32.const 2))

  ;; Bit flags used to compose the bit mask for each piece on the checkers board
  (global $EMPTY i32 (i32.const 0))      ;; [24 unused bits] 0000 0000
  (global $BLACK i32 (i32.const 1))      ;; [24 unused bits] 0000 0001
  (global $WHITE i32 (i32.const 2))      ;; [24 unused bits] 0000 0010
  (global $CROWN i32 (i32.const 4))      ;; [24 unused bits] 0000 0100
  (global $NOT_CROWN i32 (i32.const 3))  ;; [24 unused bits] 0000 0011

  ;; Global, mutable variable to keep track of the current game turn (the game
  ;; starts from turn 0).
  (global $currentTurn (mut i32) (i32.const 0))

  (func $isBlack (param $piece i32) (result i32)
    (i32.eq
      (i32.and
        (get_local $piece)
        (get_global $BLACK)
      )
      (get_global $BLACK)
    )
  )

  (func $isWhite (param $piece i32) (result i32)
    (i32.eq
      (i32.and
        (get_local $piece)
        (get_global $WHITE)
      )
      (get_global $WHITE)
    )
  )

  (func $isCrowned (param $piece i32) (result i32)
    (i32.eq
      (i32.and
        (get_local $piece)
        (get_global $CROWN)
      )
      (get_global $CROWN)
    )
  )

  ;; Convert a 2D coordinate into a 1D coordinate (this does not take into
  ;; account the byte offset just yet).
  (func $indexForPosition (param $x i32) (param $y i32) (result i32)
    (i32.add
      (i32.mul
        (get_global $SQUARES_PER_ROW)
        (get_local $y)
      )
      (get_local $x)
    )
  )

  ;; Crown a piece
  ;; This function does not mutate the piece which was passed in. It returns a
  ;; new piece (i.e. 4 byte) that has the CROWN bit flag set to true.
  (func $setCrown (param $piece i32) (result i32)
    (i32.or
      (get_local $piece)
      (get_global $CROWN)
    )
  )

  ;; Uncrown a piece
  (func $unsetCrown (param $piece i32) (result i32)
    (i32.and
      (get_local $piece)
      (get_global $NOT_CROWN)
    )
  )

  ;; Compute the byte offset for a 2D coordinate
  ;; WASM ha a linear memory and no array datatypes, so we need to represent
  ;; each spot on the checkers game board with BYTES_PER_SQUARE bytes (e.g. 4).
  ;; offset = (x + y * SQUARES_PER_ROW) * BYTES_PER_SQUARE
  (func $offsetForPosition (param $x i32) (param $y i32) (result i32)
    (i32.mul
      (call $indexForPosition (get_local $x) (get_local $y))
      (get_global $BYTES_PER_SQUARE)
    )
  )

  ;; Detect if values are within range
  ;; See https://webassembly.org/docs/semantics/#32-bit-integer-operators
  (func $inRange (param $low i32) (param $high i32) (param $value i32) (result i32)
    (i32.and
      (i32.ge_s
        (get_local $value)
        (get_local $low)
      )
      (i32.le_s
        (get_local $value)
        (get_local $high)
      )
    )
  )

  ;; Get a piece from the board
  (func $getPiece (param $x i32) (param $y i32) (result i32)
    (if (result i32)
      (block (result i32)
        (i32.and
          (call $inRange
            (i32.const 0)
            (get_global $BOARD_COLUMNS)
            (get_local $x)
          )
          (call $inRange
            (i32.const 0)
            (get_global $BOARD_ROWS)
            (get_local $y)
          )
        )
      )
      (then
        (i32.load
          (call $offsetForPosition
            (get_local $x)
            (get_local $y)
          )
        )
      )
      (else
        (unreachable)
      )
    )
  )

  (func $setPiece (param $x i32) (param $y i32) (param $piece i32)
    (i32.store
      (call $offsetForPosition
        (get_local $x)
        (get_local $y)
      )
      (get_local $piece)
    )
  )

  ;; Get the current turn owner (white or black).
  (func $getTurnOwner (result i32)
    (get_global $currentTurn)
  )

  ;; Set the turn's owner
  (func $setTurnOwner (param $piece i32)
    (set_global $currentTurn (get_local $piece))
  )

  ;; At the end of a turn, switch turn's owner to the other player
  (func $toggleTurnOwner
    (if
      (i32.eq
        (call $getTurnOwner)
        (i32.const 1)
      )
    (then
      (call $setTurnOwner (i32.const 2))
    )
    (else
      (call $setTurnOwner (i32.const 1))
    )
    )
  )

  ;; Determine if it's a player's turn
  (func $isPlayersTurn (param $player i32) (result i32)
    (i32.gt_s
      (i32.and (get_local $player) (call $getTurnOwner))
      (get_global $FALSE)
    )
  )

  ;; Crown black pieces in row 0, white pieces in row 7
  (func $shouldCrown (param $pieceY i32) (param $piece i32) (result i32)
    (i32.or
      (i32.and
        (i32.eq
          (get_local $pieceY)
          (i32.const 0)
        )
        (call $isBlack (get_local $piece))
      )
      (i32.and
        (i32.eq
          (get_local $pieceY)
          (i32.const 7)
        )
        (call $isWhite (get_local $piece))
      )
    )
  )

  ;; Convert a piece into a crowned piece and invoke a host notifier.
  (func $crownPiece (param $x i32) (param $y i32)
    (local $piece i32)
    (set_local $piece (call $getPiece (get_local $x) (get_local $y)))
    (call $setPiece
      (get_local $x)
      (get_local $y)
      (call $setCrown (get_local $piece))
    )
    (call $notify_piececrowned (get_local $x) (get_local $y))
  )

  (func $distance (param $x i32) (param $y i32) (result i32)
    (i32.sub (get_local $x) (get_local $y))
  )

  ;; Determine if the move is valid
  (func $isValidMove (param $fromX i32) (param $fromY i32)
                     (param $toX i32) (param $toY i32) (result i32)
    (local $player i32)
    (local $target i32)

    (set_local $player (call $getPiece (get_local $fromX) (get_local $fromY)))
    (set_local $target (call $getPiece (get_local $toX) (get_local $toY)))

    (if (result i32)
      (block (result i32)
        (i32.and
          (call $validJumpDistance (get_local $fromY) (get_local $toY))
          (i32.and
            (call $isPlayersTurn (get_local $player))
            ;; target must be unoccupied
            (i32.eq (get_local $target) (i32.const 0))
          )
        )
      )
      (then
        (get_global $TRUE)
      )
      (else
        (get_global $FALSE)
      )
    )
  )

  ;; Ensures travel is 1 or 2 squares
  (func $validJumpDistance (param $from i32) (param $to i32) (result i32)
    (local $d i32)
    (set_local $d
    (if (result i32)
      (i32.gt_s (get_local $to) (get_local $from))
      (then
        (call $distance (get_local $to) (get_local $from))
      )
      (else
        (call $distance (get_local $from) (get_local $to))
      ))
    )
    (i32.le_u
      (get_local $d)
      (get_global $MAX_JUMP_DISTANCE)
    )
  )

  ;; Exported move function to be called by the game host
  (func $move (param $fromX i32) (param $fromY i32)
              (param $toX i32) (param $toY i32) (result i32)
    (if (result i32)
      (block (result i32)
        (call $isValidMove (get_local $fromX) (get_local $fromY)
                           (get_local $toX) (get_local $toY))
      )
      (then
        (call $doMove (get_local $fromX) (get_local $fromY)
                       (get_local $toX) (get_local $toY))
      )
      (else
        (get_global $FALSE)
      )
    )
  )

  ;; Internal move function, performs actual move post-validation of target.
  ;; Currently not handled:
  ;;   - removing opponent piece during a jump
  ;;   - detecting win condition
  (func $doMove (param $fromX i32) (param $fromY i32)
                 (param $toX i32) (param $toY i32) (result i32)
    (local $curpiece i32)
    (set_local $curpiece (call $getPiece (get_local $fromX)(get_local $fromY)))

    (call $toggleTurnOwner)
    (call $setPiece (get_local $toX) (get_local $toY) (get_local $curpiece))
    (call $setPiece (get_local $fromX) (get_local $fromY) (i32.const 0))
    (if (call $shouldCrown (get_local $toY) (get_local $curpiece))
      (then (call $crownPiece (get_local $toX) (get_local $toY))))
    (call $notify_piecemoved (get_local $fromX) (get_local $fromY)
                             (get_local $toX) (get_local $toY))
    (get_global $TRUE)
  )

  ;; Manually place each piece on the board to initialize the game
  (func $initBoard
    ;; Place the white pieces at the top of the board
    (call $setPiece (i32.const 1) (i32.const 0) (get_global $WHITE))
    (call $setPiece (i32.const 3) (i32.const 0) (get_global $WHITE))
    (call $setPiece (i32.const 5) (i32.const 0) (get_global $WHITE))
    (call $setPiece (i32.const 7) (i32.const 0) (get_global $WHITE))

    (call $setPiece (i32.const 0) (i32.const 1) (get_global $WHITE))
    (call $setPiece (i32.const 2) (i32.const 1) (get_global $WHITE))
    (call $setPiece (i32.const 4) (i32.const 1) (get_global $WHITE))
    (call $setPiece (i32.const 6) (i32.const 1) (get_global $WHITE))

    (call $setPiece (i32.const 1) (i32.const 2) (get_global $WHITE))
    (call $setPiece (i32.const 3) (i32.const 2) (get_global $WHITE))
    (call $setPiece (i32.const 5) (i32.const 2) (get_global $WHITE))
    (call $setPiece (i32.const 7) (i32.const 2) (get_global $WHITE))

    ;; Place the black pieces at the bottom of the board
    (call $setPiece (i32.const 0) (i32.const 5) (get_global $BLACK))
    (call $setPiece (i32.const 2) (i32.const 5) (get_global $BLACK))
    (call $setPiece (i32.const 4) (i32.const 5) (get_global $BLACK))
    (call $setPiece (i32.const 6) (i32.const 5) (get_global $BLACK))

    (call $setPiece (i32.const 1) (i32.const 6) (get_global $BLACK))
    (call $setPiece (i32.const 3) (i32.const 6) (get_global $BLACK))
    (call $setPiece (i32.const 5) (i32.const 6) (get_global $BLACK))
    (call $setPiece (i32.const 7) (i32.const 6) (get_global $BLACK))

    (call $setPiece (i32.const 0) (i32.const 7) (get_global $BLACK))
    (call $setPiece (i32.const 2) (i32.const 7) (get_global $BLACK))
    (call $setPiece (i32.const 4) (i32.const 7) (get_global $BLACK))
    (call $setPiece (i32.const 6) (i32.const 7) (get_global $BLACK))

    ;; Black goes first
    (call $setTurnOwner (get_global $BLACK))
  )

  ;; CONSTANTS
  (export "BLACK" (global $BLACK))
  (export "BOARD_COLUMNS" (global $BOARD_COLUMNS))
  (export "BOARD_ROWS" (global $BOARD_ROWS))
  (export "BYTES_PER_SQUARE" (global $BYTES_PER_SQUARE))
  (export "CROWN" (global $CROWN))
  (export "NOT_CROWN" (global $NOT_CROWN))
  (export "SQUARES_PER_ROW" (global $SQUARES_PER_ROW))
  (export "WHITE" (global $WHITE))

  ;; FUNCTIONS
  (export "crownPiece" (func $crownPiece))
  (export "distance" (func $distance))
  (export "doMove" (func $doMove))
  (export "getPiece" (func $getPiece))
  (export "getTurnOwner" (func $getTurnOwner))
  (export "indexForPosition" (func $indexForPosition))
  (export "initBoard" (func $initBoard))
  (export "inRange" (func $inRange))
  (export "isBlack" (func $isBlack))
  (export "isCrowned" (func $isCrowned))
  (export "isPlayersTurn" (func $isPlayersTurn))
  (export "isValidMove" (func $isValidMove))
  (export "isWhite" (func $isWhite))
  (export "move" (func $move))
  (export "offsetForPosition" (func $offsetForPosition))
  (export "setCrown" (func $setCrown))
  (export "setPiece" (func $setPiece))
  (export "setTurnOwner" (func $setTurnOwner))
  (export "shouldCrown" (func $shouldCrown))
  (export "toggleTurnOwner" (func $toggleTurnOwner))
  (export "unsetCrown" (func $unsetCrown))
  (export "validJumpDistance" (func $validJumpDistance))
)