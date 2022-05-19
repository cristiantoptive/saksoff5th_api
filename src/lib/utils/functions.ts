import path from "path";
import { v4 as uuidv4 } from "uuid";
import tempDirectory from "temp-dir";

function mergeByKeys(targetObj: { [prop: string]: any }, dataObj: { [prop: string]: any }, keys: string[]): void {
  keys.forEach(key => {
    if (dataObj.hasOwnProperty(key)) {
      targetObj[key] = dataObj[key];
    }
  });
}

function snackCase(text: string): string {
  return (text || "")
    .trim()
    .toUpperCase()
    .replace(/\s/g, "_");
}

function tempfile(extension = ""): string {
  return path.join(tempDirectory, uuidv4() + extension);
}

export {
  mergeByKeys,
  snackCase,
  tempfile,
};
