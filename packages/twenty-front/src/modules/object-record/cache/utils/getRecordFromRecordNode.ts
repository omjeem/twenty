import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const getRecordFromRecordNode = <T extends ObjectRecord>({
  recordNode,
}: {
  recordNode: T;
}): T => {
  return {
    ...Object.fromEntries(
      Object.entries(recordNode).map(([fieldName, value]) => {
        if (isUndefinedOrNull(value)) {
          return [fieldName, value];
        }

        if (Array.isArray(value)) {
          return [fieldName, value];
        }

        if (typeof value !== 'object') {
          return [fieldName, value];
        }

        return isDefined(value.edges)
          ? [
              fieldName,
              getRecordsFromRecordConnection({ recordConnection: value }),
            ]
          : [fieldName, getRecordFromRecordNode<T>({ recordNode: value })];
      }),
    ),
    id: recordNode.id,
  } as T;
};
