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

let merchandiserAuthToken: string;
let nonMerchandiserAuthToken: string;

let newVendorId: string;

describe("App vendors endpoints should work", () => {
  beforeAll(async() => {
    ({ express, connection } = await app as any);

    // clear database
    await connection.dropDatabase();
    await connection.runMigrations();

    // run fixtures
    await loadFixtures(connection);

    const authService = Container.get<AuthService>(AuthService);
    merchandiserAuthToken = authService.generateAuthToken({ id: "8c42f6d1-9dad-4098-a448-a4f73cdb7f40", role: "merchandiser" } as User);
    nonMerchandiserAuthToken = authService.generateAuthToken({ id: "8c817cac-0d0c-437f-89ba-9edc234792a7", role: "customer" } as User);
  });

  afterAll(async() => {
    await connection.close();
    await (express as any).stop();
  });

  it("App should return all existing vendors from db", (done) => {
    request(express)
      .get("/api/vendors")
      .accept("application/json")
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toHaveLength(2);

        done();
      });
  });

  it("Create new vendor should return a 403 for non authorized users", (done) => {
    request(express)
      .post("/api/vendors")
      .auth(nonMerchandiserAuthToken, { type: "bearer" })
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

  it("Create new vendor should must validate body for authorized users", (done) => {
    request(express)
      .post("/api/vendors")
      .auth(merchandiserAuthToken, { type: "bearer" })
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

  it("Create new vendor should work for valid body and authorized user", (done) => {
    request(express)
      .post("/api/vendors")
      .auth(merchandiserAuthToken, { type: "bearer" })
      .accept("application/json")
      .send({
        name: "New Vendor",
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.id).toBeDefined();
        expect(res.body.name).toBe("New Vendor");
        expect(res.body.code).toBe("NEW_VENDOR");

        newVendorId = res.body.id;

        done();
      });
  });

  it("App should return existing and new vendor by id from db", (done) => {
    request(express)
      .get(`/api/vendors/${newVendorId}`)
      .accept("application/json")
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.id).toBe(newVendorId);
        expect(res.body.name).toBe("New Vendor");
        expect(res.body.code).toBe("NEW_VENDOR");

        done();
      });
  });

  it("Update vendor should return a 403 for non authorized users", (done) => {
    request(express)
      .put(`/api/vendors/${newVendorId}`)
      .auth(nonMerchandiserAuthToken, { type: "bearer" })
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

  it("Update vendor should work for valid body and authorized user", (done) => {
    request(express)
      .put(`/api/vendors/${newVendorId}`)
      .auth(merchandiserAuthToken, { type: "bearer" })
      .accept("application/json")
      .send({
        name: "New Vendor Updated",
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.id).toBeDefined();
        expect(res.body.name).toBe("New Vendor Updated");
        expect(res.body.code).toBe("NEW_VENDOR_UPDATED");

        done();
      });
  });

  it("Delete vendor should return a 403 for non authorized users", (done) => {
    request(express)
      .delete(`/api/vendors/${newVendorId}`)
      .auth(nonMerchandiserAuthToken, { type: "bearer" })
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

  it("Delete vendor should work for valid body and authorized user", (done) => {
    request(express)
      .delete(`/api/vendors/${newVendorId}`)
      .auth(merchandiserAuthToken, { type: "bearer" })
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

  it("App should return a 404 for non-existing (or deleted) vendor", (done) => {
    request(express)
      .get(`/api/vendors/${newVendorId}`)
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
