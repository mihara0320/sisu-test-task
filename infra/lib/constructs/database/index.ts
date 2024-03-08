import {Construct} from "constructs";
import {SqlDatabaseInstance} from "@cdktf/provider-google/lib/sql-database-instance";
import {SqlDatabase} from "@cdktf/provider-google/lib/sql-database";
import {SqlUser} from "@cdktf/provider-google/lib/sql-user";
import {GoogleProvider} from "@cdktf/provider-google/lib/provider";

interface DatabaseConfig {
    provider: GoogleProvider;
    instanceName: string;
    databaseName: string;
    userName: string;
    password: string;
    region: string;
    databaseVersion: string;
    tier: string;
}

export class Database extends Construct {
    public readonly instance: SqlDatabaseInstance;
    public readonly database: SqlDatabase;
    public readonly user: SqlUser;

    constructor(scope: Construct, id: string, config: DatabaseConfig) {
        super(scope, id);

        this.instance = new SqlDatabaseInstance(this, 'SqlInstance', {
            provider: config.provider,
            name: config.instanceName,
            databaseVersion: config.databaseVersion,
            region: config.region,
            settings: {
                tier: config.tier
            },
        });

        this.database = new SqlDatabase(this, 'SqlDatabase', {
            provider: config.provider,
            name: config.databaseName,
            instance: this.instance.name,
        });

        this.user = new SqlUser(this, 'SqlUser', {
            provider: config.provider,
            name: config.userName,
            instance: this.instance.name,
            password: config.password,
        });
    }
}