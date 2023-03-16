/* *********************************
 *       UOF-STATUS.APP.TS         *
 * (c) 2023 THE UNIVERSITY OF FOOL *
 *   -licensed under MIT license-  *
 **********************************/
import express from "express";
require("express-async-errors"); // To handle async errors in Express
import ejs from "ejs";
import { Md5 } from "ts-md5";
import { Command } from "commander";
const program = new Command();
import * as log4js from "log4js";
import uofStatusDatabase, { makeString } from "./db";
import uofStatusApi from "./api";
import uofStatusConfig from "./config";
import uofStatusTimer from "./timer";

program
    .version("0.0.1")
    .option(
        "-c --configuration <filename>",
        "configuration file path",
        __dirname + "/config.toml"
    )
    .option("-C --calculate <token>", "calculate token's MD5")
    .option("-g --generate", "generate a new token")
    .addHelpText(
        "afterAll",
        `

(c) University of Fool 2023, some rights reserved.
This program is open-source under MIT license,
check it out at https://github.com/University-Of-Fool/uof-status`
    )
    .parse(process.argv);
var options = program.opts();

if (options.calculate) {
    console.error(`This is the calculated Md5 of '${options.calculate}'\n`);
    console.log(Md5.hashStr(options.calculate));
    console.error("\nYou can write this to config.toml");
    console.error("in order to use '" + options.calculate + "' as token\n");
    process.exit(0);
}
if (options.generate) {
    var token = makeString();
    console.error(`Generated a new token:\n`);
    console.log(token);
    console.log(Md5.hashStr(token));
    console.error("\nYou can write md5 to config.toml");
    console.error("in order to use this as token\n");
    process.exit(0);
}

const config = new uofStatusConfig(options.configuration);
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

var db = new uofStatusDatabase();
var api = new uofStatusApi(app, db, config.getConfig());
var timer = new uofStatusTimer(
    db,
    config.getConfig().Timer.interval,
    config.getConfig().Timer.max_seconds
);
//timer.startTiming();
var log = log4js.getLogger("app");
var log2c = log4js.getLogger();

app.get("/", (req, res) => {
    log.info("Incoming request to access /");
    log.debug("Details:", JSON.stringify(req.headers));
    db.queryServers()
        .then((value) =>
            ejs.renderFile(__dirname + "/layouts/index.ejs", {
                servers: value,
                useragent: req.headers["user-agent"],
            })
        )
        .then((value) => {
            res.send(value);
        });
});

app.use(
    (
        err: Error,
        req: { path: string },
        res: {
            status: (arg0: number) => void;
            json: (arg0: { error: any }) => void;
            send: (arg0: string) => void;
        },
        next: (arg0: any) => void
    ) => {
        if (req.path.match(/^\/api/)) {
            res.status(500);
            var responseErr = { success: false, error: err.message };
            res.json(responseErr);
        } else {
            res.status(500);
            ejs.renderFile(__dirname + "/layouts/error.ejs", {
                error: err.toString(),
            }).then((value) => {
                res.send(value);
            });
        }
        log.warn("Error occpuied:", err);
        next(err);
    }
);

app.listen(
    config.getConfig().Service.port,
    config.getConfig().Service.listen,
    () => {
        log2c.mark(
            `Server started at http://${config.getConfig().Service.listen}:${
                config.getConfig().Service.port
            }`
        );
    }
);
