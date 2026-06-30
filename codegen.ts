import type { CodegenConfig } from '@graphql-codegen/cli';

/**
 * Front-end codegen. Reads the SAME schema the backend serves
 * (`server/src/schema.graphql`) plus the app's `.graphql` operation documents,
 * and emits fully-typed operations + a `TypedDocumentNode` per query into
 * `src/lib/graphql/generated.ts`. This is the FE half of the "shared types"
 * task — FE and BE are generated from one contract, so they cannot drift.
 *
 * Run with `npm run codegen` (dev-time only; the generated file is committed so
 * the production build never depends on codegen running).
 */
const config: CodegenConfig = {
  schema: './server/src/schema.graphql',
  documents: ['./src/**/*.graphql'],
  generates: {
    './src/lib/graphql/generated.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        scalars: { ID: 'string' },
      },
    },
  },
};

export default config;
