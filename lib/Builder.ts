
export class QueryBuilder {

    private _table: string;
    private _columns: string[];
    private _where: string;
    private _orderBy: string;
    private _limit: number;
    private _offset: number;

    constructor(table: string) {
        this._table = table;
    }

    public select(columns: string[]) {
        this._columns = columns;
        return this;
    }

    public where(where: string) {
        this._where = where;
        return this;
    }

    public orderBy(orderBy: string) {
        this._orderBy = orderBy;
        return this;
    }

    public limit(limit: number) {
        this._limit = limit;
        return this;
    }

    public offset(offset: number) {
        this._offset = offset;
        return this;
    }

    public async get() {
        let query = `SELECT ${this._columns.join(', ')} FROM ${this._table}`;
        if (this._where) query += ` WHERE ${this._where}`;
        if (this._orderBy) query += ` ORDER BY ${this._orderBy}`;
        if (this._limit) query += ` LIMIT ${this._limit}`;
        if (this._offset) query += ` OFFSET ${this._offset}`;

        console.log(query);
        return await this.execute(query);
    }

    private async execute(query: string) {
        const { data, error } = await import.meta.env.VITE_SUPABASE_CLIENT.from(this._table).select(query);
        if (error) throw error;
        return data;
    }

    
}