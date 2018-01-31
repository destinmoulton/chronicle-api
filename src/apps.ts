import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

const logTableName = "GizmoVaultLog";
const db = new DynamoDB.DocumentClient();

/**
 * Get a list of distinct apps
 *
 * @param event APIGatewayEvent
 * @param context Context
 * @param cb Callback
 */
export const apps: Handler = (
    event: APIGatewayEvent,
    context: Context,
    cb: Callback
) => {
    const params = {
        TableName: logTableName,
        ProjectionExpression: "app"
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
                body: "Error. Unable to get list of apps."
            });
        }

        let apps = [];
        data.Items.forEach(item => {
            if (apps.indexOf(item.app) === -1) {
                apps.push(item.app);
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
                apps
            })
        };

        cb(null, response);
    });
};
