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
        outString += inOptions.charAt(
            Math.floor(Math.random() * inOptions.length)
        );
    }

    return outString;
}

export default class uofStatusDatabase {
    private prisma: PrismaClient;
    private log: log4js.Logger;
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
                    resolve({ token: token, id: value.id });
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
                    if (!value)
                        reject(`No server with the id ${serverId} found`);
                })
                .then(() =>
                    this.prisma.status.create({
                        data: {
                            serverId: serverId,
                            status: online,
                        },
                    })
                )
                .then((value) => {
                    this.log.info(
                        "New status added to",
                        value.serverId,
                        `id: ${value.id}`
                    );
                    this.log.debug("detail:", JSON.stringify(value));
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
                    if (value === null)
                        reject(`No server with the id ${id} found`);
                })
                .then(() =>
                    this.prisma.status.deleteMany({ where: { serverId: id } })
                )
                .then((value) =>
                    this.prisma.server.delete({ where: { id: id } })
                )
                .then(() => {
                    this.log.info("Server deleted with all its relatives:", id);
                })
                .then(() => resolve())
                .catch((e) => {
                    this.log.warn("Unknown error occupied in delServer:", e);
                    reject(e);
                });
        });
    }
    public queryStatuses(serverId: number): Promise<Status[]> {
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
            this.prisma.server
                .findUnique({
                    where: { id: serverId },
                    include: {
                        statuses: true,
                    },
                })
                .then((value) => {
                    if (value) {
                        resolve(value.statuses[value.statuses.length - 1]);
                        this.log.info(
                            "Queried latest statuses for server",
                            serverId
                        );
                        this.log.debug("Detail:", JSON.stringify(value));
                    } else {
                        reject(`No server with the id ${serverId} found`);
                    }
                })
                .catch((e) => {
                    this.log.warn(
                        "Unknown error occupied in queryLatestStatus:",
                        e
                    );
                    reject(e);
                });
        });
    }
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
                    this.log.warn(
                        "Unknown error occupied in queryServersNoStatus:",
                        e
                    );
                    reject(e);
                });
        });
    }

    public queryServerToken(id: number): Promise<string> {
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
    constructor() {
        this.prisma = new PrismaClient();
        this.log = log4js.getLogger("database");
    }
}
