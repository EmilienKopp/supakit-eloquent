import { Model } from "./Model";

export const createModel = (className: string) => {
  return class extends Model {
    constructor(...args: any[]) {
      super(...args);
    }

    static {
        this.initTableName(className);
    }
  }
};