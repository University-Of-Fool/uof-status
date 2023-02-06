/* *********************************
 *      UOF-STATUS.CONFIG.TS       *
 * (c) 2023 THE UNIVERSITY OF FOOL *
 *   -licensed under MIT license-  *
 **********************************/
import fs from 'node:fs';
import toml from 'toml';
import * as log4js from 'log4js';
import { Md5 } from 'ts-md5';
import { Configuration, LogConfig } from './types';
import { makeString } from './db';

export default class uofStatusConfig {
    private config: Configuration;
    public getConfig(): Configuration {
        return this.config;
    }
    private genAppender(obj:LogConfig, name:string): string[]{
        var appenders:string[]=[];
        if(obj.console) appenders.push("console");
        if(obj.file) appenders.push(`f_${name}`);
        return appenders;
    }
    constructor(path: string) {
        var configObj: any = {};
        try {
            fs.accessSync(path, fs.constants.R_OK);
            configObj = toml.parse(fs.readFileSync(path, { encoding: 'utf8' }));
        } catch (e) {
            console.warn("Configuration file is not readable");
        }
        if (typeof configObj.Service == "undefined") {
            configObj.Service = { listen: '127.0.0.1', port: '4044' };
        }
        if (typeof configObj.Api == "undefined") {
            configObj.Api = {}
        }
        if (typeof configObj.Logging == "undefined") {
            configObj.Logging = {}
        }
        if(typeof configObj.Timer==='undefined') configObj.Timer={};
        if (typeof configObj.Logging.Db == 'undefined') configObj.Logging.Db = {};
        if (typeof configObj.Logging.Api == 'undefined') configObj.Logging.Api = {};
        if (typeof configObj.Logging.App == 'undefined') configObj.Logging.App = {};
        if(typeof configObj.Logging.Timer==='undefined') configObj.Logging.Timer={};
        this.config = {
            Service: {
                listen: configObj.Service.listen || '127.0.0.1',
                port: configObj.Service.port || '4044'
            },
            Api: {
                global_token: configObj.Api.global_token || (function () {
                    var token = makeString();
                    console.warn("Service.global_token is not defined in the Configuration File");
                    console.warn("Auto-generated global_token: ", token);
                    console.warn("Please notice that this token will be discarded when the software stopped.")
                    return Md5.hashStr(token);
                })()
            },
            Logging: {
                Api: {
                    level: configObj.Logging.Api.level || 'info',
                    console: configObj.Logging.Api.console || false,
                    file: configObj.Logging.Api.file || true,
                    filename: configObj.Logging.Api.filename || __dirname+"/logs/api.log"
                },
                Db: {
                    level: configObj.Logging.Db.level || 'info',
                    console: configObj.Logging.Db.console || false,
                    file: configObj.Logging.Db.file || true,
                    filename: configObj.Logging.Db.filename || __dirname+"/logs/db.log"
                },
                App: {
                    level: configObj.Logging.App.level || 'warn',
                    console: configObj.Logging.App.console || true,
                    file: configObj.Logging.App.file || true,
                    filename: configObj.Logging.App.filename|| __dirname+"/logs/app.log"
                },
                Timer: {
                    level: configObj.Logging.Timer.level || 'info',
                    console: configObj.Logging.Timer.console || false,
                    file: configObj.Logging.Timer.file || true,
                    filename: configObj.Logging.Timer.filename|| __dirname+"/logs/timer.log"
                }
            },
            Timer:{
                interval:configObj.Timer.interval || 2500,
                max_seconds:configObj.Timer.max_seconds||70000
            }
        }

        log4js.configure({
            appenders: {
                f_db: { type: "file", filename: this.config.Logging.Db.filename },
                f_app: { type: "file", filename: this.config.Logging.App.filename },
                f_api: { type: "file", filename: this.config.Logging.Api.filename },
                f_timer: { type: "file", filename: this.config.Logging.Timer.filename },
                console: { type: "console" }
            },
            categories: {
                default:{appenders:["console"], level:"mark"},
                database:{appenders:this.genAppender(this.config.Logging.Db, 'db'), level:this.config.Logging.Db.level},
                api:{appenders:this.genAppender(this.config.Logging.Api, 'api'), level:this.config.Logging.Api.level},
                app:{appenders:this.genAppender(this.config.Logging.App, 'app'), level:this.config.Logging.App.level},
                timer:{appenders:this.genAppender(this.config.Logging.Timer, 'timer'), level:this.config.Logging.Timer.level},
            }
        })
    }
}
