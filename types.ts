/* *********************************
 *      UOF-STATUS.TYPES.TS        *
 * (c) 2023 THE UNIVERSITY OF FOOL *
 *   -licensed under MIT license-  *
 **********************************/

export type ServerInfo = {
    id: number;
    token: string;
};

export type LogLevel =
    | "all"
    | "debug"
    | "info"
    | "warn"
    | "error"
    | "fatal"
    | "off";
export type LogConfig = {
    level: LogLevel;
    console: boolean;
    file: boolean;
    filename: string;
};

export type Configuration = {
    Service: {
        listen: string;
        port: number;
    };
    Api: {
        global_token: string;
    };
    Logging: {
        Db: LogConfig;
        Api: LogConfig;
        App: LogConfig;
        Timer: LogConfig;
    };
    Timer: {
        interval: number;
        max_seconds: number;
    };
};
