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

let newUserId: string;

describe("App users endpoints should work", () => {
  beforeAll(async() => {
    ({ express, connection } = await app as any);

    // clear database
    await connection.dropDatabase();
    await connection.runMigrations();

    // run fixtures
    await loadFixtures(connection);

    const authService = Container.get<AuthService>(AuthService);
    adminAuthToken = authService.generateAuthToken({ id: "2c3b4021-ae5d-400f-b2ec-14078dfa0ad5", role: "admin" } as User);
    nonAdminAuthToken = authService.generateAuthToken({ id: "8c42f6d1-9dad-4098-a448-a4f73cdb7f40", role: "customer" } as User);
  });

  afterAll(async() => {
    // close connections and stop server
    await (express as any).stop();
    await connection.close();
  });

  it("Only authenticated users can get all existing users from db", (done) => {
    request(express)
      .get("/api/users")
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

  it("Authenticated user can get all existing users (excerpt view) from db", (done) => {
    request(express)
      .get("/api/users")
      .auth(adminAuthToken, { type: "bearer" })
      .accept("application/json")
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toHaveLength(6);

        done();
      });
  });

  it("Create new user should return a 403 for non authorized (admin) users", (done) => {
    request(express)
      .post("/api/users")
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

  it("Create new user should must validate body for authorized users", (done) => {
    request(express)
      .post("/api/users")
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
        expect(res.body.errors.email).toBeDefined();
        expect(res.body.errors.firstName).toBeDefined();
        expect(res.body.errors.lastName).toBeDefined();
        expect(res.body.errors.password).toBeDefined();
        expect(res.body.errors.role).toBeDefined();

        done();
      });
  });

  it("Create new user should work for valid body and authorized user", (done) => {
    request(express)
      .post("/api/users")
      .auth(adminAuthToken, { type: "bearer" })
      .accept("application/json")
      .send({
        email: "new@user.com",
        firstName: "New",
        lastName: "User",
        password: "newuser123",
        role: "merchandiser",
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.id).toBeDefined();
        expect(res.body.email).toBe("new@user.com");
        expect(res.body.role).toBe("merchandiser");
        expect(res.body.firstName).toBe("New");
        expect(res.body.lastName).toBe("User");

        newUserId = res.body.id;

        done();
      });
  });

  it("Newly created users should be able to signin", (done) => {
    request(express)
      .post("/api/auth/signin")
      .accept("application/json")
      .send({
        email: "new@user.com",
        password: "newuser123",
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.token).toBeDefined();
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe("new@user.com");
        expect(res.body.user.role).toBe("merchandiser");

        done();
      });
  });

  it("Only authenticated users can retrieve existing user by id from db", (done) => {
    request(express)
      .get(`/api/users/${newUserId}`)
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

  it("App should return existing and new user excerpt view by id from db for any authenticated user", (done) => {
    request(express)
      .get(`/api/users/${newUserId}`)
      .auth(nonAdminAuthToken, { type: "bearer" })
      .accept("application/json")
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.id).toBe(newUserId);
        expect(res.body.fullName).toBe("New User");

        done();
      });
  });

  it("Update user should return a 403 for non authorized (admin) users", (done) => {
    request(express)
      .put(`/api/users/${newUserId}`)
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

  it("Update user should work for valid body and authorized (admin) user", (done) => {
    request(express)
      .put(`/api/users/${newUserId}`)
      .auth(adminAuthToken, { type: "bearer" })
      .accept("application/json")
      .send({
        email: "updated@user.com",
        firstName: "Updated",
        lastName: "User",
        password: "updateduser123",
        role: "customer",
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.id).toBeDefined();
        expect(res.body.email).toBe("updated@user.com");
        expect(res.body.firstName).toBe("Updated");
        expect(res.body.lastName).toBe("User");
        expect(res.body.role).toBe("customer");

        done();
      });
  });

  it("Delete user should return a 403 for non authorized users", (done) => {
    request(express)
      .delete(`/api/users/${newUserId}`)
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

  it("Delete user should return an error if a user tries to remove his self", (done) => {
    request(express)
      .delete("/api/users/2c3b4021-ae5d-400f-b2ec-14078dfa0ad5") // authenticated user Id
      .auth(adminAuthToken, { type: "bearer" })
      .accept("application/json")
      .expect(403)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.name).toBe("ForbiddenError");

        done();
      });
  });

  it("Delete user should work for valid body and authorized (admin) user", (done) => {
    request(express)
      .delete(`/api/users/${newUserId}`)
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

  it("App should return a 404 for non-existing (or deleted) user", (done) => {
    request(express)
      .get(`/api/users/${newUserId}`)
      .auth(adminAuthToken, { type: "bearer" })
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
