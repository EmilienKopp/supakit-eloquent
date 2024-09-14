import { singular, singularPascalToPluralSnake } from './strings';

import { Collection } from './Collection';
import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from './client';
import { parseTableDescription } from './parsers';
import { resolveOperator } from './resolvers';
import { vertical } from './arrays';

enum SerializationType {
    JOIN = 'JOIN',
    RAW = 'RAW',
    SPLIT = 'SPLIT',
}

export type PostgresSerializable = {
    column: string,
    data: string | string[],
    separator: string,
    type: SerializationType,
    final: string,
    serialized: () => string,
};

export type ModelOptions = {
    rpc?: string,
}

type DataFetchOptions = {
    asPlainObject?: boolean,
    orderBy?: string,
    direction?: 'asc' | 'desc',
    limit?: number,
    withTrashed?: boolean,
    distinct?: boolean,
    with?: Array<typeof Model>,
}

type WhereClause = {
    column: string,
    operator: string,
    value: any,
}

type DeleteOptions = {
    mode: 'soft' | 'hard',
}

export type DuplicateOption = {
    except?: string[],
    only?: string[],
}

export type Relationship = {
    relation: string | typeof Model,
    type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many',
    foreignKey?: string,
    references?: string,
    selectColumns?: string[],
    where?: WhereClause[],
    returnVerticalArray?: boolean,
}


type Caster<T> = (value: any) => T;
export type CastEntry<T> = [string, Caster<T>, ((value: T) => any) | Intl.DateTimeFormat | null];

export interface ModelInterface {
    attributes: () => Record<string, any>,
    define: () => void,
    refresh: () => Promise<any>,
    relate: () => Promise<any>,
    getConnection: () => any,
    set: (key: string, value: any) => void,
    save: (additionalData?: any) => Promise<any>,
    update: (data: any) => Promise<any>,
    duplicate: (option: DuplicateOption) => Promise<any>,
    resetHasMany: (relation: string, foreignIdColumn: string, distantId: string, data: any, options?: ModelOptions) => Promise<any>,
    delete: () => Promise<any>,
    whereHas: (relation: string, column: string, operator: string, value: any) => Promise<any>,
    getRelated: (intermediate: typeof Model, filters?: { column: string, operator: string, value: any }[]) => Promise<any>,
    getManyToMany: (relation: string, selectColumns?: string[]) => Promise<any>,
    with: (relation: typeof Model, foreignKey?: string) => Promise<any>,
    plain: () => Record<string, any>,
}

// interface StaticModelInterface {
//     new(): ModelInterface;
//     find: (id: string | number, raw?: boolean) => Promise<any>;
//     create: (data: any) => Promise<any>;
//     all: (options?: DataFetchOptions) => Promise<Collection<any>>;
//     but: (column: string, value: any) => Promise<Collection<any>>;
//     where: (column: string, postgresOperator: string, value: any, options?: DataFetchOptions) => Promise<Collection<any>>;
//     only: (column: string, value: any) => Promise<Collection<any>>;
//     select: (column: string) => Promise<any>;
//     edit: (id: string | number, data: any) => Promise<any>;
//     first: (column: string, whereColumn: string, whereValue: any) => Promise<any>;
//     collect: (arr: any[]) => Collection<any>;
//     make: (data: any) => Promise<any>;
//     from: (data: any) => Promise<any>;
// }

export class Model implements ModelInterface {

    [key: string]: any;


    private static _instance: Model;
    private static _connectorUrl: string;
    private static _connectorKey: string;
    private static _desribeFunctionName: string = 'describe_table';

    protected static _relations: Relationship[] = [];

    protected static _connector: any;
    protected static _table: string;
    protected static _idColumn: string | string[] = 'id';
    protected static _casts: CastEntry<any>[];
    protected static _useTimestamps: boolean = true;
    protected static _useSoftDelete: boolean = false;
    protected static _defaultSelectQuery: string = `*`;
    protected static _dbSchema: { [key: string]: { nullable: boolean, type: string, name: string } } | null = null;

