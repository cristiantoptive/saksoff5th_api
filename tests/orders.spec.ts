import request from "supertest";
import { Express } from "express-serve-static-core";
import { Connection } from "typeorm";
import Container from "typedi";
import app from "../src/app";
import { loadFixtures } from "@app/database/fixtures/runner";
import { AuthService } from "@app/api/services";
import { User } from "@app/api/entities/User";

let express: Express;
let connection: Connection;

let userAuthToken: string;
// let newOrderId: string;

describe("App orders endpoints should work", () => {
  beforeAll(async() => {
    ({ express, connection } = await app as any);

    // clear database
    await connection.dropDatabase();
    await connection.runMigrations();

    // run fixtures
    await loadFixtures(connection);

    const authService = Container.get<AuthService>(AuthService);
    userAuthToken = authService.generateAuthToken({ id: "8c817cac-0d0c-437f-89ba-9edc234792a7", role: "customer" } as User);
  });

  afterAll(async() => {
    // close connections and stop server
    await (express as any).stop();
    await connection.close();
  });

  it("App should require authentication to list user orders", (done) => {
    request(express)
      .get("/api/orders")
      .accept("application/json")
      .expect(401)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.name).toBe("AuthorizationRequiredError");

        done();
      });
  });

  it("Authenticated user should be able to retrieve their orders", (done) => {
    request(express)
      .get("/api/orders")
      .auth(userAuthToken, { type: "bearer" })
      .accept("application/json")
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        console.log(res.body);
        expect(res.body).toHaveLength(1);

        done();
      });
  });

  it("User must be authenticated to retrieve order details", (done) => {
    request(express)
      .get("/api/orders/9fgabf28-6c5f-4cfb-819d-f85f09f3g3q1")
      .accept("application/json")
      .expect(401)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.name).toBe("AuthorizationRequiredError");

        done();
      });
  });

  it("Users can only retrieve details from their own orders", (done) => {
    request(express)
      .get("/api/orders/bd76f634-ff1a-497b-b726-4519487e0a5b") // existing order from another user
      .auth(userAuthToken, { type: "bearer" })
      .accept("application/json")
      .expect(404)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.name).toBe("EntityNotFoundError");

        done();
      });
  });

  // it("Only authenticated users can add new order", (done) => {
  //   request(express)
  //     .post("/api/orders")
  //     .accept("application/json")
  //     .expect(401)
  //     .end((err, res) => {
  //       if (err) {
  //         done(err);
  //         return;
  //       }

  //       expect(res.body).toBeDefined();
  //       expect(res.body.name).toBe("AuthorizationRequiredError");

  //       done();
  //     });
  // });

  // it("App must validate request body to add new order", (done) => {
  //   request(express)
  //     .post("/api/orders")
  //     .accept("application/json")
  //     .auth(userAuthToken, { type: "bearer" })
  //     .send({ })
  //     .expect(400)
  //     .end((err, res) => {
  //       if (err) {
  //         done(err);
  //         return;
  //       }

  //       expect(res.body).toBeDefined();
  //       expect(res.body.name).toBe("ValidationError");
  //       expect(res.body.errors).toBeDefined();
  //       expect(res.body.errors.type).toBeDefined();
  //       expect(res.body.errors.firstName).toBeDefined();
  //       expect(res.body.errors.lastName).toBeDefined();
  //       expect(res.body.errors.line1).toBeDefined();
  //       expect(res.body.errors.line2).not.toBeDefined();
  //       expect(res.body.errors.city).toBeDefined();
  //       expect(res.body.errors.state).toBeDefined();
  //       expect(res.body.errors.zipcode).toBeDefined();
  //       expect(res.body.errors.country).toBeDefined();

  //       done();
  //     });
  // });

  // it("Users should be able to add new order if request body is correct", (done) => {
  //   request(express)
  //     .post("/api/orders")
  //     .accept("application/json")
  //     .auth(userAuthToken, { type: "bearer" })
  //     .send({
  //       type: "billing",
  //       firstName: "Jhon",
  //       lastName: "Doe",
  //       line1: "Line 1",
  //       line2: "Line 2",
  //       city: "City",
  //       state: "State",
  //       zipcode: "01010",
  //       country: "Country",
  //     })
  //     .expect(200)
  //     .end((err, res) => {
  //       if (err) {
  //         done(err);
  //         return;
  //       }

  //       expect(res.body).toBeDefined();
  //       expect(res.body.id).toBeDefined();
  //       expect(res.body.type).toBe("billing");
  //       expect(res.body.firstName).toBe("Jhon");
  //       expect(res.body.lastName).toBe("Doe");
  //       expect(res.body.line1).toBe("Line 1");
  //       expect(res.body.line2).toBe("Line 2");
  //       expect(res.body.city).toBe("City");
  //       expect(res.body.state).toBe("State");
  //       expect(res.body.zipcode).toBe("01010");
  //       expect(res.body.country).toBe("Country");

  //       newOrderId = res.body.id;

  //       done();
  //     });
  // });

  // it("App should return existing and new order by id from db", (done) => {
  //   request(express)
  //     .get(`/api/orders/${newOrderId}`)
  //     .accept("application/json")
  //     .auth(userAuthToken, { type: "bearer" })
  //     .expect(200)
  //     .end((err, res) => {
  //       if (err) {
  //         done(err);
  //         return;
  //       }

  //       expect(res.body).toBeDefined();
  //       expect(res.body.id).toBe(newOrderId);
  //       expect(res.body.type).toBe("billing");
  //       expect(res.body.firstName).toBe("Jhon");
  //       expect(res.body.lastName).toBe("Doe");
  //       expect(res.body.line1).toBe("Line 1");
  //       expect(res.body.line2).toBe("Line 2");
  //       expect(res.body.city).toBe("City");
  //       expect(res.body.state).toBe("State");
  //       expect(res.body.zipcode).toBe("01010");
  //       expect(res.body.country).toBe("Country");

  //       done();
  //     });
  // });

  // it("Users can only edit their own order", (done) => {
  //   request(express)
  //     .put("/api/orders/9fgabf28-6c5f-4cfb-819d-f85f09f3g3q1") // existing order from another user
  //     .accept("application/json")
  //     .auth(userAuthToken, { type: "bearer" })
  //     .send({
  //       type: "shipping",
  //       firstName: "Jhon updated",
  //       lastName: "Doe updated",
  //       line1: "Line 1 updated",
  //       line2: "Line 2 updated",
  //       city: "City updated",
  //       state: "State updated",
  //       zipcode: "01010 updated",
  //       country: "Country updated",
  //     })
  //     .expect(404)
  //     .end((err, res) => {
  //       if (err) {
  //         done(err);
  //         return;
  //       }

  //       expect(res.body).toBeDefined();
  //       expect(res.body.name).toBe("EntityNotFoundError");

  //       done();
  //     });
  // });

  // it("Users should be able to edit their own order", (done) => {
  //   request(express)
  //     .put(`/api/orders/${newOrderId}`)
  //     .accept("application/json")
  //     .auth(userAuthToken, { type: "bearer" })
  //     .send({
  //       type: "shipping",
  //       firstName: "Jhon updated",
  //       lastName: "Doe updated",
  //       line1: "Line 1 updated",
  //       line2: "Line 2 updated",
  //       city: "City updated",
  //       state: "State updated",
  //       zipcode: "01010 updated",
  //       country: "Country updated",
  //     })
  //     .expect(200)
  //     .end((err, res) => {
  //       if (err) {
  //         done(err);
  //         return;
  //       }

  //       expect(res.body).toBeDefined();
  //       expect(res.body.id).toBe(newOrderId);
  //       expect(res.body.type).toBe("shipping");
  //       expect(res.body.firstName).toBe("Jhon updated");
  //       expect(res.body.lastName).toBe("Doe updated");
  //       expect(res.body.line1).toBe("Line 1 updated");
  //       expect(res.body.line2).toBe("Line 2 updated");
  //       expect(res.body.city).toBe("City updated");
  //       expect(res.body.state).toBe("State updated");
  //       expect(res.body.zipcode).toBe("01010 updated");
  //       expect(res.body.country).toBe("Country updated");

  //       done();
  //     });
  // });

  // it("Delete order should work only for order that belongs to the aunthenticated user", (done) => {
  //   request(express)
  //     .delete("/api/orders/9fgabf28-6c5f-4cfb-819d-f85f09f3g3q1") // existing order from another user
  //     .auth(userAuthToken, { type: "bearer" })
  //     .accept("application/json")
  //     .send()
  //     .expect(400)
  //     .end((err, res) => {
  //       if (err) {
  //         done(err);
  //         return;
  //       }

  //       expect(res.body).toBeDefined();
  //       expect(res.body.name).toBe("BadRequestError");

  //       done();
  //     });
  // });

  // it("Delete order should work for valid body and authorized user", (done) => {
  //   request(express)
  //     .delete(`/api/orders/${newOrderId}`)
  //     .auth(userAuthToken, { type: "bearer" })
  //     .accept("application/json")
  //     .send()
  //     .expect(200)
  //     .end((err, res) => {
  //       if (err) {
  //         done(err);
  //         return;
  //       }

  //       expect(res.body).toBeDefined();
  //       expect(res.body.success).toBeDefined();
  //       expect(res.body.status).toBe("deleted");

  //       done();
  //     });
  // });

  // it("App should return a 404 for non-existing (or deleted) order", (done) => {
  //   request(express)
  //     .get(`/api/orders/${newOrderId}`)
  //     .auth(userAuthToken, { type: "bearer" })
  //     .accept("application/json")
  //     .expect(404)
  //     .end((err, res) => {
  //       if (err) {
  //         done(err);
  //         return;
  //       }

  //       expect(res.body).toBeDefined();
  //       expect(res.body.name).toBe("EntityNotFoundError");

  //       done();
  //     });
  // });
});
