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

let newProductId: string;

describe("App should return existing products from fixtures", () => {
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

  it("App should return all active existing products from db", (done) => {
    request(express)
      .get("/api/products")
      .accept("application/json")
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toHaveLength(1); // only 1 product is active on current fixtures

        done();
      });
  });

  it("Create new product should return a 403 for non authorized users", (done) => {
    request(express)
      .post("/api/products")
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

  it("Create new product should must validate body for authorized users", (done) => {
    request(express)
      .post("/api/products")
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
        expect(res.body.errors.SKU).toBeDefined();
        expect(res.body.errors.title).toBeDefined();
        expect(res.body.errors.price).toBeDefined();
        expect(res.body.errors.inventory).toBeDefined();
        expect(res.body.errors.deliveryTime).toBeDefined();
        expect(res.body.errors.isActive).toBeDefined();
        expect(res.body.errors.category).toBeDefined();
        expect(res.body.errors.vendor).toBeDefined();

        done();
      });
  });

  it("Create new product should work for valid body and authorized user", (done) => {
    request(express)
      .post("/api/products")
      .auth(merchandiserAuthToken, { type: "bearer" })
      .accept("application/json")
      .send({
        SKU: "NEW_PRODUCT",
        title: "New Product",
        description: "Some new product",
        price: 75.00,
        inventory: 10,
        deliveryTime: "1 - 3 weeks",
        isActive: true,
        vendor: "028987da-de88-4714-ab15-8c6f487a18bf", // this vendor was created by the authenticated merchandiser
        category: "c29974a0-8190-414a-b64f-d571fcc56082",
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.id).toBeDefined();
        expect(res.body.SKU).toBe("NEW_PRODUCT");
        expect(res.body.title).toBe("New Product");
        expect(res.body.description).toBe("Some new product");
        expect(res.body.price).toBe(75.00);
        expect(res.body.inventory).toBe(10);
        expect(res.body.deliveryTime).toBe("1 - 3 weeks");
        expect(res.body.isActive).toBe(true);
        expect(res.body.vendor).toBeDefined();
        expect(res.body.vendor.id).toBe("028987da-de88-4714-ab15-8c6f487a18bf");
        expect(res.body.category).toBeDefined();
        expect(res.body.category.id).toBe("c29974a0-8190-414a-b64f-d571fcc56082");

        newProductId = res.body.id;

        done();
      });
  });

  it("Create new product should validate if the target vendor belongs to the authenticated merchandiser user", (done) => {
    request(express)
      .post("/api/products")
      .auth(merchandiserAuthToken, { type: "bearer" })
      .accept("application/json")
      .send({
        SKU: "NEW_PRODUCT",
        title: "New Product",
        description: "Some new product",
        price: 75.00,
        inventory: 10,
        deliveryTime: "1 - 3 weeks",
        isActive: true,
        vendor: "dce40f78-f11d-4477-b0db-00e22488aad9", // this vendor doen't belongs to the authenticated merchandiser
        category: "c29974a0-8190-414a-b64f-d571fcc56082",
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
        expect(res.body.errors.vendor).toBeDefined();
        expect(res.body.errors.vendor.entityMustExists).toBeDefined();

        done();
      });
  });

  it("App should return existing and new product by id from db", (done) => {
    request(express)
      .get(`/api/products/${newProductId}`)
      .accept("application/json")
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body).toBeDefined();
        expect(res.body.id).toBe(newProductId);
        expect(res.body.SKU).toBe("NEW_PRODUCT");
        expect(res.body.title).toBe("New Product");
        expect(res.body.description).toBe("Some new product");
        expect(res.body.price).toBe(75.00);
        expect(res.body.inventory).toBe(10);
        expect(res.body.deliveryTime).toBe("1 - 3 weeks");
        expect(res.body.isActive).toBe(true);
        expect(res.body.vendor).toBeDefined();
        expect(res.body.vendor.id).toBe("028987da-de88-4714-ab15-8c6f487a18bf");
        expect(res.body.category).toBeDefined();
        expect(res.body.category.id).toBe("c29974a0-8190-414a-b64f-d571fcc56082");

        done();
      });
  });

  // SEGUIR E ACA
  // it("Update vendor should return a 403 for non authorized users", (done) => {
  //   request(express)
  //     .put(`/api/products/${newProductId}`)
  //     .auth(nonMerchandiserAuthToken, { type: "bearer" })
  //     .accept("application/json")
  //     .expect(403)
  //     .end((err, res) => {
  //       if (err) {
  //         done(err);
  //         return;
  //       }

  //       expect(res.body).toBeDefined();
  //       expect(res.body.name).toBe("AccessDeniedError");

  //       done();
  //     });
  // });

  // it("Update vendor should work for valid body and authorized user", (done) => {
  //   request(express)
  //     .put(`/api/products/${newProductId}`)
  //     .auth(merchandiserAuthToken, { type: "bearer" })
  //     .accept("application/json")
  //     .send({
  //       name: "New Vendor Updated",
  //     })
  //     .expect(200)
  //     .end((err, res) => {
  //       if (err) {
  //         done(err);
  //         return;
  //       }

  //       expect(res.body).toBeDefined();
  //       expect(res.body.id).toBeDefined();
  //       expect(res.body.name).toBe("New Vendor Updated");
  //       expect(res.body.code).toBe("NEW_VENDOR_UPDATED");

  //       done();
  //     });
  // });

  // it("Delete vendor should return a 403 for non authorized users", (done) => {
  //   request(express)
  //     .delete(`/api/products/${newProductId}`)
  //     .auth(nonMerchandiserAuthToken, { type: "bearer" })
  //     .accept("application/json")
  //     .expect(403)
  //     .end((err, res) => {
  //       if (err) {
  //         done(err);
  //         return;
  //       }

  //       expect(res.body).toBeDefined();
  //       expect(res.body.name).toBe("AccessDeniedError");

  //       done();
  //     });
  // });

  // it("Delete vendor should work for valid body and authorized user", (done) => {
  //   request(express)
  //     .delete(`/api/products/${newProductId}`)
  //     .auth(merchandiserAuthToken, { type: "bearer" })
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

  // it("App should return a 404 for non-existing (or deleted) vendor", (done) => {
  //   request(express)
  //     .get(`/api/products/${newProductId}`)
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
