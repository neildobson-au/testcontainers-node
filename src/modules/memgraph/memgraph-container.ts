import { GenericContainer, Wait } from "../..";
import { StartedTestContainer } from "../../test-container";
import { AbstractStartedContainer } from "../abstract-started-container";

const BOLT_PORT = 7687;
const HTTP_PORT = 7474;
const USERNAME = "memgraph";

export class MemgraphContainer extends GenericContainer {
  private password = "test";
  private driverVersion?: string;

  constructor(image = "memgraph/memgraph-platform") {
    super(image);
  }

  public withPassword(password: string): this {
    this.password = password;
    return this;
  }

  public WithDriverVersion(driverVersion = "5.6.0"): this {
    this.driverVersion = driverVersion;
    return this;
  }

  public override async start(): Promise<StartedMemgraphContainer> {
    this.withExposedPorts(...(this.hasExposedPorts ? this.opts.exposedPorts : [BOLT_PORT, HTTP_PORT, 3000]))
      .withWaitStrategy(Wait.forLogMessage("memgraph entered RUNNING state,"))
      .withEntrypoint(["/usr/bin/supervisord"])
      .withEnvironment({ MEMGRAPH: `--log-level=TRACE --bolt-server-name-for-init=Neo4j/${this.driverVersion}}` })
      // .withEnvironment({ MEMGRAPH_USER: USERNAME })
      // .withEnvironment({ MEMGRAPH_PASSWORD: this.password })
      .withStartupTimeout(120_000);

    return new StartedMemgraphContainer(await super.start(), this.password);
  }
}

export class StartedMemgraphContainer extends AbstractStartedContainer {
  private readonly boltPort: number;
  private readonly httpPort: number;

  constructor(startedTestContainer: StartedTestContainer, private readonly password: string) {
    super(startedTestContainer);
    this.boltPort = this.startedTestContainer.getMappedPort(BOLT_PORT);
    this.httpPort = this.startedTestContainer.getMappedPort(HTTP_PORT);
  }

  public getBoltUri(): string {
    return `bolt://${this.getHost()}:${this.boltPort}/`;
  }

  public getHttpUri(): string {
    return `http://${this.getHost()}:${this.httpPort}/`;
  }

  public getPassword(): string {
    return this.password;
  }

  public getUsername(): string {
    return USERNAME;
  }
}
