import { createConnection, useContainer as ormUseContainer } from "typeorm";
import { createExpressServer, getMetadataArgsStorage, useContainer } from "routing-controllers";
import { Container } from "typedi";

import { routingControllersToSpec } from "routing-controllers-openapi";
import * as swaggerUiExpress from "swagger-ui-express";
import { defaultMetadataStorage } from "class-transformer/cjs/storage";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";

import { authorizationChecker } from "@app/auth/authorizationChecker";
import { currentUserChecker } from "@app/auth/currentUserChecker";

import { env } from "./env";

ormUseContainer(Container);
useContainer(Container);

createConnection()
  .then(() => {
    console.log("DB Connected. Now run express app");

    // app options
    const routingControllersOptions = {
      cors: {
        origin: "*", // maybe we could read the allowed origins from .env file and allow only knows domains
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 204,
        exposedHeaders: ["Content-Disposition", "Content-Type"], // content-disposition for file download
      },
      routePrefix: env.app.routePrefix,
      validation: true,
      classTransformer: true,
      defaultErrorHandler: false,

      /**
       * We can add options about how routing-controllers should configure itself.
       * Here we specify what controllers should be registered in our express server.
       */
      controllers: [`${__dirname }/api/controllers/*.${env.isDevelopment ? "ts" : "js"}`],
      middlewares: [`${__dirname }/api/middlewares/*.${env.isDevelopment ? "ts" : "js"}`],
      interceptors: [`${__dirname }/api/interceptors/*.${env.isDevelopment ? "ts" : "js"}`],

      /**
       * Authorization features
       */
      authorizationChecker: authorizationChecker(),
      currentUserChecker: currentUserChecker(),
    };

    // create express server using app options
    const app = createExpressServer(routingControllersOptions);

    // Parse routing-controllers classes into OpenAPI spec:
    const spec = routingControllersToSpec(getMetadataArgsStorage(), routingControllersOptions, {
      components: {
        // Parse class-validator classes into JSON Schema:
        schemas: validationMetadatasToSchemas({
          classTransformerMetadataStorage: defaultMetadataStorage,
          refPointerPrefix: "#/components/schemas/",
        }),
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "jwt",
          },
        },
      },
      info: {
        description: "API specs for SaksOff5th app",
        title: "SaksOff5th API",
        version: "1.0.0",
      },
    });
    app.use("/docs", swaggerUiExpress.serve, swaggerUiExpress.setup(spec));

    app.listen(env.app.port);
    console.log(`Server is up and running on port ${env.app.port}. Now send requests to check if everything works.`);
  })
  .catch(error => console.log("Error: ", error));