    private _query: any = {};
    private _response: any;

    protected static async loadSchema() {
        if (this._dbSchema) return this._dbSchema;
        if (!this._desribeFunctionName) throw new Error('No describe function name provided');

        const { data, error } =
            await this.getConnection()
                .rpc(this._desribeFunctionName, { tablename: this._table })

        this._dbSchema = parseTableDescription(data);

        if (!this._dbSchema) console.error('Could not load schema. Make sure the provided describe function name is correct and exists on your supabase project.', error);

        for (const column in this._dbSchema) {
            if (column === 'id') {
                this._idColumn = 'id';
            } else {
                Object.defineProperty(this, column, {
                    value: null,
                    writable: true,
                    enumerable: true,
                    configurable: true
                });
            }
        }

        return this._dbSchema;
    }

    static init(options?: {client?: SupabaseClient, name?: string}) {
        if(!this._connector && options?.client) {
            this._connector = options.client;
        }
        if (!this._table) {
            this._table = singularPascalToPluralSnake(options?.name ?? this.name);
        }
        this.loadSchema();
    }

    constructor(rowData?: any, metadata?: any) {
        // No data provided - build from Schema
        // if (!rowData) {
        //     for (const column in (this.constructor as typeof Model)._dbSchema) {
        //         if (column === 'id') {
        //             this._idColumn = 'id';
        //         }
        //         Object.defineProperty(this, column, {
        //             value: null,
        //             writable: true,
        //             enumerable: true,
        //             configurable: true
        //         });
        //     }
        // }


        //Table Name initialization
        if (!(this.constructor as typeof Model)._table) {
            (this.constructor as typeof Model)._table = singularPascalToPluralSnake(this.constructor.name);
            console.log("Table name was inferred from model name. If this is not the desired table name, use Model.setTableName('table_name') to set it manually.");
            console.log("Table name: ", `${this.constructor.name} -> ${(this.constructor as typeof Model)._table}`);
        }
        this._table = (this.constructor as typeof Model)._table;

        this._idColumn = (this.constructor as typeof Model)._idColumn ?? 'id';
        const _casts = Object.getPrototypeOf(this).constructor._casts;
        this._connector = (this.constructor as typeof Model)._connector;

        // Build from rowData 
        if (rowData?.data) {
            for (const [key, value] of Object.entries(rowData.data)) {
                const castEntry = _casts?.find(([propName]: any) => propName === key);
                if (castEntry) {
                    const [, cast, format]: any = castEntry;
                    this[key] = format ? format(new cast(value)) : new cast(value);
                } else {
                    this[key] = value;
                }
            }
            const { count, error, status } = rowData;
            this._response = { count, error, status };
        }
        // Build from object
        else if (rowData) {
            for (const [key, value] of Object.entries(rowData)) {
                const castEntry = _casts?.find(([propName]: any) => propName === key);
                if (castEntry) {
                    const [, cast, format]: any = castEntry;
                    this[key] = format ? format(new cast(value)) : new cast(value);
                } else {
                    this[key] = value;
                }
                this._response = metadata;
            }
        }


        for (const [key, value] of Object.entries(this)) {
            if (typeof value != 'function' && !key.startsWith('_') && key != 'id') {

                Object.defineProperty(this, key, {
                    value: value,
                    writable: true,
                    enumerable: true,
                    configurable: true
                });

                if (!(this.constructor as typeof Model).prototype.hasOwnProperty('$' + key)) {
                    (this.constructor as typeof Model).prototype['$' + key] = async (arg: any): Promise<any | void> => {
                        if (arg) {
                            this[key] = arg;
                            await this.update({ [key]: arg });
                        } else {
                            await this.refresh();
                            return this[key];
                        }
                    }
                }

                if (!(this.constructor as typeof Model).prototype.hasOwnProperty('$$' + key)) {
                    (this.constructor as typeof Model).prototype['$$' + key] = (arg: any): any | void => {

                        if (arg) {
                            this[key] = arg;
                            this.update({ [key]: arg });
                        } else {
                            this.refresh();
                            return this[key];
                        }
                    }
                }
            }
        }
    }

