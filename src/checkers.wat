(module
  ;; Define a memory of at least 1 page (1 page is 64KB)
  ;; Memory can grow at the request of either the wasm module or the host.
  (memory $mem 1)

  ;; Constants that define the checkers board
  (global $BOARD_COLUMNS i32 (i32.const 7))
  (global $BOARD_ROWS i32 (i32.const 7))
  (global $BYTES_PER_SQUARE i32 (i32.const 4))
  (global $SQUARES_PER_ROW i32 (i32.const 8))

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
  (export "getPiece" (func $getPiece))
  (export "getTurnOwner" (func $getTurnOwner))
  (export "indexForPosition" (func $indexForPosition))
  (export "inRange" (func $inRange))
  (export "isBlack" (func $isBlack))
  (export "isCrowned" (func $isCrowned))
  (export "isWhite" (func $isWhite))
  (export "offsetForPosition" (func $offsetForPosition))
  (export "setCrown" (func $setCrown))
  (export "setPiece" (func $setPiece))
  (export "unsetCrown" (func $unsetCrown))
)