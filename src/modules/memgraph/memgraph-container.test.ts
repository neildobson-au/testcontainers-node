import neo4j from "neo4j-driver";
import { MemgraphContainer } from "./memgraph-container";

export const delay = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export const shortWait = () => delay(100000);

describe("Neo4jContainer", () => {
  jest.setTimeout(180_000);

  // createNode {
  it("should create a person node", async () => {
    const container = await new MemgraphContainer().start();
    await shortWait();
    const driver = neo4j.driver("bolt://localhost:7687");

    const session = driver.session();
    const personName = "Chris";
    const result = await session.run("CREATE (a:Person {name: $name}) RETURN a", { name: personName });
    const singleRecord = result.records[0];
    const node = singleRecord.get(0);
    expect(node.properties.name).toBe(personName);

    await session.close();
    await driver.close();
    await container.stop();
  });
  // }
});
