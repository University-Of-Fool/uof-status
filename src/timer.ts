/* *********************************
 *      UOF-STATUS.TIMER.TS        *
 * (c) 2023 THE UNIVERSITY OF FOOL *
 *   -licensed under MIT license-  *
 **********************************/

import uofStatusDatabase from "./db";
import * as log4js from "log4js";

export default class uofStatusTimer {
  private db: uofStatusDatabase;
  private interval: number;
  private max_time: number;
  private log: log4js.Logger;
  private async checkServers(): Promise<void> {
    var servers = await this.db.queryServersNoStatus();
    servers.forEach(async (value) => {
      var status = await this.db.queryLatestStatus(value.id);
      try {
        if (new Date().getTime() - status.time.getTime() >= this.max_time) {
          this.log.info("Modified server", value.id);
          this.db.newStatus(value.id, false);
        }
      } catch (e: any) {
        if (e.constructor.name == "TypeError") {
          this.log.warn(`Server ${value.id} have no status!`);
        } else {
          this.log.error("Unknown error occpuied in checkServers:", e);
        }
      }
    });
  }
  private timing(): void {
    this.log.debug("New loop started");
    this.checkServers();
  }

  constructor(
    db: uofStatusDatabase,
    timingInterval: number,
    timingMax: number,
  ) {
    this.db = db;
    this.interval = timingInterval;
    this.max_time = timingMax;
    this.log = log4js.getLogger("timer");
    setInterval(() => this.timing(), this.interval);
  }
}
