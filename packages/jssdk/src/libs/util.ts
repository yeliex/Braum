import { resolve } from 'path';
import { accessSync, PathLike, readFileSync } from 'fs';

export namespace fs {
  export const existSync = (path: PathLike, mode?: number) => {
    try {
      accessSync(path, mode);
      return true;
    } catch (e) {
      return false;
    }
  };
}

export namespace is {
  export const string = (str: any) => {
    return typeof str === 'string' && str !== '';
  };

  export const object = (obj: any) => {
    return typeof obj === 'object' && !Array.isArray(obj) && obj !== null && !is.error(obj);
  };

  export const error = (err: any) => {
    return err instanceof Error;
  };

  export const instance = (ins: any, con: string) => {
    return ins.constructor && ins.constructor.name === con;
  };

  export const container = () => {
    const filePaths = {
      initFile: resolve('/.dockerinit'),
      envFile: resolve('/.dockerenv'),
      cgroup: resolve('/proc/1/cgroup'),
    };

    let isContainer = fs.existSync(filePaths.initFile) || fs.existSync(filePaths.envFile);

    if (!isContainer && fs.existSync(filePaths.cgroup)) {
      isContainer = (readFileSync(filePaths.cgroup, 'utf8') || '').includes('docker');
    }

    return isContainer;
  };
}
