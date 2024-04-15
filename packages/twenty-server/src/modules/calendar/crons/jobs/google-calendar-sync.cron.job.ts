import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, In } from 'typeorm';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { CalendarChannelRepository } from 'src/modules/calendar/repositories/calendar-channel.repository';
import { CalendarChannelObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-channel.object-metadata';
import { GoogleCalendarSyncService } from 'src/modules/calendar/services/google-calendar-sync.service';

@Injectable()
export class GoogleCalendarSyncCronJob implements MessageQueueJob<undefined> {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(DataSourceEntity, 'metadata')
    private readonly dataSourceRepository: Repository<DataSourceEntity>,
    @InjectObjectMetadataRepository(CalendarChannelObjectMetadata)
    private readonly calendarChannelRepository: CalendarChannelRepository,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    private readonly googleCalendarSyncService: GoogleCalendarSyncService,
  ) {}

  async handle(): Promise<void> {
    const workspaceIds = (
      await this.workspaceRepository.find({
        where: {
          subscriptionStatus: 'active',
        },
        select: ['id'],
      })
    ).map((workspace) => workspace.id);

    const workspacesWithFeatureFlagActive =
      await this.featureFlagRepository.find({
        where: {
          workspaceId: In(workspaceIds),
          key: FeatureFlagKeys.IsCalendarEnabled,
          value: true,
        },
      });

    const dataSources = await this.dataSourceRepository.find({
      where: {
        workspaceId: In(
          workspacesWithFeatureFlagActive.map((w) => w.workspaceId),
        ),
      },
    });

    const workspaceIdsWithDataSources = new Set(
      dataSources.map((dataSource) => dataSource.workspaceId),
    );

    for (const workspaceId of workspaceIdsWithDataSources) {
      await this.startWorkspaceGoogleCalendarSync(workspaceId);
    }
  }

  private async startWorkspaceGoogleCalendarSync(
    workspaceId: string,
  ): Promise<void> {
    const calendarChannels =
      await this.calendarChannelRepository.getAll(workspaceId);

    for (const calendarChannel of calendarChannels) {
      await this.googleCalendarSyncService.startGoogleCalendarSync(
        workspaceId,
        calendarChannel.connectedAccountId,
      );
    }
  }
}
