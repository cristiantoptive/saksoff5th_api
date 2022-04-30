import request from "supertest";
import { Express } from "express-serve-static-core";
import { Connection } from "typeorm";
import { loadFixtures } from "../src/database/fixtures/runner";
import app from "../src/app";

let express: Express;
let connection: Connection;

describe("App should return existing categories from fixtures", () => {
  beforeAll(async() => {
    ({ express, connection } = await app as any);

    // clear database
    await connection.dropDatabase();
    await connection.runMigrations();

    // run fixtures
    await loadFixtures(connection);
  });

  afterAll(async() => {
    await connection.close();
    await (express as any).stop();
  });

  it("should return 200", (done) => {
    request(express)
      .get("/api/categories")
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.body)
          .toHaveLength(3);

        done();
      });
  });
});
