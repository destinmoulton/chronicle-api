import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

import * as uuid from "uuid";
import { forOwn, isArray, isPlainObject, isString } from "lodash";

const logTableName = "GizmoVaultLog";
const db = new DynamoDB.DocumentClient({
    convertEmptyValues: true
});

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

    let cleanClient = data.client;
    if (data.client !== undefined) {
        cleanClient = cleanEmptyStrings(data.client);
    }

    let cleanData = {};
    if (data.info !== undefined) {
        cleanData = cleanEmptyStrings(data.info);
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

/**
 * Loop over elements in arrays and objects and recursively
 * replace empty strings with CHRONICLE_PLACEHOLDER_EMPTYSTRING
 *
 * @param obj Object (array, object, string...)
 */
const cleanEmptyStrings = obj => {
    if (isString(obj) && obj === "") {
        return "CHRONICLE_PLACEHOLDER_EMPTYSTRING";
    } else if (isPlainObject(obj)) {
        const newObj = {};
        forOwn(obj, (val, key) => {
            newObj[key] = cleanEmptyStrings(val);
        });
        return newObj;
    } else if (isArray(obj)) {
        const newArr = [];
        obj.forEach(val => {
            // Recursively clean each element in array
            newArr.push(cleanEmptyStrings(val));
        });
        return newArr;
    }
    return obj;
};
