import child_process from "child_process";
import { stripIndent } from "common-tags";
import fs from "fs";
import packageJson from "../package.json";

/**
 * emit file content or just verify
 */
function emitFileContent(outFile: string, verify = false) {
  const previousContent = fs.existsSync(outFile)
    ? fs.readFileSync(outFile).toString()
    : "";

  const regexp = child_process
    .execFileSync("./node_modules/.bin/browserslist-useragent-regexp", [
      packageJson.browsers.join(","),
      "--allowHigherVersions",
    ])
    .toString()
    .replace(/\n/g, "");
  const newContent =
    stripIndent`
      /**
       * This file is generated by \`npm run generate:supportedBrowsersRegExp\`
       * Any manual changes will be overridden.
       */
      const supportedBrowsersRegExp = ${regexp};
      export default supportedBrowsersRegExp;
    ` + "\n";

  if (previousContent === newContent) {
    // eslint-disable-next-line no-console
    console.log(`${outFile} is up to date`);
    return;
  }
  if (verify) {
    // eslint-disable-next-line no-console
    console.error(
      `${outFile} is outdated, please run \`npm run generate:supportedBrowsersRegExp\``
    );
    process.exit(1);
  }
  fs.writeFileSync(outFile, newContent);
  // eslint-disable-next-line no-console
  console.log(`Successfully generated ${outFile}`);
}

function main() {
  if (process.argv.length < 3) {
    throw new Error("Must provide path to output file");
  }

  const outFile = process.argv[2];
  emitFileContent(outFile, process.argv[3] === "--verify");
}

main();
