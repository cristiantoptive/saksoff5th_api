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
let newOrderId: string;

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

        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe("f4c09df8-f5a9-4507-bb36-ec0a5a827f3f");

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

  it("Users can only retrieve details from their own orders", (done) => {
    request(express)
      .get("/api/orders/f4c09df8-f5a9-4507-bb36-ec0a5a827f3f")
      .auth(userAuthToken, { type: "bearer" })
      .accept("application/json")
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.id).toBe("f4c09df8-f5a9-4507-bb36-ec0a5a827f3f");
        expect(res.body.status).toBe("placed");
        expect(res.body.shippingAddress).toBeDefined();
        expect(res.body.shippingAddress.id).toBe("39d01e74-c990-4612-810b-1459da48cddf");
        expect(res.body.billingAddress).toBeDefined();
        expect(res.body.billingAddress.id).toBe("4ecabf37-5c8f-4cfb-809d-f85f09e9a0d7");
        expect(res.body.paymentCard).toBeDefined();
        expect(res.body.paymentCard.id).toBe("cf745067-52a8-4314-96de-982e3b70fbc7");
        expect(res.body.items).toBeDefined();
        expect(res.body.items).toHaveLength(2);
        expect(res.body.items[0].id).toBe("b49d9c28-4472-49f0-814c-19d05a5eb786");
        expect(res.body.items[0].product).toBeDefined();
        expect(res.body.items[0].product.id).toBe("9335113d-552b-4e86-bd33-e74315c7b30a");
        expect(res.body.items[1].id).toBe("bb5c5028-d080-4425-8806-8f12c9e16526");
        expect(res.body.items[1].product).toBeDefined();
        expect(res.body.items[1].product.id).toBe("1575113c-552b-4f86-bd99-e74315c7b75a");

        done();
      });
  });

  it("Only authenticated users can add new order", (done) => {
    request(express)
      .post("/api/orders")
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

  it("App must validate request body to add new order", (done) => {
    request(express)
      .post("/api/orders")
      .accept("application/json")
      .auth(userAuthToken, { type: "bearer" })
      .send({ })
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.name).toBe("ValidationError");
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.shippingAddress).toBeDefined();
        expect(res.body.errors.billingAddress).toBeDefined();
        expect(res.body.errors.card).toBeDefined();
        expect(res.body.errors.items).toBeDefined();


        done();
      });
  });

  it("Users should be able to add new order if request body is correct", (done) => {
    request(express)
      .post("/api/orders")
      .accept("application/json")
      .auth(userAuthToken, { type: "bearer" })
      .send({
        shippingAddress: "39d01e74-c990-4612-810b-1459da48cddf",
        billingAddress: "4ecabf37-5c8f-4cfb-809d-f85f09e9a0d7",
        card: "cf745067-52a8-4314-96de-982e3b70fbc7",
        items: [
          {
            product: "9335113d-552b-4e86-bd33-e74315c7b30a",
            quantity: 5,
          },
        ],
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.id).toBeDefined();
        expect(res.body.status).toBe("placed");
        expect(res.body.shippingAddress).toBeDefined();
        expect(res.body.shippingAddress.id).toBe("39d01e74-c990-4612-810b-1459da48cddf");
        expect(res.body.billingAddress).toBeDefined();
        expect(res.body.billingAddress.id).toBe("4ecabf37-5c8f-4cfb-809d-f85f09e9a0d7");
        expect(res.body.paymentCard).toBeDefined();
        expect(res.body.paymentCard.id).toBe("cf745067-52a8-4314-96de-982e3b70fbc7");
        expect(res.body.items).toBeDefined();
        expect(res.body.items).toHaveLength(1);
        expect(res.body.items[0].id).toBeDefined();
        expect(res.body.items[0].quantity).toBe(5);
        expect(res.body.items[0].product).toBeDefined();
        expect(res.body.items[0].product.id).toBe("9335113d-552b-4e86-bd33-e74315c7b30a");

        newOrderId = res.body.id;

        done();
      });
  });

  it("App should return existing and new order by id from db", (done) => {
    request(express)
      .get(`/api/orders/${newOrderId}`)
      .accept("application/json")
      .auth(userAuthToken, { type: "bearer" })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.id).toBe(newOrderId);
        expect(res.body.status).toBe("placed");
        expect(res.body.shippingAddress).toBeDefined();
        expect(res.body.shippingAddress.id).toBe("39d01e74-c990-4612-810b-1459da48cddf");
        expect(res.body.billingAddress).toBeDefined();
        expect(res.body.billingAddress.id).toBe("4ecabf37-5c8f-4cfb-809d-f85f09e9a0d7");
        expect(res.body.paymentCard).toBeDefined();
        expect(res.body.paymentCard.id).toBe("cf745067-52a8-4314-96de-982e3b70fbc7");
        expect(res.body.items).toBeDefined();
        expect(res.body.items).toHaveLength(1);
        expect(res.body.items[0].id).toBeDefined();
        expect(res.body.items[0].quantity).toBe(5);
        expect(res.body.items[0].product).toBeDefined();
        expect(res.body.items[0].product.id).toBe("9335113d-552b-4e86-bd33-e74315c7b30a");

        done();
      });
  });

  it("Users should be able to edit their own order", (done) => {
    request(express)
      .put(`/api/orders/${newOrderId}`)
      .accept("application/json")
      .auth(userAuthToken, { type: "bearer" })
      .send({
        shippingAddress: "39d01e74-c990-4612-810b-1459da48cddf",
        billingAddress: "4ecabf37-5c8f-4cfb-809d-f85f09e9a0d7",
        card: "cf745067-52a8-4314-96de-982e3b70fbc7",
        items: [
          {
            product: "9335113d-552b-4e86-bd33-e74315c7b30a",
            quantity: 1,
          },
          {
            product: "a469d682-7a77-41a5-b23f-966ccf5aa42a",
            quantity: 4,
          },
        ],
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.id).toBe(newOrderId);
        expect(res.body.status).toBe("placed");
        expect(res.body.shippingAddress).toBeDefined();
        expect(res.body.shippingAddress.id).toBe("39d01e74-c990-4612-810b-1459da48cddf");
        expect(res.body.billingAddress).toBeDefined();
        expect(res.body.billingAddress.id).toBe("4ecabf37-5c8f-4cfb-809d-f85f09e9a0d7");
        expect(res.body.paymentCard).toBeDefined();
        expect(res.body.paymentCard.id).toBe("cf745067-52a8-4314-96de-982e3b70fbc7");
        expect(res.body.items).toBeDefined();
        expect(res.body.items).toHaveLength(2);

        done();
      });
  });

  it("Delete order should work only for order that belongs to the aunthenticated user", (done) => {
    request(express)
      .delete("/api/orders/bd76f634-ff1a-497b-b726-4519487e0a5b") // existing order from another user
      .auth(userAuthToken, { type: "bearer" })
      .accept("application/json")
      .send()
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

  it("Delete order should work for valid body and authorized user", (done) => {
    request(express)
      .delete(`/api/orders/${newOrderId}`)
      .auth(userAuthToken, { type: "bearer" })
      .accept("application/json")
      .send()
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.success).toBeDefined();
        expect(res.body.status).toBe("deleted");

        done();
      });
  });

  it("App should return a 404 for non-existing (or deleted) order", (done) => {
    request(express)
      .get(`/api/orders/${newOrderId}`)
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
});