    /**
     * Retrieves the actual attributes (columns) of the model (excluding relations and methods)
     * @returns {Record<string, any>} The attributes of the model
     */
    public attributes() {
        const _relations = Object.getPrototypeOf(this).constructor._relations;

        const entries = Object.entries(this).filter(([key, value]) => {
            if (!value) console.log(value ?? "");
            return !key.startsWith('_')
                && !key.startsWith('$')
                && !key.startsWith('fetch')
                && !key.startsWith('connector')
                // && !['created_at', 'updated_at'].includes(entry.key)
                && !_relations?.some((el: any) => el.relation == key)
        });

        const object = Object.fromEntries(entries);
        return object;
    }

    public define() {
        const _relations = Object.getPrototypeOf(this).constructor._relations;
        const _table = Object.getPrototypeOf(this).constructor._table;
        const _casts = Object.getPrototypeOf(this).constructor._casts;
        console.log('relations', _relations);
        console.log('table', _table);
        console.log('idColumn', this._idColumn);
        console.log('casts', _casts);
        console.log('connector', this.getConnection());
    }

    /**
     * Reload the data for that model instance
     * @returns {Promise<any>} The model instance
     */
    public async refresh() {
        await (this.constructor as typeof Model).loadSchema();
        const fresh = await this.getConnection().from(this._table).select().eq(this._idColumn, this[this._idColumn]);
        // Rebuild the object
        const _casts = Object.getPrototypeOf(this).constructor._casts;
        for (const [key, value] of Object.entries(fresh.data)) {
            const castEntry = _casts?.find(([propName]: any) => propName === key);
            if (castEntry) {
                const [, cast, format]: any = castEntry;
                this[key] = format ? format(new cast(value)) : new cast(value);
            } else {
                this[key] = value;
            }
        }
        return new Collection(fresh.data);
    }

    public async relate() {
        // Build relationships
        if (this._relations) {
            for (const relation of this._relations) {
                if (relation.type === 'many-to-many') {
                    let relationData = (await this.getManyToMany(relation.relation)).plain();
                    if (relation.returnVerticalArray) {
                        const key = relation?.select_columns?.at(0) ?? 'id';
                        relationData = vertical(relationData, key);
                    }
                    this[relation.relation] = relationData;
                }
            }
        }
        return this;
    }

    public static async getInstance(): Promise<Model> {
        await this.loadSchema();
        if (!this._instance) {
            this._instance = new this({});
        }
        return this._instance;
    }

    public connect() {
        console.log('Connecting to supabase')
        try {
            if ((this.constructor as typeof Model)._connector && (this.constructor as typeof Model)._connector instanceof SupabaseClient) {
                // this._connector = (this.constructor as typeof Model)._connector;
                Object.defineProperty(this, '_connector', {
                    value: (this.constructor as typeof Model)._connector,
                    writable: true,
                    enumerable: false,
                    configurable: false
                });
            } else if ((this.constructor as typeof Model)._connectorUrl && (this.constructor as typeof Model)._connectorKey) {
                this._connectorUrl = (this.constructor as typeof Model)._connectorUrl;
                this._connectorKey = (this.constructor as typeof Model)._connectorKey;
                // this._connector = getSupabaseClient(this._connectorUrl, this._connectorKey);
                Object.defineProperty(this, '_connector', {
                    value: getSupabaseClient(this._connectorUrl, this._connectorKey),
                    writable: true,
                    enumerable: false,
                    configurable: false
                });
            } else {
                throw new Error('Invalid connection parameters');
            }
        } catch (error) {
            console.error('Error connecting to supabase', error);
        }

        return this;
    }

    public getConnection() {
        if (!this._connector) this.connect();
        return (this.constructor as typeof Model)._connector;
    }

    public static getConnection() {
        if (!(this._connector)) {
            Object.defineProperty(this, '_connector', {
                value: getSupabaseClient(this._connectorUrl, this._connectorKey),
                writable: true,
                enumerable: false,
                configurable: false
            });
        }
        return this._connector;
    }

