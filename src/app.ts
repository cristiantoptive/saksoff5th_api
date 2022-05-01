import { Connection, createConnection, useContainer as ormUseContainer } from "typeorm";
import { createExpressServer, getMetadataArgsStorage, RoutingControllersOptions, useContainer } from "routing-controllers";
import { useContainer as validatorUseContainer } from "class-validator";
import { createHttpTerminator } from "http-terminator";
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
validatorUseContainer(Container, {
  fallback: true,
  fallbackOnErrors: true,
});

export default createConnection()
  .then((connection: Connection) => {
    if (!env.isTest) {
      console.log("DB Connected. Now run express app");
    }

    // app options
    const routingControllersOptions: RoutingControllersOptions = {
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
      controllers: [`${__dirname }/api/controllers/*.${env.isDevelopment || env.isTest ? "ts" : "js"}`],
      middlewares: [`${__dirname }/api/middlewares/*.${env.isDevelopment || env.isTest ? "ts" : "js"}`],
      interceptors: [`${__dirname }/api/interceptors/*.${env.isDevelopment || env.isTest ? "ts" : "js"}`],

      /**
       * Authorization features
       */
      authorizationChecker: authorizationChecker(),
      currentUserChecker: currentUserChecker(),
    };

    // create express server using app options
    const app = createExpressServer(routingControllersOptions);

    // Parse routing-controllers classes into OpenAPI spec:
    if (!env.isTest) {
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
    }

    const server = app.listen(env.app.port, () => {
      if (!env.isTest) {
        console.log(`Server is up and running on port ${env.app.port}. Now send requests to check if everything works.`);
      }
    });

    const httpTerminator = createHttpTerminator({ server });
    app.stop = () => httpTerminator.terminate();

    return {
      express: app,
      connection,
    };
  })
  .catch(error => console.log("Error: ", error));
