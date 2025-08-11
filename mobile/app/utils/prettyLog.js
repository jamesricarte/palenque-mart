// prettyLog.js
export const prettyLog = (data, options = {}) => {
  const {
    spacing = 2, // indentation spaces
    color = true, // use colors for keys/values
    maxDepth = 10, // limit recursion depth
    currentDepth = 0, // internal recursion tracker
  } = options;

  // Helper to detect object type
  const getType = (value) => {
    if (Array.isArray(value)) return "array";
    if (value === null) return "null";
    return typeof value;
  };

  // ANSI colors
  const colors = {
    reset: "\x1b[0m",
    key: "\x1b[37m", // white
    string: "\x1b[32m", // green
    number: "\x1b[33m", // yellow
    boolean: "\x1b[35m", // magenta
    null: "\x1b[90m", // gray
  };

  const indent = (level) => " ".repeat(level * spacing);

  const formatValue = (value, depth) => {
    const type = getType(value);

    if (type === "string")
      return color ? `${colors.string}"${value}"${colors.reset}` : `"${value}"`;
    if (type === "number")
      return color ? `${colors.number}${value}${colors.reset}` : value;
    if (type === "boolean")
      return color ? `${colors.boolean}${value}${colors.reset}` : value;
    if (type === "null")
      return color ? `${colors.null}null${colors.reset}` : "null";

    if (type === "array") {
      if (depth >= maxDepth) return "[Array]";
      if (value.length === 0) return "[]";

      const items = value.map((v) => formatValue(v, depth + 1));
      return `[\n${indent(depth + 1)}${items.join(`,\n${indent(depth + 1)}`)}\n${indent(depth)}]`;
    }

    if (type === "object") {
      if (depth >= maxDepth) return "[Object]";
      const entries = Object.entries(value);
      if (entries.length === 0) return "{}";

      const props = entries.map(([k, v]) => {
        const key = color ? `${colors.key}${k}${colors.reset}` : k;
        return `${key}: ${formatValue(v, depth + 1)}`;
      });

      return `{\n${indent(depth + 1)}${props.join(`,\n${indent(depth + 1)}`)}\n${indent(depth)}}`;
    }

    return String(value);
  };

  console.log(formatValue(data, currentDepth));
};
