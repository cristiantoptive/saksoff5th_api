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
let newCardId: string;

describe("App cards endpoints should work", () => {
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

  it("App should require authentication to list user cards", (done) => {
    request(express)
      .get("/api/cards")
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

  it("Authenticated user should be able to retrieve their cards", (done) => {
    request(express)
      .get("/api/cards")
      .auth(userAuthToken, { type: "bearer" })
      .accept("application/json")
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toHaveLength(1);

        done();
      });
  });

  it("User must be authenticated to retrieve card details", (done) => {
    request(express)
      .get("/api/cards/1c42f6d1-0dad-1108-a448-a4f73cdb7f40")
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

  it("Users can only retrieve details from their own cards", (done) => {
    request(express)
      .get("/api/cards/1c42f6d1-0dad-1108-a448-a4f73cdb7f40") // existing card from another user
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

  it("Only authenticated users can add new cards", (done) => {
    request(express)
      .post("/api/cards")
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

  it("App must validate request body to add new cards", (done) => {
    request(express)
      .post("/api/cards")
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
        expect(res.body.errors.name).toBeDefined();
        expect(res.body.errors.number).toBeDefined();
        expect(res.body.errors.expiresOn).toBeDefined();

        done();
      });
  });

  it("Users should be able to add new cards if request body is correct", (done) => {
    const expiresOn = new Date("09/01/2024").toISOString();

    request(express)
      .post("/api/cards")
      .accept("application/json")
      .auth(userAuthToken, { type: "bearer" })
      .send({
        name: "Jhon Doe",
        number: "1234543467",
        expiresOn,
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.id).toBeDefined();
        expect(res.body.name).toBe("Jhon Doe");
        expect(res.body.number).toBe("1234543467");
        expect(res.body.expiresOn).toBe(expiresOn);

        newCardId = res.body.id;

        done();
      });
  });

  it("App should return existing and new cards by id from db", (done) => {
    request(express)
      .get(`/api/cards/${newCardId}`)
      .accept("application/json")
      .auth(userAuthToken, { type: "bearer" })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.id).toBe(newCardId);
        expect(res.body.name).toBe("Jhon Doe");
        expect(res.body.number).toBe("1234543467");
        expect(res.body.expiresOn).toBeDefined();

        done();
      });
  });

  it("Users can only edit their own cards", (done) => {
    const expiresOn = new Date("04/01/2024").toISOString();

    request(express)
      .put("/api/cards/1c42f6d1-0dad-1108-a448-a4f73cdb7f40") // existing card from another user
      .accept("application/json")
      .auth(userAuthToken, { type: "bearer" })
      .send({
        name: "Jhon Doe",
        number: "1234543467",
        expiresOn,
      })
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

  it("Users should be able to edit their own cards", (done) => {
    const expiresOn = new Date("04/01/2024").toISOString();

    request(express)
      .put(`/api/cards/${newCardId}`)
      .accept("application/json")
      .auth(userAuthToken, { type: "bearer" })
      .send({
        name: "Jane Doe",
        number: "5675834200453",
        expiresOn,
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.id).toBe(newCardId);
        expect(res.body.name).toBe("Jane Doe");
        expect(res.body.number).toBe("5675834200453");
        expect(res.body.expiresOn).toBeDefined();

        done();
      });
  });

  it("Delete card should work only for cards that belongs to the aunthenticated user", (done) => {
    request(express)
      .delete("/api/cards/1c42f6d1-0dad-1108-a448-a4f73cdb7f40") // existing card from another user
      .auth(userAuthToken, { type: "bearer" })
      .accept("application/json")
      .send()
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.name).toBe("BadRequestError");

        done();
      });
  });

  it("Delete card should work for valid body and authorized user", (done) => {
    request(express)
      .delete(`/api/cards/${newCardId}`)
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

  it("App should return a 404 for non-existing (or deleted) card", (done) => {
    request(express)
      .get(`/api/cards/${newCardId}`)
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
