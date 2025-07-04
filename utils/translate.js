function parseBoolean(value) {
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return Boolean(value);
}


module.exports = parseBoolean