import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

const logTableName = "GizmoVaultLog";
const db = new DynamoDB.DocumentClient();

/**
 * Get all the distinct log types for an app
 *
 * @param event APIGatewayEvent
 * @param context Context
 * @param cb Callback
 */
export const logtypes: Handler = (
    event: APIGatewayEvent,
    context: Context,
    cb: Callback
) => {
    const jsonData = JSON.parse(event.body);
    if (!jsonData.app) {
        cb(null, {
            statusCode: 400,
            headers: {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: "No app provided."
        });
    }

    const appName = jsonData.app;

    const FilterExpression = `#app = :app `;
    const ExpressionAttributeNames = { "#app": "app" };
    const ExpressionAttributeValues = { ":app": appName };
    const ProjectionExpression = "type";

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
                headers: {
                    "Content-Type": "text/plain",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
                body: "Query is invalid." + err
            });
        }

        const types = [];

        data.Items.map(item => {
            if (types.indexOf(item.type) === -1) {
                types.push(item.type);
            }
        });

        const response = {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            statusCode: 200,
            body: JSON.stringify({
                logtypes: types
            })
        };

        cb(null, response);
    });
};
