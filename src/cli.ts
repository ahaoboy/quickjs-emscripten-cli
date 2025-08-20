import { promises as fs } from "fs";
import { getQuickJS, QuickJSContext } from "quickjs-emscripten";

function init(vm: QuickJSContext) {
  const logHandle = vm.newFunction("log", (...args) => {
    const nativeArgs = args.map(vm.dump)
    console.log(...nativeArgs)
  })
  const consoleHandle = vm.newObject()
  vm.setProp(consoleHandle, "log", logHandle)
  vm.setProp(vm.global, "console", consoleHandle)
  consoleHandle.dispose()
  logHandle.dispose()
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: cli <file.js>");
    process.exit(1);
  }

  const code = await fs.readFile(file, "utf-8");

  const QuickJS = await getQuickJS()
  const vm = QuickJS.newContext()

  init(vm)

  const result = vm.evalCode(code)
  if (result.error) {
    result.error.dispose()
  } else {
    result.value.dispose()
  }

  vm.dispose()
}

main();
