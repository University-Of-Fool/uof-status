/***********************************
 *        UOF-STATUS.DB.TS         *
 * (c) 2023 THE UNIVERSITY OF FOOL *
 *   -licensed under MIT license-  *
 **********************************/
import { Md5 } from 'ts-md5';
import { PrismaClient, Server, Status } from '@prisma/client'

import { ServerInfo } from './types';


function makeString(): string {
    // To generate tokens
    // From https://stackoverflow.com/questions/54076988/create-random-string-in-typescript
    let outString: string = '';
    let inOptions: string = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 16; i++) {
        outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
    }

    return outString;
}

export default class uofStatusDatabase {
    private prisma: PrismaClient;
    public newServer(name: string, description?: string): Promise<ServerInfo> {
        return new Promise((resolve, reject) => {
            var token = makeString();
            this.prisma.server.create({
                data: {
                    name: name,
                    token: Md5.hashStr(token),
                    description: description || "Server"
                }
            }).then(value => {
                resolve({ token: token, id: value.id });
            }).catch(e => {
                reject(e);
            });
        });
    }
    public newStatus(serverId: number, online: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            this.prisma.server.findUnique({
                where: {
                    id: serverId
                }
            }).then(value => {
                if (!value) reject(`A server with the id ${serverId} does not exist`);
            }).then(() => this.prisma.status.create({
                data: {
                    serverId: serverId,
                    status: online
                }
            })
            ).then((value) => {
                resolve();
            }).catch(e => {
                reject(e);
            });
        });
    }
    public delServer(id: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.prisma.status.deleteMany({ where: { serverId: id } })
                .then(value => this.prisma.server.delete({ where: { id: id } })                )
                .then(() => resolve());
        });
    }
    public queryStatuses(serverId: number): Promise<Status[]> {
        return new Promise((resolve, reject) => {
            this.prisma.server.findUnique({
                where: { id: serverId },
                include: {
                    statuses: true
                }
            }).then(value => {
                if (value) {
                    resolve(value?.statuses);
                } else {
                    reject(`No server found with the id ${serverId}`);
                }
            }).catch(e => {
                reject(e);
            });
        });
    }
    public queryLatestStatus(serverId: number): Promise<Status> {
        return new Promise((resolve, reject) => {
            this.prisma.server.findUnique({
                where: { id: serverId },
                include: {
                    statuses: true
                }
            }).then(value => {
                if (value) {
                    resolve(value.statuses[value.statuses.length - 1])
                } else {
                    reject(`No server found with the id ${serverId}`);
                }
            }).catch(e => {
                reject(e);
            });
        })
    }
    public queryServers(): Promise<(Server & { statuses: Status[] })[]> {
        return new Promise((resolve, reject) => {
            this.prisma.server.findMany({
                include: {
                    statuses: true
                }
            }).then(value => {
                resolve(value);
            }).catch(e => {
                reject(e);
            });
        });
    }
    public queryServerToken(id: number): Promise<string> {
        return new Promise((resolve, reject) => {
            this.prisma.server.findUnique({
                where: { id: id },
                include: {
                    statuses: false
                }
            }).then(value => {
                if (value) {
                    resolve(value.token);
                } else {
                    reject(`No server with the id ${id} found.`);
                }
            });
        });
    }
    constructor() {
        this.prisma = new PrismaClient();
    }
}