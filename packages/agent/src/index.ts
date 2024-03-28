import { TSchema } from '@servequery/datasource-customizer';

import Agent from './agent';
import { AgentOptions } from './types';

export function createAgent<S extends TSchema = TSchema>(options: AgentOptions): Agent<S> {
  return new Agent<S>(options);
}

export { Agent };
export { AgentOptions } from './types';
export * from '@servequery/datasource-customizer';

// export is necessary for the agent-generator package
export { default as SchemaGenerator } from './utils/servequery-schema/generator';
