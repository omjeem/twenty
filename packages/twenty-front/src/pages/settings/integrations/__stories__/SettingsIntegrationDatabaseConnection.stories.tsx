import { Meta, StoryObj } from '@storybook/react';

import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SettingsIntegrationDatabaseConnection } from '~/pages/settings/integrations/SettingsIntegrationDatabaseConnection';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Integrations/SettingsIntegrationDatabaseConnection',
  component: SettingsIntegrationDatabaseConnection,
  decorators: [PageDecorator],
  args: {
    routePath: getSettingsPagePath(SettingsPath.IntegrationDatabaseConnection),
    routeParams: {
      ':databaseKey': 'postgresql',
      ':connectionId': '67cbfd35-8dd4-4591-b9d4-c1906281a5da',
    },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsIntegrationDatabaseConnection>;

export const Default: Story = {};
