import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

/**
 * Provide a CORS response
 *
 * @param event APIGatewayEvent
 * @param context Context
 * @param cb Callback
 */
export const cors: Handler = (
    event: APIGatewayEvent,
    context: Context,
    cb: Callback
) => {
    // Always return a positive response.
    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    };

    cb(null, response);
};
