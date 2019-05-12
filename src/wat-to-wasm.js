const { readFileSync, writeFileSync } = require("fs");
const { join } = require("path");
const wabt = require("wabt")();

const WAT_FILE_PATH = join(__dirname, "checkers.wat");
const WASM_MODULE_PATH = join(__dirname, "..", "public", "checkers.wasm");

const wasmModule = wabt.parseWat(
  WAT_FILE_PATH,
  readFileSync(WAT_FILE_PATH, "utf8")
);

const { buffer } = wasmModule.toBinary({ write_debug_names: true });
writeFileSync(WASM_MODULE_PATH, new Buffer(buffer));
