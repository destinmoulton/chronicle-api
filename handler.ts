import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

export const logPost: Handler = (
    event: APIGatewayEvent,
    context: Context,
    cb: Callback
) => {
    console.log("logPost called");
    console.log(event);
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            message: "logPost called!",
            input: event
        })
    };

    cb(null, response);
};

export const logGet: Handler = (
    event: APIGatewayEvent,
    context: Context,
    cb: Callback
) => {
    console.log("logGet called");
    console.log(event);
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            message: "logGet called!",
            input: event
        })
    };

    cb(null, response);
};
