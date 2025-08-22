export interface LogData {
  [key: string]: unknown;
}

export const logger = {
  info: (msg: string, data: LogData = {}): void => {
    console.log(JSON.stringify({ level: "info", msg, ...data }));
  }
};
