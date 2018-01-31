import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

import * as uuid from "uuid";
import clean from "lodash-clean";

const logTableName = "GizmoVaultLog";
const db = new DynamoDB.DocumentClient();

/**
 * Put POSTed logs into the db.
 *
 * @param event APIGatewayEvent
 * @param context Context
 * @param cb Callback
 */
export const add: Handler = (
    event: APIGatewayEvent,
    context: Context,
    cb: Callback
) => {
    const timestamp = new Date().getTime();

    const data = JSON.parse(event.body);

    let cleanClient = {};
    if (data.client !== undefined) {
        cleanClient = clean(data.client);
    }

    let cleanData = {};
    if (data.info !== undefined) {
        cleanData = clean(data.info);
    }

    const type = data.type || "log";
    const app = data.app || "Unknown App";

    const params = {
        TableName: logTableName,
        Item: {
            id: uuid.v1(),
            app,
            client: cleanClient,
            type,
            info: cleanData,
            event,
            createdAt: timestamp
        }
    };

    console.log(params);

    db.put(params, error => {
        if (error) console.error(error);
    });

    // Always return a positive response.
    const response = {
        statusCode: 200,
        headers: {
            "Content-Type": "text/plain",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    };

    cb(null, response);
};
