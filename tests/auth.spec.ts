import request from "supertest";
import { Express } from "express-serve-static-core";
import { Connection } from "typeorm";
import { loadFixtures } from "../src/database/fixtures/runner";
import { init } from "../src/app";
import { delay } from "@app/lib/utils/functions";

let express: Express;
let connection: Connection;

let newUserAuthToken;

describe("App auth process should work", () => {
  beforeAll(async() => {
    // init app stack
    ({ express, connection } = await init());

    // clear database
    await connection.dropDatabase();
    await connection.runMigrations();

    // run fixtures
    await loadFixtures(connection);
  });

  afterAll(async() => {
    // close connections and stop server
    await delay(5000); // wait for ORM events propagation
    await (express as any).stop();
    await connection.close();
  });

  it("Signin should work for a valid admin user", (done) => {
    request(express)
      .post("/api/auth/signin")
      .accept("application/json")
      .send({
        email: "admin@admin.com",
        password: "admin123",
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
        expect(res.body.user.id).toBeDefined();
        expect(res.body.user.email).toBe("admin@admin.com");
        expect(res.body.user.role).toBe("admin");
        expect(res.body.user.firstName).toBe("Cristian");
        expect(res.body.user.lastName).toBe("Tardivo");

        done();
      });
  });

  it("Signin should work for a valid merchandiser user", (done) => {
    request(express)
      .post("/api/auth/signin")
      .accept("application/json")
      .send({
        email: "merchandiser1@merchandiser.com",
        password: "merchandiser123",
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
        expect(res.body.user.email).toBe("merchandiser1@merchandiser.com");
        expect(res.body.user.role).toBe("merchandiser");

        done();
      });
  });

  it("Signin should work for a valid customer user", (done) => {
    request(express)
      .post("/api/auth/signin")
      .accept("application/json")
      .send({
        email: "customer1@customer.com",
        password: "customer123",
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
        expect(res.body.user.email).toBe("customer1@customer.com");
        expect(res.body.user.role).toBe("customer");

        done();
      });
  });

  it("Signin should validate request body", (done) => {
    request(express)
      .post("/api/auth/signin")
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
        expect(res.body.errors.password).toBeDefined();

        done();
      });
  });

  it("Signin should validate user email and password", (done) => {
    request(express)
      .post("/api/auth/signin")
      .accept("application/json")
      .send({
        email: "invalid@user.com",
        password: "invalid",
      })
      .expect(404)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.name).toBe("NotFoundError");
        expect(res.body.message).toBe("Username or password are wrong.");

        done();
      });
  });

  it("Signup should validate request body", (done) => {
    request(express)
      .post("/api/auth/signup")
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
        expect(res.body.errors.password).toBeDefined();
        expect(res.body.errors.firstName).toBeDefined();
        expect(res.body.errors.lastName).toBeDefined();

        done();
      });
  });

  it("Signup should work for a valid request body", (done) => {
    request(express)
      .post("/api/auth/signup")
      .accept("application/json")
      .send({
        email: "new@user.com",
        password: "newuser123",
        firstName: "New",
        lastName: "User",
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
        expect(res.body.user.id).toBeDefined();
        expect(res.body.user.email).toBe("new@user.com");
        expect(res.body.user.role).toBe("customer");
        expect(res.body.user.firstName).toBe("New");
        expect(res.body.user.lastName).toBe("User");

        done();
      });
  });

  it("Signup must fail is email address is already in use", (done) => {
    request(express)
      .post("/api/auth/signup")
      .accept("application/json")
      .send({
        email: "admin@admin.com",
        password: "someuser123",
        firstName: "Some",
        lastName: "User",
      })
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
        expect(res.body.errors.email.emailIsAlreadyInUse).toBeDefined();

        done();
      });
  });

  it("Signin should work for new users", (done) => {
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
        expect(res.body.user.id).toBeDefined();
        expect(res.body.user.email).toBe("new@user.com");
        expect(res.body.user.role).toBe("customer");
        expect(res.body.user.firstName).toBe("New");
        expect(res.body.user.lastName).toBe("User");

        newUserAuthToken = res.body.token;

        done();
      });
  });

  it("Retrieve authenticated user details must fail for non-authenticated users", (done) => {
    request(express)
      .get("/api/auth/user")
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

  it("Retrieve authenticated user details must work for authenticated users", (done) => {
    request(express)
      .get("/api/auth/user")
      .auth(newUserAuthToken, { type: "bearer" })
      .accept("application/json")
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body).toBeDefined();
        expect(res.body.id).toBeDefined();
        expect(res.body.email).toBe("new@user.com");
        expect(res.body.role).toBe("customer");
        expect(res.body.firstName).toBe("New");
        expect(res.body.lastName).toBe("User");

        done();
      });
  });

  it("Change password must required user to be authenticated", (done) => {
    request(express)
      .put("/api/auth/changePassword")
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

  it("Change password must validate request body", (done) => {
    request(express)
      .put("/api/auth/changePassword")
      .auth(newUserAuthToken, { type: "bearer" })
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
        expect(res.body.errors.oldPassword).toBeDefined();
        expect(res.body.errors.newPassword).toBeDefined();

        done();
      });
  });

  it("Change password must fail for a authenticated user if old password does not matches the current one", (done) => {
    request(express)
      .put("/api/auth/changePassword")
      .auth(newUserAuthToken, { type: "bearer" })
      .accept("application/json")
      .send({
        oldPassword: "no_the_current_one",
        newPassword: "newpassword",
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.name).toBe("ValidationError");
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.oldPassword).toBeDefined();
        expect(res.body.errors.oldPassword.isCurrentUserPassword).toBeDefined();
        done();
      });
  });

  it("Change password must work for a authenticated user and a valid request body", (done) => {
    request(express)
      .put("/api/auth/changePassword")
      .auth(newUserAuthToken, { type: "bearer" })
      .accept("application/json")
      .send({
        oldPassword: "newuser123",
        newPassword: "someNewPassword",
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
        expect(res.body.role).toBe("customer");
        expect(res.body.firstName).toBe("New");
        expect(res.body.lastName).toBe("User");

        done();
      });
  });

  it("Signin should work after password changes", (done) => {
    request(express)
      .post("/api/auth/signin")
      .accept("application/json")
      .send({
        email: "new@user.com",
        password: "someNewPassword",
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
        expect(res.body.user.id).toBeDefined();
        expect(res.body.user.email).toBe("new@user.com");
        expect(res.body.user.role).toBe("customer");
        expect(res.body.user.firstName).toBe("New");
        expect(res.body.user.lastName).toBe("User");

        newUserAuthToken = res.body.token;

        done();
      });
  });
});
