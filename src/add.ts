import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import * as uuid from "uuid";

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

    const type = data.type || "log";
    const app = data.app || "Unknown App";
    const info = data.info || data;

    const params = {
        TableName: logTableName,
        Item: {
            id: uuid.v1(),
            app,
            type,
            info,
            event,
            createdAt: timestamp
        }
    };

    db.put(params, error => {
        if (error) console.error(error);
    });

    // Always return a positive response.
    const response = {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: "Added log item."
    };

    cb(null, response);
};