    public static setConnection(
        connectionParams: { client?: SupabaseClient, supabaseUrl?: string, supabaseKey?: string }
    ): void {
        if (connectionParams.client) {
            Object.defineProperty(this, '_connector', {
                value: connectionParams.client,
                writable: true,
                enumerable: false,
                configurable: false
            });
        } else if (connectionParams.supabaseUrl && connectionParams.supabaseKey) {
            this._connectorUrl = connectionParams.supabaseUrl;
            this._connectorKey = connectionParams.supabaseKey;
            Object.defineProperty(this, '_connector', {
                value: getSupabaseClient(this._connectorUrl, this._connectorKey),
                writable: true,
                enumerable: false,
                configurable: false
            });
        } else {
            throw new Error('Invalid connection parameters');
        }

        if (!this._table) {
            this._table = singularPascalToPluralSnake((this.name));
            if (this._table) this.loadSchema();
        }
    }

    public static setTableName(name: string): void {
        this._table = name;
    }

    public static getTableName(): string {
        return this._table;
    }

    public static getIdColumn(): string | string[] {
        return this._idColumn;
    }

    public static async retrieveSchema(desribeFunctionName: string): Promise<any> {
        this._desribeFunctionName = desribeFunctionName;
        await this.loadSchema();
        return this._dbSchema;
    }

    public static async getSchema(): Promise<any> {
        if (!this._dbSchema) this._dbSchema = await this.loadSchema();
        return this._dbSchema;
    }

    public set(key: string, value: any): void {
        this[key] = value;
    }

    public log(): void {
        console.log(this.attributes());
    }

    public static disableSoftDeletes(): void {
        this._useSoftDelete = false;
    }

    public response(data: any) {
        if (data) {
            this._response = data;
        }
        return this._response;
    }


    public async get() {
        this._response = await this._query;
        this._isExecuted = true;
        return new Collection(this._response.data);
    }

    public static setSelectQuery(query: string): void {
        this._defaultSelectQuery = query;
    }

    public async save(additionalData?: any): Promise<any> {
        await (this.constructor as typeof Model).loadSchema();
        const attributes = this.attributes();
        const insertionData = { ...attributes, ...additionalData };
        const { data, error, status } = await this.getConnection()
            .from(this._table)
            .insert(insertionData)
            .select().single();
        return (this.constructor as typeof Model).make(data, { data, error, status })
    }

    // public async overwrite(key: string, value: any): Promise<any> {
    //     this[key] = value;
    //     return await this.getConnection().from(current._table).update({ [key]: value }).eq(current._idColumn, this.id);
    // }

    public async update(data: any): Promise<any> {
        await (this.constructor as typeof Model).loadSchema();
        const entries = Object.entries(data)
        for (const [key, value] of entries) {
            this[key] = value;
            if (this._useTimestamps && 'updated_at'! in data) {
                data.updated_at = new Date();
            }
        }

        const query = this.getConnection().from(this._table).update(data);
        if (this._useSoftDelete) {
            query.is(`deleted_at`, null);
        }
        if (this._idColumn instanceof Array) {
            for (const key of this._idColumn) {
                query.eq(key, this[key]);
            }
        } else {
            query.eq(this._idColumn, this[this._idColumn]);
        }
        const result = await query.select();
        if (result.error) {
            console.error('Error updating', result.error);
        }
        return this;
    }

    public async duplicate(options?: DuplicateOption): Promise<any> {
        await (this.constructor as typeof Model).loadSchema();
        let { id, ...attributes } = this.attributes();

        if (options) {
            attributes = Object.fromEntries(Object.entries(attributes).filter(([key]) => {
                if (options.except) {
                    return !options.except.includes(key);
                } else if (options.only) {
                    return options.only.includes(key);
                } else {
                    return true;
                }
            }));
        }

        if (this._useTimestamps) {
            if ('created_at' in attributes) attributes.created_at = new Date();
            if ('updated_at' in attributes) attributes.updated_at = new Date();
        }
        const response = await this.getConnection().from(this._table).insert(attributes).select().maybeSingle();
        return (this.constructor as typeof Model).make(response.data, response);
    }

