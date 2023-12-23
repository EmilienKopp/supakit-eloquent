# Project Name

A brief description of the project.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Model Class](#model-class)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Installation

Instructions on how to install and set up the project.

## Usage

Instructions on how to use the project and any relevant examples.

### Model Class

The `Model` class is a core component of this project. It provides an abstraction for interacting with supabase. To use the `Model` class, follow these steps:

1. Create a class that extends the `Model` class.
The `User` class will inherit all the methods of the `Model` class. 
The table name will be automatically inferred from the class name if the class name is in `PascalCase`.

```typescript
import { Model } from 'supakit-eloquent';

export class User extends Model {
    // the table name will be inferred as "users"
}

export class UserProfile extends Model {
    // the table name will be inferred as "user_profiles"
}

export class BusinessPerson extends Model {
    // the table name will be inferred as "business_people"
}
```

2. Define the table name and the id column of the model, if they are different from the default values.
The table's id column will be inferred as `id` if not specified.
```typescript
import { Model } from 'supakit-eloquent';

// Simple primary key
export class User extends Model {
    protected static _table = 'app_users';
    protected static _idColumn = 'user_id';
}

// Composite primary key
export class BookmarkedPost extends Model {
    protected static _table = 'bookmarked_posts';
    protected static _idColumn = ['user_id', 'post_id'];
}
```


## Contributing

Guidelines for contributing to the project and how to submit pull requests.

## License

Information about the project's license and any additional terms or conditions.

## Contact

How to get in touch with the project maintainer or team.


```import * as pluralize from 'pluralize';

import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { singularPascalToPluralSnake, toSnakeCase } from './strings';

import { Collection } from './Collection';
import { getSupabaseClient } from './client';
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
}

type WhereClause = {
    column: string,
    operator: string,
    value: any,
}

type DeleteOptions = {
    mode: 'soft' | 'hard',
}

export type Relationship = {
    relation: string,
    type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many',
    foreign_column?: string,
    local_column?: string,
    select_columns?: string[],
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
    store: (additionalData?: any) => Promise<any>,
    update: (data: any) => Promise<any>,
    persist: () => Promise<any>,
    duplicate: () => Promise<any>,
    resetHasMany: (relation: string, foreignIdColumn: string, distantId: string, data: any, options?: ModelOptions) => Promise<any>,
    delete: () => Promise<any>,
    whereHas: (relation: string, column: string, operator: string, value: any) => Promise<any>,
    getRelated: (intermediate: typeof Model, column: string, operator: string, value: any) => Promise<any>,
    getManyToMany: (relation: string, selectColumns?: string[]) => Promise<any>,
    with: (relation: string) => Promise<any>,
    plain: () => Record<string, any>,
}

interface StaticModelInterface {
    new(): ModelInterface;
    find: (id: string | number, raw?: boolean) => Promise<any>;
    create: (data: any) => Promise<any>;
    all: (options?: DataFetchOptions) => Promise<Collection<any>>;
    but: (column: string, value: any) => Promise<Collection<any>>;
    where: (column: string, postgresOperator: string, value: any, options?: DataFetchOptions) => Promise<Collection<any>>;
    only: (column: string, value: any) => Promise<Collection<any>>;
    select: (column: string) => Promise<any>;
    edit: (id: string | number, data: any) => Promise<any>;
    first: (column: string, whereColumn: string, whereValue: any) => Promise<any>;
    collect: (arr: any[]) => Collection<any>;
    make: (data: any) => Promise<any>;
    from: (data: any) => Promise<any>;
}

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
    protected static _dbSchema: any = null;

    private _query: any = {};
    private _isExecuted: boolean = false;
    private _response: any;

    protected static async loadSchema() {
        if (this._dbSchema) return this._dbSchema;
        if (!this._desribeFunctionName) throw new Error('No describe function name provided');

        const { data, error } =
            await this.getConnection()
                .rpc(this._desribeFunctionName, { tablename: this._table })

        this._dbSchema = data;

        if (!this._dbSchema) console.error('Could not load schema. Make sure the provided describe function name is correct and exists on your supabase project.');

        for (const column of this._dbSchema) {
            if (column.name === 'id') {
                this._idColumn = 'id';
            } else {
                this[column.column_name] = null;
            }
        }

        return this._dbSchema;
    }

    // protected _serializable: PostgresSerializable = {
    //     column: '',
    //     data: '',
    //     separator: ',',
    //     final: '',
    //     type: SerializationType.RAW,
    //     serialized: () => {
    //         switch(this._serializable.type) {
    //             case SerializationType.JOIN:
    //                 return '(' + this.data.join(this._serializable.separator) + ')';
    //             case SerializationType.SPLIT:
    //             case SerializationType.RAW:
    //             default:
    //                 return '(' + this.data + ')'
    //         }
    //     },
    // };


    constructor(rowData: any, metadata?: any) {
        //Table Name initialization
        if (!this._table) {
            this._table = (this.constructor as typeof Model)._table;
        } else {
            this._table = singularPascalToPluralSnake(this.constructor.name);
        }

        this._idColumn = (this.constructor as typeof Model)._idColumn ?? 'id';
        const _casts = Object.getPrototypeOf(this).constructor._casts;

        // Build from rowData 
        if (rowData?.data) {
            for (const [key, value] of Object.entries(rowData.data)) {
                const castEntry = _casts?.find(([propName]: any) => propName === key);
                if (castEntry) {
                    console.log('castEntry', castEntry);
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

        const entries = Object.entries(this).filter(([key, value]) =>
            !key.startsWith('_')
            && !key.startsWith('$')
            && !key.startsWith('fetch')
            && !key.startsWith('connector')
            // && !['created_at', 'updated_at'].includes(key)
            && !_relations?.some((el: any) => el.relation == key));
        const object = Object.fromEntries(entries);
        return object;
    }

    public define() {
        const _relations = Object.getPrototypeOf(this).constructor._relations;
        const _table = Object.getPrototypeOf(this).constructor._table;
        const _idColumn = Object.getPrototypeOf(this).constructor._idColumn;
        const _casts = Object.getPrototypeOf(this).constructor._casts;
        const _connector = (this.constructor as typeof Model)._connector;
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
        this._connector = getSupabaseClient(this._connectorUrl, this._connectorKey);
        return this;
    }

    public getConnection() {
        if (!this._connector) this.connect();
        return (this.constructor as typeof Model)._connector;
    }

    public static getConnection() {
        if (!(this._connector)) this._connector = getSupabaseClient(this._connectorUrl, this._connectorKey);
        return this._connector;
    }

    public static setConnection(
        connectionParams: { client?: SupabaseClient, supabaseUrl?: string, supabaseKey?: string }
    ): void {
        if (connectionParams.client) {
            this._connector = connectionParams.client;
        } else if (connectionParams.supabaseUrl && connectionParams.supabaseKey) {
            this._connectorUrl = connectionParams.supabaseUrl;
            this._connectorKey = connectionParams.supabaseKey;
            this._connector = getSupabaseClient(this._connectorUrl, this._connectorKey);
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

    public async store(additionalData?: any): Promise<any> {
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

    public async duplicate(): Promise<any> {
        await (this.constructor as typeof Model).loadSchema();
        const { id, ...attributes } = this.attributes();
        if (this._useTimestamps) {
            if ('created_at' in attributes) attributes.created_at = new Date();
            if ('updated_at' in attributes) attributes.updated_at = new Date();
        }
        const response = await this.getConnection().from(this._table).insert(attributes).select().maybeSingle();
        return (this.constructor as typeof Model).make(response.data, response);
    }

    public static async delete(id: string | number): Promise<any> {
        await this.loadSchema();
        if (this._useSoftDelete) {
            return this.getConnection().from(this._table).update({ deleted_at: new Date() }).eq(this._idColumn, id).select();
        }
        const response = await this.getConnection().from(this._table).delete().eq(this._idColumn, id).select();
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
                const deleted = await this.getConnection().from(relation).delete().in(distantId, toDelete.map((item: any) => item[distantId]));
            }
        }
        return this;
    }

    public async delete(options?: DeleteOptions): Promise<any> {
        await (this.constructor as typeof Model).loadSchema();
        if ((this.constructor as typeof Model)._useSoftDelete || options?.mode === 'soft') {
            return await this.getConnection().from(this._table).update({ deleted_at: new Date() }).eq(this._idColumn, this.id);
        }
        const response = await this.getConnection().from(this._table).delete().eq(this._idColumn, this.id);
        return (this.constructor as typeof Model).make(response.data, response);
    }

    public static async create(data: any): Promise<any> {
        await this.loadSchema();
        if (this._useTimestamps) {
            data.created_at = new Date();
            data.updated_at = new Date();
        }
        const response = await (this.getConnection()).from(this._table).insert(data).select().single();

        const object = new this(response);
        object._response = response;
        return object;
    }

    public static async find(id: string | number, raw: boolean = false): Promise<any> {
        await this.loadSchema();
        const { data, error, status } = await this.getConnection().from(this._table).select(this._defaultSelectQuery).eq(this._idColumn, id).single(); 
        const instance = this.make(data, { data, error, status  });
        return instance;
    }

    public static async all(options?: DataFetchOptions): Promise<Collection<any>> {
        await this.loadSchema();
        const query = this._connector.from(this._table).select(this._defaultSelectQuery);
        if ((!this._useSoftDelete && this.constructor.hasOwnProperty('deleted_at'))
            || (this._useSoftDelete && !options?.withTrashed)) {
            query.is(`deleted_at`, null);
        }
        const { data, count, error, status } = await query;

        const returnObject = options?.asPlainObject ? data : new Collection(data);
        if(returnObject instanceof Collection) {
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
        if(returnObject instanceof Collection) {
            returnObject.response = { count, error, status };
        }
        return returnObject;
    }

    public static async where(column: string, postgresOperator: string, value: any, options?: DataFetchOptions): Promise<Collection<any>> {
        await this.loadSchema();
        const query = this.getConnection().from(this._table).select(this._defaultSelectQuery).filter(column, postgresOperator, value);
        if (options?.orderBy) {
            query.order(options.orderBy, { ascending: options.direction === 'asc' });
        }
        if (options?.limit) {
            query.limit(options.limit);
        }
        if (options?.withTrashed && this._useSoftDelete) {
            query.is(`deleted_at`, null);
        }
        const { count, error, status, data } = await query;
        return new Collection(data);
    }

    public static async only(column: string, value: any): Promise<Collection<any>> {
        await this.loadSchema();
        const query = this.getConnection().from(this._table).select(this._defaultSelectQuery).eq(column, value);
        if (this._useSoftDelete) {
            query.is(`deleted_at`, null);
        }
        const { count, error, status, data } = await query;
        return new Collection(data);
    }

    public static async select(column: string, options?: DataFetchOptions) {
        await this.loadSchema();
        const query = await this.getConnection().from(this._table).select(column);
        if (this._useSoftDelete && !options?.withTrashed) {
            query.is(`deleted_at`, null);
        }
        const { data, error } = await query;
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

    public static async first(conditions: { column: string, whereColumn: string, whereValue: any }[]) {
        await this.loadSchema();
        const query = this.getConnection().from(this._table).select(this._defaultSelectQuery);
        for (const condition of conditions) {
            query.eq(condition.whereColumn, condition.whereValue);
        }
        const { data, error } = await query.limit(1).single();
        return new this(data);
    }

    public static async whereAll(conditions: { column?: string, whereColumn: string, whereValue: any }[]) {
        await this.loadSchema();
        const query = this.getConnection().from(this._table).select(this._defaultSelectQuery);
        for (const condition of conditions) {
            query.eq(condition.whereColumn, condition.whereValue);
        }
        const { data, error } = await query;
        return new Collection(data);
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

    public async getRelated(intermediate: typeof Model, column: string, operator: string, value: any): Promise<any> {
        const constructorObject = this.constructor as typeof Model;
        await constructorObject.loadSchema();
        const relationship = this._relations.find((item: any) => item.relation === intermediate._table);
        const currentModelName = constructorObject.name.toLowerCase();
        const { data, count, error, status } = await constructorObject.getConnection().from(intermediate._table)
            .select(`*, ${currentModelName}: ${constructorObject._table} ( * )`)
            .eq([currentModelName + '_id'], this.id)
            .filter(column, operator, value);
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
        return new Collection(data);
    }

    // const friendships =  async() => (await supabase.from('friendships')
    //                                                     .select('*, profile:profiles(*)')
    //                                                     .eq('profile_id', user.id)).data;

    public async with(relation: string) {
        const current = this.constructor as typeof Model;
        await current.loadSchema();
        const _relations = Object.getPrototypeOf(this).constructor._relations;
        const relationship = _relations.find((item: any) => item.relation === relation);

        const { data, count, error, status } = await (this.constructor as typeof Model)._connector.from(relationship?.relation)
            .select().eq(relationship?.foreign_column, this[current._idColumn]);

        const modeledData = data ? data?.map((item: any) => new current(item, { count, error, status })) : [];

        return new Collection(modeledData);
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
        if(response) {
            newInstance.response(response);
        }
        return newInstance;
    }

    public static async from(data: any) {
        await this.loadSchema();
        return await (new this(data)).relate();
    }
}

```