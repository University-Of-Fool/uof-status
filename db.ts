/***********************************
 *        UOF-STATUS.DB.TS         *
 * (c) 2023 THE UNIVERSITY OF FOOL *
 *   -licensed under MIT license-  *
 **********************************/
import sqlite3, { Database } from 'sqlite';
import { open } from 'sqlite';
import { Md5 } from 'ts-md5';
import { resolve } from 'path';

import { Status, Server } from './types';


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
    constructor(filename: string, initial?: boolean) {
    }
}