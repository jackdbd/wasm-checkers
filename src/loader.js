const { readFileSync } = require("fs");
const { join } = require("path");

const WASM_MODULE_PATH = join(__dirname, "..", "public", "checkers.wasm");

let wasmModule;

const setModule = module => {
  wasmModule = module;
};

const compileModulePromise = new Promise((resolve, reject) => {
  const bufferSource = readFileSync(WASM_MODULE_PATH);

  return WebAssembly.compile(bufferSource)
    .then(module => {
      //   console.warn("WASM module ready");
      setModule(module);
      resolve(module);
    })
    .catch(err => {
      reject(err);
    });
});

const instantiateModulePromise = new Promise((resolve, reject) => {
  const fn = async () => {
    let instance;
    let error;

    const importObject = {
      imports: {
        notifyPieceCrowned: (x, y) => {
          // tslint:disable-next-line:no-console
          console.log("A piece was crowned at (" + x + "," + y + ")");
        },
      },
    };

    if (wasmModule) {
      instance = new WebAssembly.Instance(module, importObject);
    } else {
      try {
        module = await compileModulePromise;
      } catch (err) {
        error = err;
      }

      if (module) {
        instance = new WebAssembly.Instance(module, importObject);
      }
    }

    if (instance) {
      // console.warn("WASM instance ready");
      resolve(instance.exports);
    } else {
      reject(error);
    }
  };

  fn();
});

const isValidModule = () => {
  const bufferSource = readFileSync(WASM_MODULE_PATH);
  return WebAssembly.validate(bufferSource);
};

module.exports = {
  instantiateModulePromise,
  isValidModule,
};
