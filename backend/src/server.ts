import express from 'express';
import http from 'http';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';
import { buildAuthContext, GraphQLContext } from './middleware/auth';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    formatError: (formattedError, error) => {
      console.error('[GraphQL Error]:', formattedError.message);
      return formattedError;
    }
  });

  await server.start();

  app.use(cors());
  app.use(express.json());

  // Healthcheck endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'comperis-task-backend', timestamp: new Date().toISOString() });
  });

  // GraphQL endpoint
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => buildAuthContext(req)
    })
  );

  httpServer.listen(PORT, () => {
    console.log(`🚀 Multi-Tenant GraphQL Server ready at http://localhost:${PORT}/graphql`);
    console.log(`🩺 Health check available at http://localhost:${PORT}/health`);
  });
}

bootstrap().catch(err => {
  console.error('Fatal server bootstrap error:', err);
  process.exit(1);
});
