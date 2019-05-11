(module
  (func $addTwoNumbers (param $lhs i32) (param $rhs i32) (result i32)
    (i32.add
      (get_local $lhs)
      (get_local $rhs)
    )
  )
  (export "addTwoNumbers" (func $addTwoNumbers))
)