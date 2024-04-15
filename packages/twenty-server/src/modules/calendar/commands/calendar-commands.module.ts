import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { GoogleCalendarSyncCommand } from 'src/modules/calendar/commands/google-calendar-sync.command';
import { CalendarChannelObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-channel.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountObjectMetadata,
      CalendarChannelObjectMetadata,
    ]),
  ],
  providers: [GoogleCalendarSyncCommand],
})
export class CalendarCommandsModule {}
