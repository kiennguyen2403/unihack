import { DataAPIClient, Db, VectorizeDoc } from "@datastax/astra-db-ts";

export function createDataStaxClient(): Db {
    const { ASTRA_DB_API_ENDPOINT: endpoint, ASTRA_DB_APPLICATION_TOKEN: token } =
        process.env;

    if (!token || !endpoint) {
        throw new Error(
            "Environment variables ASTRA_DB_API_ENDPOINT and ASTRA_DB_APPLICATION_TOKEN must be defined.",
        );
    }

    // Create an instance of the `DataAPIClient` class with your token.
    const client = new DataAPIClient(token);

    // Get the database specified by your endpoint.
    const database = client.db(endpoint);

    console.log(`Connected to database ${database.id}`);

    return database;
}


export interface Idea extends VectorizeDoc {
    value: string;
    risk_level: number;
}

