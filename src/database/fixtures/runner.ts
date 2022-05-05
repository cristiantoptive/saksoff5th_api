import * as path from "path";
import { Builder, fixturesIterator, Loader, Parser, Resolver } from "typeorm-fixtures-cli/dist";
import { Connection, getRepository } from "typeorm";

export const loadFixtures = async(connection: Connection): Promise<any> => {
  try {
    const loader = new Loader();

    loader.load(path.resolve("./src/database/fixtures"));

    const resolver = new Resolver();
    const fixtures = resolver.resolve(loader.fixtureConfigs);
    const builder = new Builder(connection, new Parser());

    for (const fixture of fixturesIterator(fixtures)) {
      const entity = await builder.build(fixture);
      const repository = getRepository(entity.constructor.name);

      try {
        const prevEntity = await repository.findOne(entity.id);
        if (!prevEntity) {
          await repository.insert(entity);
        } else {
          await repository.save(entity);
        }
      } catch (e) {
        console.log("error saving fixture entity", entity);
        throw e;
      }
    }
  } catch (e) {
    console.log("error running fixtures", e);
    process.exit(0);
  }
};
