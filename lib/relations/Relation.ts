import { ModelInterface } from "../Model";

export class Relation {
    protected query: any;
    protected parent: any;
    protected related: ModelInterface;

    constructor(query: any, parent: any, related: ModelInterface) {
        this.query = query;
        this.parent = parent;
        this.related = related;
    }
}