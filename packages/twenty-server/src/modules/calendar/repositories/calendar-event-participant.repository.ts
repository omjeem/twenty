import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import differenceWith from 'lodash.differencewith';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { CalendarEventParticipantObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event-participant.object-metadata';
import { getFlattenedValuesAndValuesStringForBatchRawQuery } from 'src/modules/calendar/utils/getFlattenedValuesAndValuesStringForBatchRawQuery.util';
import {
  CalendarEventParticipant,
  CalendarEventParticipantWithId,
} from 'src/modules/calendar/types/calendar-event';

@Injectable()
export class CalendarEventParticipantRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getByHandles(
    handles: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<CalendarEventParticipantObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."calendarEventParticipant" WHERE "handle" = ANY($1)`,
      [handles],
      workspaceId,
      transactionManager,
    );
  }

  public async updateParticipantsPersonId(
    participantIds: string[],
    personId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."calendarEventParticipant" SET "personId" = $1 WHERE "id" = ANY($2)`,
      [personId, participantIds],
      workspaceId,
      transactionManager,
    );
  }

  public async updateParticipantsWorkspaceMemberId(
    participantIds: string[],
    workspaceMemberId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."calendarEventParticipant" SET "workspaceMemberId" = $1 WHERE "id" = ANY($2)`,
      [workspaceMemberId, participantIds],
      workspaceId,
      transactionManager,
    );
  }

  public async removePersonIdByHandle(
    handle: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."calendarEventParticipant" SET "personId" = NULL WHERE "handle" = $1`,
      [handle],
      workspaceId,
      transactionManager,
    );
  }

  public async removeWorkspaceMemberIdByHandle(
    handle: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."calendarEventParticipant" SET "workspaceMemberId" = NULL WHERE "handle" = $1`,
      [handle],
      workspaceId,
      transactionManager,
    );
  }

  public async getByIds(
    calendarEventParticipantIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<CalendarEventParticipantObjectMetadata>[]> {
    if (calendarEventParticipantIds.length === 0) {
      return [];
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."calendarEventParticipant" WHERE "id" = ANY($1)`,
      [calendarEventParticipantIds],
      workspaceId,
      transactionManager,
    );
  }

  public async getByCalendarEventIds(
    calendarEventIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<CalendarEventParticipantObjectMetadata>[]> {
    if (calendarEventIds.length === 0) {
      return [];
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."calendarEventParticipant" WHERE "calendarEventId" = ANY($1)`,
      [calendarEventIds],
      workspaceId,
      transactionManager,
    );
  }

  public async deleteByIds(
    calendarEventParticipantIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    if (calendarEventParticipantIds.length === 0) {
      return;
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `DELETE FROM ${dataSourceSchema}."calendarEventParticipant" WHERE "id" = ANY($1)`,
      [calendarEventParticipantIds],
      workspaceId,
      transactionManager,
    );
  }

  public async updateCalendarEventParticipantsAndReturnNewOnes(
    calendarEventParticipants: CalendarEventParticipant[],
    iCalUIDCalendarEventIdMap: Map<string, string>,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<CalendarEventParticipant[]> {
    if (calendarEventParticipants.length === 0) {
      return [];
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const calendarEventIds = Array.from(iCalUIDCalendarEventIdMap.values());

    const existingCalendarEventParticipants = await this.getByCalendarEventIds(
      calendarEventIds,
      workspaceId,
      transactionManager,
    );

    const calendarEventParticipantsToDelete = differenceWith(
      existingCalendarEventParticipants,
      calendarEventParticipants,
      (existingCalendarEventParticipant, calendarEventParticipant) =>
        existingCalendarEventParticipant.handle ===
        calendarEventParticipant.handle,
    );

    const newCalendarEventParticipants = differenceWith(
      calendarEventParticipants,
      existingCalendarEventParticipants,
      (calendarEventParticipant, existingCalendarEventParticipant) =>
        calendarEventParticipant.handle ===
        existingCalendarEventParticipant.handle,
    );

    await this.deleteByIds(
      calendarEventParticipantsToDelete.map(
        (calendarEventParticipant) => calendarEventParticipant.id,
      ),
      workspaceId,
      transactionManager,
    );

    const values = calendarEventParticipants.map(
      (calendarEventParticipant) => ({
        ...calendarEventParticipant,
        calendarEventId: iCalUIDCalendarEventIdMap.get(
          calendarEventParticipant.iCalUID,
        ),
      }),
    );

    const { flattenedValues, valuesString } =
      getFlattenedValuesAndValuesStringForBatchRawQuery(values, {
        calendarEventId: 'uuid',
        handle: 'text',
        displayName: 'text',
        isOrganizer: 'boolean',
        responseStatus: `${dataSourceSchema}."calendarEventParticipant_responsestatus_enum"`,
      });

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."calendarEventParticipant" AS "calendarEventParticipant"
      SET "displayName" = "newValues"."displayName",
      "isOrganizer" = "newValues"."isOrganizer",
      "responseStatus" = "newValues"."responseStatus"
      FROM (VALUES ${valuesString}) AS "newValues"("calendarEventId", "handle", "displayName", "isOrganizer", "responseStatus")
      WHERE "calendarEventParticipant"."handle" = "newValues"."handle"
      AND "calendarEventParticipant"."calendarEventId" = "newValues"."calendarEventId"`,
      flattenedValues,
      workspaceId,
      transactionManager,
    );

    return newCalendarEventParticipants;
  }

  public async getWithoutPersonIdAndWorkspaceMemberId(
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<CalendarEventParticipantWithId[]> {
    if (!workspaceId) {
      throw new Error('WorkspaceId is required');
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const calendarEventParticipants: CalendarEventParticipantWithId[] =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT "calendarEventParticipant".*
        FROM ${dataSourceSchema}."calendarEventParticipant" AS "calendarEventParticipant"
        WHERE "calendarEventParticipant"."personId" IS NULL
        AND "calendarEventParticipant"."workspaceMemberId" IS NULL`,
        [],
        workspaceId,
        transactionManager,
      );

    return calendarEventParticipants;
  }

  public async getByCalendarChannelIdWithoutPersonIdAndWorkspaceMemberId(
    calendarChannelId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<CalendarEventParticipantWithId[]> {
    if (!workspaceId) {
      throw new Error('WorkspaceId is required');
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const calendarEventParticipants: CalendarEventParticipantWithId[] =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT "calendarEventParticipant".*
        FROM ${dataSourceSchema}."calendarEventParticipant" AS "calendarEventParticipant"
        LEFT JOIN ${dataSourceSchema}."calendarEvent" AS "calendarEvent" ON "calendarEventParticipant"."calendarEventId" = "calendarEvent"."id"
        LEFT JOIN ${dataSourceSchema}."calendarChannelEventAssociation" AS "calendarChannelEventAssociation" ON "calendarEvent"."id" = "calendarChannelEventAssociation"."calendarEventId"
        WHERE "calendarChannelEventAssociation"."calendarChannelId" = $1
        AND "calendarEventParticipant"."personId" IS NULL
        AND "calendarEventParticipant"."workspaceMemberId" IS NULL`,
        [calendarChannelId],
        workspaceId,
        transactionManager,
      );

    return calendarEventParticipants;
  }
}