    public static async duplicate(id: string | number | { [key: string]: string | number }, options?: DuplicateOption): Promise<any> {
        await this.loadSchema();
        const instance = await this.find(id);
        return await instance.duplicate(options);
    }


    public static async delete(id: string | number | { [key: string]: string | number }): Promise<any> {
        await this.loadSchema();
        if (this._idColumn instanceof Array && typeof id != 'object') {
            throw new Error('Cannot delete multiple columns with a single id');
        } else if (typeof id == 'object' && !(this._idColumn instanceof Array)) {
            throw new Error('Cannot delete a single column with multiple ids');
        }
        let query = this.getConnection().from(this._table)

        if (this._useSoftDelete) {
            query = query.update({ deleted_at: new Date() })
        } else {
            query = query.delete()
        }

        if (this._idColumn instanceof Array) {
            for (const key of this._idColumn) {
                query.eq(key, typeof id == 'object' ? id[key] : id);
            }
        } else {
            query.eq(this._idColumn, id);
        }

        const response = await query.select();
        return this.make(response.data, response);
    }

    public async resetHasMany(relation: string, foreignIdColumn: string,
        distantId: string, data: any, options?: ModelOptions): Promise<any> {

        await (this.constructor as typeof Model).loadSchema();
        data = data?.map((item: any) => ({
            [distantId]: item,
            [foreignIdColumn]: this[this._idColumn]
        }));

        let response;
        if (options?.rpc) {
            response = await this.getConnection().rpc(options.rpc, { data });
        } else {
            // Upsert the data
            response = await this.getConnection().from(relation).upsert(data).select();
        }

        // Delete the data that is not in the new data
        if (response?.data?.length) {
            const insertedDistantIds = vertical(response.data, distantId, { serialize_postgres: true });
            const existing = await this.getConnection().from(relation).select(distantId).eq(foreignIdColumn, this[this._idColumn]);

            // Traverse existing data and delete if not in insertedDistantIds
            const toDelete = existing?.data?.filter((item: any) => !insertedDistantIds.includes(item[distantId]));
            if (toDelete && (toDelete.length ?? 0 > 0)) {
                await this.getConnection().from(relation).delete().in(distantId, toDelete.map((item: any) => item[distantId]));
            }
        }
        return this;
    }

    public async delete(options?: DeleteOptions): Promise<any> {
        await (this.constructor as typeof Model).loadSchema();
        let query = this.getConnection().from(this._table);
        if ((this.constructor as typeof Model)._useSoftDelete || options?.mode === 'soft') {
            query = query.update({ deleted_at: new Date() })
        } else {
            query = query.delete()
        }

        if (this._idColumn instanceof Array) {
            for (const key of this._idColumn) {
                query.eq(key, this[key]);
            }
        } else {
            query.eq(this._idColumn, this[this._idColumn]);
        }
        const response = await query.select();
        return (this.constructor as typeof Model).make(response.data, response);
    }

    public static async create(data: any): Promise<any> {
        await this.loadSchema();
        if (this._useTimestamps) {
            data.created_at = new Date();
            data.updated_at = new Date();
        }
        const response = await (this.getConnection()).from(this._table).insert(data).select().single();
        const instance = this.make(response.data, response);
        return instance;
    }

    public static async find(id: string | number | { [key: string]: string | number }): Promise<any> {
        await this.loadSchema();
        const { data, error, status } = await this.getConnection().from(this._table).select(this._defaultSelectQuery).eq(this._idColumn, id).single();
        const instance = this.make(data, { data, error, status });
        return instance;
    }

