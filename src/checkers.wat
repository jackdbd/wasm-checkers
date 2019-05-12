(module
  ;; Constants that define the checkers board
  (global $SQUARES_PER_ROW i32 (i32.const 8))
  (global $BYTES_PER_SQUARE i32 (i32.const 4))

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

  ;; CONSTANTS
  (export "SQUARES_PER_ROW" (global $SQUARES_PER_ROW))
  (export "BYTES_PER_SQUARE" (global $BYTES_PER_SQUARE))

  ;; FUNCTIONS
  (export "indexForPosition" (func $indexForPosition))
  (export "offsetForPosition" (func $offsetForPosition))
)