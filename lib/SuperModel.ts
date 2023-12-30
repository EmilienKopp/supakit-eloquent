import { CastEntry, Relationship } from "./Model";

import { QueryBuilder } from "./Builder";
import { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "./client";
import { parseTableDescription } from "./parsers";
import { singularPascalToPluralSnake } from "./strings";

export class SuperModel {

    [key: string]: any;


    private static _instance: SuperModel;
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
    protected static _dbSchema: {[key: string]: {nullable: boolean, type: string, name: string}} | null = null;

    private _query: QueryBuilder | null = null;
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

    constructor(rowData?: any, metadata?: any) {
        // No data provided - build from Schema
        if (!rowData) {
            for (const column in (this.constructor as typeof SuperModel)._dbSchema) {
                if (column === 'id') {
                    this._idColumn = 'id';
                }
                Object.defineProperty(this, column, {
                    value: null,
                    writable: true,
                    enumerable: true,
                    configurable: true
                });
            }
        }


        //Table Name initialization
        if (!(this.constructor as typeof SuperModel)._table) {
            (this.constructor as typeof SuperModel)._table = singularPascalToPluralSnake(this.constructor.name);
            console.log("Table name was inferred from model name. If this is not the desired table name, use Model.setTableName('table_name') to set it manually.");
            console.log("Table name: ", `${this.constructor.name} -> ${(this.constructor as typeof SuperModel)._table}`);
        }
        this._table = (this.constructor as typeof SuperModel)._table;

        this._idColumn = (this.constructor as typeof SuperModel)._idColumn ?? 'id';
        const _casts = Object.getPrototypeOf(this).constructor._casts;
        this._connector = (this.constructor as typeof SuperModel)._connector;
        
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

                if (!(this.constructor as typeof SuperModel).prototype.hasOwnProperty('$' + key)) {
                    (this.constructor as typeof SuperModel).prototype['$' + key] = async (arg: any): Promise<any | void> => {
                        if (arg) {
                            this[key] = arg;
                            await this.update({ [key]: arg });
                        } else {
                            await this.refresh();
                            return this[key];
                        }
                    }
                }

                if (!(this.constructor as typeof SuperModel).prototype.hasOwnProperty('$$' + key)) {
                    (this.constructor as typeof SuperModel).prototype['$$' + key] = (arg: any): any | void => {

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

    public static query(): QueryBuilder {
        return new QueryBuilder(this._table);
    }

    public connect() {
        console.log('Connecting to supabase')
        try {
            if ((this.constructor as typeof SuperModel)._connector && (this.constructor as typeof SuperModel)._connector instanceof SupabaseClient)  {
                Object.defineProperty(this, '_connector', {
                    value: (this.constructor as typeof SuperModel)._connector,
                    writable: true,
                    enumerable: false,
                    configurable: false
                });
            } else if((this.constructor as typeof SuperModel)._connectorUrl && (this.constructor as typeof SuperModel)._connectorKey) {
                this._connectorUrl = (this.constructor as typeof SuperModel)._connectorUrl;
                this._connectorKey = (this.constructor as typeof SuperModel)._connectorKey;
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
        return (this.constructor as typeof SuperModel)._connector;
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
}