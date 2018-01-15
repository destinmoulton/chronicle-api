import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import * as uuid from "uuid";

const logTableName = "GizmoVaultLog";
const db = new DynamoDB.DocumentClient();

/**
 * Query logs from the db via JSON query
 *
 * @param event APIGatewayEvent
 * @param context Context
 * @param cb Callback
 */
export const query: Handler = (
    event: APIGatewayEvent,
    context: Context,
    cb: Callback
) => {
    const data = JSON.parse(event.body);
    if (!data.query) {
        cb(null, {
            statusCode: 400,
            headers: { "Content-Type": "text/plain" },
            body: "No query provided."
        });
    }

    const parts = data.query.parts;

    let FilterExpression = "";
    let ExpressionAttributeValues = {};
    let ExpressionAttributeNames = {};
    let hasRun = false;
    parts.forEach(part => {
        if (hasRun) {
            const booleanOperator = part.bool || "AND";
            FilterExpression += ` ${booleanOperator} `;
        }

        const comparison = part.comparison || "=";

        FilterExpression += `#${part.name} ${comparison} :${part.name} `;
        ExpressionAttributeNames["#" + part.name] = part.name;
        ExpressionAttributeValues[":" + part.name] = part.value;
        hasRun = true;
    });

    const params = {
        TableName: logTableName,
        FilterExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues
    };

    console.log(params);

    db.scan(params, (err, data) => {
        if (err) {
            cb(null, {
                statusCode: 400,
                headers: { "Content-Type": "text/plain" },
                body: "Query is invalid." + err
            });
        }
        const response = {
            statusCode: 200,
            body: JSON.stringify({
                data
            })
        };

        cb(null, response);
    });
};
