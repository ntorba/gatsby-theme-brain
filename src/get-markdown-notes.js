const fs = require("fs");
const path = require("path");
const generateSlug = require("./generate-slug");

function toRegExp(value) {
  if (typeof value === "string") {
    return new RegExp(`^${value}$`);
  }
  return value;
}

const matches = (filename) => (regExp) => regExp.test(filename);
const doesNotMatchAny = (regExps) => (filename) =>
  !regExps.some(matches(filename));

module.exports = (pluginOptions) => {
  let notesDirectory = pluginOptions.notesDirectory || "content/brain/";
  let notesFileExtensions = pluginOptions.notesFileExtensions || [
    ".md",
    ".mdx",
  ];
  let exclusions =
    (pluginOptions.exclude && pluginOptions.exclude.map(toRegExp)) || [];

  let nodes = [];

  const recursive = directory => fs.readdirSync(directory)
    .filter(doesNotMatchAny(exclusions))
    .map(filename => {
    let slug = pluginOptions.generateSlug
      ? pluginOptions.generateSlug(filename)
      : generateSlug(path.parse(filename).name);
    let fullPath = path.join(directory, filename);
    if (fs.lstatSync(fullPath).isDirectory()) {
        recursive(fullPath)
    }else if (notesFileExtensions.includes(path.extname(filename).toLowerCase())){
        let rawFile = fs.readFileSync(fullPath, "utf-8");
        nodes.push({
            filename: filename,
            fullPath: fullPath,
            slug: slug,
            rawFile: rawFile,
        });
    }
  });
  recursive(notesDirectory);
  return nodes;
};
