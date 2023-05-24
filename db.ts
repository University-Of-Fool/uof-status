/* *********************************
 *        UOF-STATUS.DB.TS         *
 * (c) 2023 THE UNIVERSITY OF FOOL *
 *   -licensed under MIT license-  *
 **********************************/
import { Md5 } from "ts-md5";
import { PrismaClient, Server, Status } from "@prisma/client";
import * as log4js from "log4js";
import { ServerInfo } from "./types";

export function makeString(): string {
  // To generate tokens
  // From https://stackoverflow.com/questions/54076988/create-random-string-in-typescript
  let outString: string = "";
  let inOptions: string = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 16; i++) {
    outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
  }

  return outString;
}

export default class uofStatusDatabase {
  private prisma: PrismaClient;
  private log: log4js.Logger;
  private cache: (Server & { statuses: Status[] })[];
  public newServer(name: string, description: string): Promise<ServerInfo> {
    return new Promise((resolve, reject) => {
      var token = makeString();
      this.prisma.server
        .create({
          data: {
            name: name,
            token: Md5.hashStr(token),
            description: description,
          },
        })
        .then((value) => {
          this.log.info("New server added:", value.name);
          this.log.debug("detail:", JSON.stringify(value));
          this.updateCache();
          resolve(value);
        })
        .catch((e) => {
          this.log.warn("Unknown error occupied in newServer:", e);
          reject(e);
        });
    });
  }
  public newStatus(serverId: number, online: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      this.prisma.server
        .findUnique({
          where: {
            id: serverId,
          },
        })
        .then((value) => {
          if (!value) reject(`No server with the id ${serverId} found`);
        })
        .then(() =>
          this.prisma.status.create({
            data: {
              serverId: serverId,
              status: online,
            },
          }),
        )
        .then((value) => {
          this.log.info(
            "New status added to",
            value.serverId,
            `id: ${value.id}`,
          );
          this.log.debug("detail:", JSON.stringify(value));
          this.updateCache();
          resolve();
        })
        .catch((e) => {
          this.log.warn("Unknown error occupied in newStatus:", e);
          reject(e);
        });
    });
  }
  public delServer(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.prisma.server
        .findUnique({
          where: {
            id: id,
          },
        })
        .then((value) => {
          if (value === null) reject(`No server with the id ${id} found`);
        })
        .then(() => this.prisma.status.deleteMany({ where: { serverId: id } }))
        .then(() => this.prisma.server.delete({ where: { id: id } }))
        .then(() => {
          this.log.info("Server deleted with all its relatives:", id);
        })
        .then(() => this.updateCache())
        .then(() => resolve())
        .catch((e) => {
          this.log.warn("Unknown error occupied in delServer:", e);
          reject(e);
        });
    });
  }
  public queryStatuses(serverId: number): Promise<Status[]> {
    return new Promise((resolve, reject) => {
      this.cache[serverId] != undefined
        ? resolve(this.cache[serverId].statuses)
        : reject(`No server with id ${serverId} found`);
    });
  }
  public db_queryStatuses(serverId: number): Promise<Status[]> {
    return new Promise((resolve, reject) => {
      this.prisma.server
        .findUnique({
          where: { id: serverId },
          include: {
            statuses: true,
          },
        })
        .then((value) => {
          if (value) {
            this.log.info("Queried statuses for server", serverId);
            this.log.debug("Detail:", JSON.stringify(value));
            resolve(value?.statuses);
          } else {
            reject(`No server with the id ${serverId} found`);
          }
        })
        .catch((e) => {
          this.log.warn("Unknown error occupied in queryStatus:", e);
          reject(e);
        });
    });
  }
  public queryLatestStatus(serverId: number): Promise<Status> {
    return new Promise((resolve, reject) => {
      let _ret = undefined;
      this.cache[serverId] != undefined
        ? (_ret = this.cache[serverId].statuses.at(-1))
        : reject(`No server with the id ${serverId} found.`);
      if (_ret != undefined) resolve(_ret);
    });
  }
  public db_queryLatestStatus(serverId: number): Promise<Status> {
    return new Promise((resolve, reject) => {
      this.prisma.status
        .findMany({
          where: { serverId: serverId },
          orderBy: {
            id: "desc",
          },
          take: 1,
        })
        .then((value_warpped) => {
          let value = value_warpped[0]; //unwarp
          if (value) {
            resolve(value);
            this.log.info("Queried latest statuses for server", serverId);
            this.log.debug("Detail:", JSON.stringify(value));
          } else {
            reject(`No server with the id ${serverId} found`);
          }
        })
        .catch((e) => {
          this.log.warn("Unknown error occupied in queryLatestStatus:", e);
          reject(e);
        });
    });
  }
  /*因为缓存机制因为为了方便查询，直接返回 cache 的话会出现空元素
    而且这个函数使用的次数也不多，故略过此函数的缓存化改造 */
  public queryServers(): Promise<(Server & { statuses: Status[] })[]> {
    return new Promise((resolve, reject) => {
      this.prisma.server
        .findMany({
          include: {
            statuses: true,
          },
        })
        .then((value) => {
          this.log.info("Queried servers");
          this.log.debug("Detail:", JSON.stringify(value));
          resolve(value);
        })
        .catch((e) => {
          this.log.warn("Unknown error occupied in queryServers:", e);
          reject(e);
        });
    });
  }
  // 略过改造，理由同上
  public queryServersNoStatus(): Promise<Server[]> {
    return new Promise((resolve, reject) => {
      this.prisma.server
        .findMany({
          include: {
            statuses: false,
          },
        })
        .then((value) => {
          this.log.info("Queried servers with no status");
          this.log.debug("Detail:", JSON.stringify(value));
          resolve(value);
        })
        .catch((e) => {
          this.log.warn("Unknown error occupied in queryServersNoStatus:", e);
          reject(e);
        });
    });
  }

  public queryServerToken(serverId: number): Promise<string> {
    return new Promise((resolve, reject) => {
      this.cache[serverId] != undefined
        ? resolve(this.cache[serverId].token)
        : reject(`No server found with the id ${serverId}`);
    });
  }

  public db_queryServerToken(id: number): Promise<string> {
    return new Promise((resolve, reject) => {
      this.prisma.server
        .findUnique({
          where: { id: id },
          include: {
            statuses: false,
          },
        })
        .then((value) => {
          if (value) {
            this.log.info("Queried token for server", id);
            this.log.debug("Detail:", JSON.stringify(value));
            resolve(value.token);
          } else {
            reject(`No server with the id ${id} found.`);
          }
        });
    });
  }
  public updateCache(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queryServers()
        .then((value) => {
          value.forEach((item) => {
            this.cache[item.id] = item;
          });
          this.log.debug("Cache updated");
          resolve();
        })
        .catch((e) => {
          this.log.warn("Updating cache failed, reason:", e);
          reject(e);
        });
    });
  }
  constructor() {
    this.prisma = new PrismaClient();
    this.log = log4js.getLogger("database");
    this.cache = [];
    this.updateCache();
  }
}