    public static async all(options?: DataFetchOptions): Promise<Collection<any>> {
        await this.loadSchema();
        let selectQuery = this._defaultSelectQuery;

        if (options?.with) {
            const relations = options.with.map((r: typeof Model) => {
                const relation = this._relations.find((rel: Relationship) => rel.relation === r.name);
                if (relation) {
                    return `${relation.relation}(${relation.selectColumns?.join(',')})`;
                } else {
                    return r.name;
                }
            })
            selectQuery = selectQuery + `, ${relations.join(',')}`;
        }

        console.log(selectQuery);

        const query = this._connector.from(this._table).select(this._defaultSelectQuery);
        if ((!this._useSoftDelete && this.constructor.hasOwnProperty('deleted_at'))
            || (this._useSoftDelete && !options?.withTrashed)) {
            query.is(`deleted_at`, null);
        }
        const { data, count, error, status } = await query;

        const returnObject = options?.asPlainObject ? data : new Collection(data);
        if (returnObject instanceof Collection) {
            returnObject.response = { count, error, status };
        }
        return returnObject;
    }


    public static async but(column: string, value: any, options?: DataFetchOptions) {
        await this.loadSchema();

        const query = this.getConnection().from(this._table).select().neq(column, value);
        if (options?.withTrashed && this._useSoftDelete) {
            query.is(`deleted_at`, null);
        }
        const { count, data, error, status } = await query;
        const returnObject = options?.asPlainObject ? data : new Collection(data);
        if (returnObject instanceof Collection) {
            returnObject.response = { count, error, status };
        }
        return returnObject;
    }

    // public static async where(column: string, postgresOperator: string, value: any, options?: DataFetchOptions): Promise<Collection<any>> {
    //     await this.loadSchema();
    //     const query = this.getConnection().from(this._table).select(this._defaultSelectQuery).filter(column, postgresOperator, value);
    //     if (options?.orderBy) {
    //         query.order(options.orderBy, { ascending: options.direction === 'asc' });
    //     }
    //     if (options?.limit) {
    //         query.limit(options.limit);
    //     }
    //     if (options?.withTrashed && this._useSoftDelete) {
    //         query.is(`deleted_at`, null);
    //     }
    //     const { data, error, status } = await query;
    //     const collection = new Collection(data);
    //     collection.response = { error, status };
    //     return (new Collection(data));
    // }

    public static async only(column: string, value: any): Promise<Collection<any>> {
        await this.loadSchema();
        const query = this.getConnection().from(this._table).select(this._defaultSelectQuery).eq(column, value);
        if (this._useSoftDelete) {
            query.is(`deleted_at`, null);
        }
        const { data, error, status } = await query;
        const collection = new Collection(data);
        collection.response = { error, status };
        return (new Collection(data));
    }

    public static async select(column: string, options?: DataFetchOptions) {
        await this.loadSchema();
        const query = await this.getConnection().from(this._table).select(column);
        if (this._useSoftDelete && !options?.withTrashed) {
            query.is(`deleted_at`, null);
        }
        const { data, error, status } = await query;
        const collection = new Collection(data);
        collection.response = { error, status };
        return (new Collection(data));
    }

    public static async update(id: string | number, data: any): Promise<any> {
        await this.loadSchema();
        const response = await this._connector.from(this._table).update(data).eq(this._idColumn, id).select().single();
        return this.make(response.data, response);
    }

    // public static async first(column: string, whereColumn: string, whereValue: any): Promise<any> {
    //     const record = await this.getConnection().from(this._table).select(column).eq(whereColumn, whereValue).limit(1).single();
    //     return record.data[column];
    // }

    public static async first(conditions: { column: string, value: any, operator?: string }[]): Promise<Model> {
        await this.loadSchema();
        const results = await this.where(conditions);
        return results.first();
    }

