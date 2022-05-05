import "reflect-metadata";
import * as path from "path";
import * as cliProgress from "cli-progress";
import * as commander from "commander";
import chalk from "chalk";


import { createConnection, getConnection } from "typeorm";
import { Builder, fixturesIterator, Loader, Parser, Resolver } from "typeorm-fixtures-cli";

const debug = (message: string) => {
  if (commander.debug) {
    console.log(chalk.grey(message)); // tslint:disable-line
  }
};

const error = (message: string) => {
  console.log(chalk.red(message)); // tslint:disable-line
};

debug("Connection to database...");

createConnection()
  .then(async connection => {
    debug("Database is connected");

    // if (commander.sync) {
    //   debug("Synchronize database schema");
    //   await connection.synchronize(true);
    // }

    debug("Loading fixtureConfigs");
    const loader = new Loader();
    loader.load(path.resolve("./src/database/fixtures"));

    debug("Resolving fixtureConfigs");

    const resolver = new Resolver();
    const fixtures = resolver.resolve(loader.fixtureConfigs);
    const builder = new Builder(connection, new Parser());

    const bar = new cliProgress.Bar({
      format: `${chalk.yellow("Progress")}  ${chalk.green("[{bar}]")} ${chalk.yellow(
        "{percentage}% | ETA: {eta}s | {value}/{total} {name}",
      )} `,
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      fps: 5,
      stream: process.stdout,
      barsize: 50,
    });

    bar.start(fixtures.length, 0, { name: "" });

    for (const fixture of fixturesIterator(fixtures)) {
      const entity: any = await builder.build(fixture);

      try {
        bar.increment(1, { name: fixture.name });
        const repository = connection.getRepository(fixture.entity);

        const prevEntity = await repository.findOne(entity.id);
        if (!prevEntity) {
          await repository.insert(entity);
        } else {
          await repository.save(entity);
        }
      } catch (e) {
        bar.stop();
        throw e;
      }
    }

    bar.update(fixtures.length, { name: "" });
    bar.stop();

    debug("\nDatabase disconnect");
    await connection.close();
    process.exit(0);
  })
  .catch(async e => {
    error(`Fail fixture loading: ${ e.message}`);
    await getConnection().close();
    console.log(e); // tslint:disable-line
    process.exit(1);
  });
