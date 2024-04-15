import { YogaDriverConfig } from '@graphql-yoga/nestjs';
import GraphQLJSON from 'graphql-type-json';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { ExceptionHandlerService } from 'src/engine/integrations/exception-handler/exception-handler.service';
import { useExceptionHandler } from 'src/engine/integrations/exception-handler/hooks/use-exception-handler.hook';
import { useThrottler } from 'src/engine/api/graphql/graphql-config/hooks/use-throttler';
import { MetadataGraphQLApiModule } from 'src/engine/api/graphql/metadata-graphql-api.module';
import { renderApolloPlayground } from 'src/engine/utils/render-apollo-playground.util';
import { DataloaderService } from 'src/engine/dataloaders/dataloader.service';

export const metadataModuleFactory = async (
  environmentService: EnvironmentService,
  exceptionHandlerService: ExceptionHandlerService,
  dataloaderService: DataloaderService,
): Promise<YogaDriverConfig> => {
  const config: YogaDriverConfig = {
    autoSchemaFile: true,
    include: [MetadataGraphQLApiModule],
    renderGraphiQL() {
      return renderApolloPlayground({ path: 'metadata' });
    },
    resolvers: { JSON: GraphQLJSON },
    plugins: [
      useThrottler({
        ttl: environmentService.get('API_RATE_LIMITING_TTL'),
        limit: environmentService.get('API_RATE_LIMITING_LIMIT'),
        identifyFn: (context) => {
          return context.req.user?.id ?? context.req.ip ?? 'anonymous';
        },
      }),
      useExceptionHandler({
        exceptionHandlerService,
      }),
    ],
    path: '/metadata',
    context: () => ({
      loaders: dataloaderService.createLoaders(),
    }),
  };

  if (environmentService.get('DEBUG_MODE')) {
    config.renderGraphiQL = () => {
      return renderApolloPlayground({ path: 'metadata' });
    };
  }

  return config;
};
