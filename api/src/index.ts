import './env.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { config } from './config.js';
import { createContext, type GraphQLContext } from './context.js';
import { resolvers } from './resolvers/index.js';

// Load the SDL at runtime so `schema.graphql` is the single source of truth
// (shared with codegen) rather than a stringified copy in TS.
const typeDefs = readFileSync(
  fileURLToPath(new URL('./schema.graphql', import.meta.url)),
  'utf8',
);

const server = new ApolloServer<GraphQLContext>({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
  context: async () => createContext(),
  listen: { port: config.port },
});

console.log(`🟢 AllOdds GraphQL server ready at ${url}`);
