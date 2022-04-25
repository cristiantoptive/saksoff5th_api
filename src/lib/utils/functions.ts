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

export {
  mergeByKeys,
  snackCase,
};
