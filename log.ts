import * as fs from "fs";

function writeFile(path: string, contents: string) {
  fs.appendFileSync(path, contents);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { writeFile, sleep };
