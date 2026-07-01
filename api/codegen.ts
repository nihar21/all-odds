import type { CodegenConfig } from '@graphql-codegen/cli';

/**
 * Generates strongly-typed resolver signatures from `schema.graphql` so the
 * resolver map is checked against the contract at build time. The same schema
 * file is the source of truth for the front-end's operation types
 * (see ../app/codegen.ts), keeping FE and BE in lockstep.
 */
const config: CodegenConfig = {
  schema: './src/schema.graphql',
  generates: {
    './src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        useIndexSignature: true,
        contextType: '../context.js#GraphQLContext',
        enumsAsTypes: false,
        scalars: { ID: 'string' },
      },
    },
  },
};

export default config;
