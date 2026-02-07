/**
 * Apollo Client Configuration for GraphQL.
 * 
 * Provides type-safe GraphQL queries with automatic caching.
 */

import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Auth link to add API key header
const authLink = setContext((_, { headers }) => {
    return {
        headers: {
            ...headers,
            'X-API-Key': import.meta.env.VITE_API_KEY || '',
        }
    };
});

// HTTP link to GraphQL endpoint
const httpLink = new HttpLink({
    uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8001/graphql',
    credentials: 'include',
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache({
        typePolicies: {
            Property: {
                keyFields: ['id'],
                fields: {
                    // Cache P&L analysis by strategy
                    pnlAnalysis: {
                        keyArgs: ['strategy', 'downPaymentPct'],
                    },
                    // Cache comps by radius
                    comps: {
                        keyArgs: ['radiusMiles', 'limit'],
                    },
                },
            },
            Neighborhood: {
                keyFields: ['id'],
            },
        },
    }),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-and-network',
            errorPolicy: 'all',
        },
        query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
        },
        mutate: {
            errorPolicy: 'all',
        },
    },
});

// Export for use in components
export default apolloClient;
