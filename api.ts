/***********************************
 *       UOF-STATUS.API.TS         *
 * (c) 2023 THE UNIVERSITY OF FOOL *
 *   -licensed under MIT license-  *
 **********************************/
import { Md5 } from "ts-md5";
import uofStatusDatabase from "./db"
import { ServerInfo } from "./types";


export default class uofStatusApi {
    putServer(db: uofStatusDatabase, body: any): Promise<ServerInfo> {
        return new Promise((resolve, reject) => {
            db.newServer(body.name, body.description || "Server").then(value => {
                resolve(value);
            }).catch(e => (reject(e)))
        })
    }

    putStatus(db: uofStatusDatabase, body: any): Promise<void> {
        return new Promise((resolve, reject) => {
            db.queryServerToken(body.serverId).then(token => {
                if (Md5.hashStr(body.token) != token) {
                    throw new Error("Wrong token");
                }
            }).then(() => db.newStatus(body.serverId, body.online))
            .then(() => {
                resolve();
            }).catch(e => {
                reject(e);
            });
        })
    }

    async delServer(db:uofStatusDatabase, body:any){
        if(body.serverId){
            await db.delServer(body.serverId);
        }else{
            throw new Error("serverId not defined");
        }
        return;
    }

    constructor() {
    }
}