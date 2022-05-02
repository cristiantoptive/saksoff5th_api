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

let adminAuthToken: string;
let nonAdminAuthToken: string;

let newCategoryId: string;

describe("App categories endpoints should work", () => {
  beforeAll(async() => {
    ({ express, connection } = await app as any);

    // clear database
    await connection.dropDatabase();
    await connection.runMigrations();

    // run fixtures
    await loadFixtures(connection);

    const authService = Container.get<AuthService>(AuthService);
    adminAuthToken = authService.generateAuthToken({ id: "2c3b4021-ae5d-400f-b2ec-14078dfa0ad5", role: "admin" } as User);
    nonAdminAuthToken = authService.generateAuthToken({ id: "8c42f6d1-9dad-4098-a448-a4f73cdb7f40", role: "merchandiser" } as User);
  });

  afterAll(async() => {
    await connection.close();
    await (express as any).stop();
  });

  it("App should return all existing categories from db", (done) => {
    request(express)
      .get("/api/categories")
      .accept("application/json")
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toHaveLength(3);

        done();
      });
  });

  it("Create new category should return a 403 for non authorized users", (done) => {
    request(express)
      .post("/api/categories")
      .auth(nonAdminAuthToken, { type: "bearer" })
      .accept("application/json")
      .expect(403)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.name).toBe("AccessDeniedError");

        done();
      });
  });

  it("Create new category should must validate body for authorized users", (done) => {
    request(express)
      .post("/api/categories")
      .auth(adminAuthToken, { type: "bearer" })
      .accept("application/json")
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

        done();
      });
  });

  it("Create new category should work for valid body and authorized user", (done) => {
    request(express)
      .post("/api/categories")
      .auth(adminAuthToken, { type: "bearer" })
      .accept("application/json")
      .send({
        name: "Sports",
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.id).toBeDefined();
        expect(res.body.name).toBe("Sports");
        expect(res.body.code).toBe("SPORTS");

        newCategoryId = res.body.id;

        done();
      });
  });

  it("App should return existing and new category by id from db", (done) => {
    request(express)
      .get(`/api/categories/${newCategoryId}`)
      .accept("application/json")
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.id).toBe(newCategoryId);
        expect(res.body.name).toBe("Sports");
        expect(res.body.code).toBe("SPORTS");

        done();
      });
  });

  it("Update category should return a 403 for non authorized users", (done) => {
    request(express)
      .put(`/api/categories/${newCategoryId}`)
      .auth(nonAdminAuthToken, { type: "bearer" })
      .accept("application/json")
      .expect(403)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.name).toBe("AccessDeniedError");

        done();
      });
  });

  it("Update category should work for valid body and authorized user", (done) => {
    request(express)
      .put(`/api/categories/${newCategoryId}`)
      .auth(adminAuthToken, { type: "bearer" })
      .accept("application/json")
      .send({
        name: "Sports Updated",
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.id).toBeDefined();
        expect(res.body.name).toBe("Sports Updated");
        expect(res.body.code).toBe("SPORTS_UPDATED");

        done();
      });
  });

  it("Delete category should return a 403 for non authorized users", (done) => {
    request(express)
      .delete(`/api/categories/${newCategoryId}`)
      .auth(nonAdminAuthToken, { type: "bearer" })
      .accept("application/json")
      .expect(403)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.name).toBe("AccessDeniedError");

        done();
      });
  });

  it("Delete category should work for valid body and authorized user", (done) => {
    request(express)
      .delete(`/api/categories/${newCategoryId}`)
      .auth(adminAuthToken, { type: "bearer" })
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

  it("App should return a 404 for non-existing (or deleted) category", (done) => {
    request(express)
      .get(`/api/categories/${newCategoryId}`)
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
