/* *********************************
 *       UOF-STATUS.API.TS         *
 * (c) 2023 THE UNIVERSITY OF FOOL *
 *   -licensed under MIT license-  *
 **********************************/
import { Express } from "express";
import { Md5 } from "ts-md5";
import * as log4js from "log4js";
import uofStatusDatabase from "./db";
import { Configuration } from "./types";

export default class uofStatusApi {
  private app: Express;
  private db: uofStatusDatabase;
  private config: Configuration;
  private log: log4js.Logger;

  private putServer() {
    this.app.post("/api/server/put", async (req, res) => {
      this.log.info("Incoming put server request");
      this.log.debug("Body:" + JSON.stringify(req.body));
      if (this.config.Api.global_token === Md5.hashStr(req.body.token)) {
        if (req.body.name) {
          try {
            var info = await this.db.newServer(
              req.body.name,
              req.body.description || "Server",
            );
            res.status(200).send({
              success: true,
              id: info.id,
              token: info.token,
            });
            this.log.info(
              `Server put with name ${req.body.name}, ${req.body.description}`,
            );
          } catch (e) {
            this.log.warn("Unknown error occupied in putServer:", e);
            res.status(500).send({ error: JSON.stringify(e) });
          }
        } else {
          this.log.info("put server failed, reason: No name provided");
          res.status(400).send({
            success: false,
            reason: "No name provided",
          });
        }
      } else {
        this.log.info(
          "put server failed, reason: Wrong token or no token provided",
        );
        res.status(401).send({
          success: false,
          reason: "Wrong token or no token provided",
        });
      }
    });
  }
  private putStatus() {
    this.app.post("/api/status/put", async (req, res) => {
      try {
        this.log.info("Incoming put status request");
        this.log.debug("Body:" + JSON.stringify(req.body));
        if (typeof req.body.serverId === "number") {
          var token = await this.db.queryServerToken(req.body.serverId);
          if (token !== Md5.hashStr(req.body.token)) {
            this.log.info(
              "put status failed, reason: Wrong token or no token provided",
            );
            res.status(401).send({
              success: false,
              reason: "Wrong token or no token provided",
            });
            return;
          }
          if (typeof req.body.online === "boolean") {
            await this.db.newStatus(req.body.serverId, req.body.online);
            res.status(200).send({ success: true });
            this.log.info(
              `Status put with the id ${req.body.serverId} status ${req.body.online}`,
            );
          } else {
            res.status(400).send({
              success: false,
              reason: "no online provided",
            });
            this.log.info("put status failed, reason: no online provided");
          }
        } else {
          res.status(400).send({
            success: false,
            reason: "serverId undefined or NaN",
          });
          this.log.info("put status failed, reason: serverId undefined or NaN");
        }
      } catch (e) {
        this.log.warn("Unknown error occupied in putStatus:", e);
        res.status(500).send({ error: JSON.stringify(e) });
      }
    });
  }

  private delServer() {
    this.app.post("/api/server/drop", async (req, res) => {
      try {
        this.log.info("Incoming drop server request");
        this.log.debug("Body:" + JSON.stringify(req.body));
        if (this.config.Api.global_token === Md5.hashStr(req.body.token)) {
          if (typeof req.body.serverId === "number") {
            await this.db.delServer(req.body.serverId);
            res.status(200).send({ success: true });
            this.log.info("Server dropped with the id", req.body.serverId);
          } else {
            res.status(400).send({
              success: false,
              reason: "serverId undefined or NaN",
            });
            this.log.info(
              "Drop server failed, reason: serverId undefined or NaN",
            );
          }
        } else {
          res.status(401).send({
            success: false,
            reason: "Wrong token or no token provided",
          });
          this.log.info(
            "Drop server failed, reason: Wrong token or no token provided",
          );
        }
      } catch (e: any) {
        if (typeof e === "string")
          res.status(404).send({ success: false, reason: e });
        else if (e.constructor.name == "PrismaClientKnownRequestError")
          this.log.info("Known error PrismaClientKnownRequestError occpuied");
        else {
          res.status(500).send({ error: JSON.stringify(e) });
          this.log.warn("Unknown error occupied in delServer:", e);
        }
      }
    });
  }

  private getServer() {
    this.app.get("/api/server/get", async (req, res) => {
      this.log.info("Incoming get server request");
      try {
        var servers = await this.db.queryServersNoStatus();
        servers.forEach((_value, index) => {
          servers[index].token = "hidden";
        });
        res.status(200).send(servers);
        this.log.info("Getting server succeed");
      } catch (e) {
        res.status(500).send({ error: JSON.stringify(e) });
        this.log.warn("Unknown error occupied in getServer:", e);
      }
    });
  }

  private getStatus() {
    this.app.get("/api/status/get/:id", (req, res) => {
      this.log.info("Incoming get server request");
      this.log.debug("Path:", req.path);
      try {
        this.db
          .queryLatestStatus(Number(req.params.id))
          .then((value) => {
            var _value: any;
            if (!value) _value = {};
            else _value = value;
            res.status(200).send({
              success: true,
              serverId: _value.serverId || req.params.id,
              status: (() => {
                if (typeof _value.status === "boolean") {
                  return _value.status;
                } else {
                  return "Undefined";
                }
              })(),
              time: _value.time || "Undefined",
            });
            this.log.info("Status got with the severId", req.params.id);
          })
          .catch((e) => {
            if (typeof e === "string") {
              res.status(404).send({ success: false, reason: e });
              this.log.info("Gettings status failed, reason:", e);
            } else {
              res.status(500).send({ error: JSON.stringify(e) });
              this.log.warn("Unknown error occupied in getStatus:", e);
            }
          });
      } catch (e: any) {
        res.status(500).send({ error: JSON.stringify(e) });
        this.log.warn("Unknown error occupied in getStatus:", e);
      }
    });
  }

  constructor(
    express: Express,
    db: uofStatusDatabase,
    config: Configuration,
    blocked?: boolean,
  ) {
    this.app = express;
    this.db = db;
    this.config = config;
    this.log = log4js.getLogger("api");

    this.delServer();
    this.getServer();
    this.putServer();
    this.putStatus();
    this.getStatus();
  }
}
