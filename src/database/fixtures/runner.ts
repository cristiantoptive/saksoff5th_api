import * as path from "path";
import { Builder, fixturesIterator, Loader, Parser, Resolver } from "typeorm-fixtures-cli/dist";
import { Connection, getRepository } from "typeorm";

export const loadFixtures = async(connection: Connection): Promise<any> => {
  const loader = new Loader();

  loader.load(path.resolve("./src/database/fixtures"));

  const resolver = new Resolver();
  const fixtures = resolver.resolve(loader.fixtureConfigs);
  const builder = new Builder(connection, new Parser());

  for (const fixture of fixturesIterator(fixtures)) {
    const entity = await builder.build(fixture);
    await getRepository(entity.constructor.name).save(entity);
  }
};