    public static async where(conditions: { column: string, value: any, operator?: string }[], options?: DataFetchOptions): Promise<Collection<Model>> {
        await this.loadSchema();
        const query = this.getConnection().from(this._table).select(this._defaultSelectQuery);

        for (const condition of conditions) {
            if (condition.operator) {
                const operator = resolveOperator(condition.operator);
                operator.negated ? query.not(condition.column, operator.operator, condition.value) : query.filter(condition.column, operator.operator, condition.value);
            } else {
                query.eq(condition.column, condition.value);
            }
        }

        if (options?.orderBy) {
            query.order(options.orderBy, { ascending: options.direction === 'asc' });
        }
        if (options?.limit) {
            query.limit(options.limit);
        }
        if (options?.withTrashed && this._useSoftDelete) {
            query.is(`deleted_at`, null);
        }
        const { data, error, status } = await query;
        const collection = new Collection(data);
        collection.response = { error, status };
        return collection;
    }

    public static collect(arr: any[]): Collection<any> {
        return new Collection(arr.map((item: any) => new this(item)));
    }

    public plain() {
        return structuredClone(this.attributes());
    }

    public static async make(data: any, response?: { data: any, error: any, status: number }) {
        await this.loadSchema();
        const newInstance = await (new this(data)).relate();
        if (response) {
            newInstance.response(response);
        }
        return newInstance;
    }

    public static async from(data: any) {
        await this.loadSchema();
        return await (new this(data)).relate();
    }

    /**
     * Relationships
     */


    public async whereHas(relation: string, column: string, operator: string, value: any): Promise<any> {
        const current = this.constructor as typeof Model;
        await current.loadSchema();
        const relationship = this._relations.find((item: any) => item.relation === relation);
        const { data, count, error, status } = await this._connector.from(relationship?.relation)
            .select().eq(relationship?.foreign_column, this[this._idColumn])
            .filter(column, operator, value);
        const modeledData = data ? data?.map((item: any) => new current(item, { count, error, status })) : [];
        return new Collection(modeledData);
    }

    public async getRelated(related: typeof Model, filters?: { column: string, operator: string, value: any }[]): Promise<any> {
        const constructorObject = this.constructor as typeof Model;
        await constructorObject.loadSchema();

        const currentModelName = constructorObject.name.toLowerCase();
        const query = constructorObject.getConnection().from(related._table)
            .select(`*, ${currentModelName}: ${constructorObject._table} ( * )`)
            .eq([currentModelName + '_id'], this.id)

        if (filters) {
            for (const filter of filters) {
                query.filter(filter.column, filter.operator, filter.value);
            }
        }

        const { data, count, error, status } = await query;
        console.log(data, error);
        const modeledData = data ? data?.map((item: any) => new constructorObject(item, { count, error, status })) : [];
        return new Collection(modeledData);
    }

    public async getManyToMany(relation: string, selectColumns: string[] = [this._defaultSelectQuery]): Promise<any> {
        const constructorObject = this.constructor as typeof Model;
        await constructorObject.loadSchema();
        const relationship = this._relations.find((item: any) => item.relation === relation);
        const selectColumnsAsString = relationship.select_columns ? relationship.select_columns.join(', ') : selectColumns.join(', ');
        const query = this.getConnection().from(relationship.relation)
            .select(selectColumnsAsString)
            .eq(relationship.foreign_column, this[this._idColumn]);
        if (relationship.where) {
            for (const clause of relationship.where) {
                const operator = resolveOperator(clause.operator);
                operator.negated ? query.not(clause.column, operator.operator, clause.value) : query.filter(clause.column, operator.operator, clause.value);
            }
        }
        const { data, count, error, status } = await query;
        const collection = new Collection(data);
        collection.response = { count, error, status };
        return collection;
    }

    // const friendships =  async() => (await supabase.from('friendships')
    //                                                     .select('*, profile:profiles(*)')
    //                                                     .eq('profile_id', user.id)).data;

    public async with(relation: typeof Model, foreignKey?: string): Promise<any> {
        const constructorObject = this.constructor as typeof Model;
        await constructorObject.loadSchema();

        const relationName = relation.name.toLowerCase();
        const foreignIdColumn = foreignKey
            ?? this._relations?.find((r: Relationship) => r.relation === relationName)?.foreign_column
            ?? singular(relation._table) + '_id';
        console.log(relationName, foreignIdColumn);
        this[relationName] = await relation.find(this[foreignIdColumn]);
        return this;
    }

}

