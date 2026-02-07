/**
 * GraphQL Code Generator Configuration.
 * 
 * Generates TypeScript types from GraphQL schema and operations.
 * 
 * Run: npm run codegen
 */

import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    schema: {
        'http://localhost:8001/graphql': {
            headers: {
                'X-API-Key': 'dev-key-123',
            },
        },
    },
    documents: 'src/graphql/**/*.ts',
    generates: {
        'src/graphql/generated.ts': {
            plugins: [
                'typescript',
                'typescript-operations',
                'typescript-react-apollo',
            ],
            config: {
                withHooks: true,
                withComponent: false,
                withHOC: false,
                skipTypename: false,
                enumsAsTypes: true,
                dedupeFragments: true,
                avoidOptionals: {
                    field: false,
                    inputValue: false,
                    object: false,
                    defaultValue: false,
                },
            },
        },
    },
};

export default config;
