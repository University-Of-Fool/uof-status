/* *********************************
 *           UOF-STATUS            *
 * (c) 2023 THE UNIVERSITY OF FOOL *
 *   -licensed under MIT license-  *
 **********************************/
import { Md5 } from "ts-md5";
import { Command } from "commander";
import { makeString } from "./src/db";
import startUofStatus from "./src/app";
const program = new Command();

program
  .version("0.0.2")
  .option(
    "-c --configuration <filename>",
    "configuration file path",
    __dirname + "/config.toml",
  )
  .option("-C --calculate <token>", "calculate token's MD5")
  .option("-g --generate", "generate a new token")
  .addHelpText(
    "afterAll",
    `

(c) University of Fool 2023, some rights reserved.
This program is open-source under MIT license,
check it out at https://github.com/University-Of-Fool/uof-status`,
  )
  .parse(process.argv);
var options = program.opts();

if (options.calculate) {
  console.error(`This is the calculated Md5 of '${options.calculate}'\n`);
  console.log(Md5.hashStr(options.calculate));
  console.error("\nYou can write this to config.toml");
  console.error("in order to use '" + options.calculate + "' as token\n");
}
if (options.generate) {
  var token = makeString();
  console.error(`Generated a new token:\n`);
  console.log(token);
  console.log(Md5.hashStr(token));
  console.error("\nYou can write md5 to config.toml");
  console.error("in order to use this as token\n");
}
if (options.calculate || options.generate) process.exit(0);

startUofStatus(options.configuration);
