/***********************************
 *      UOF-STATUS.TYPES.TS        *
 * (c) 2023 THE UNIVERSITY OF FOOL *
 *   -licensed under MIT license-  *
 **********************************/
export type Status={
    id:number,
    status:boolean,
    timestamp:string
}
export type Server={
    serverName:string,
    latestId:number,
    token:string,
    statuses:Status[]
}