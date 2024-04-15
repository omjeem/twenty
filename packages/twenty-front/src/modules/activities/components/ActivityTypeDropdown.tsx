import { useTheme } from '@emotion/react';
import { useRecoilState } from 'recoil';
import {
  Chip,
  ChipAccent,
  ChipSize,
  ChipVariant,
  IconCheckbox,
  IconNotes,
} from 'twenty-ui';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

type ActivityTypeDropdownProps = {
  activityId: string;
};

export const ActivityTypeDropdown = ({
  activityId,
}: ActivityTypeDropdownProps) => {
  const [activityInStore] = useRecoilState(recordStoreFamilyState(activityId));

  const theme = useTheme();

  return (
    <Chip
      label={activityInStore?.type}
      leftComponent={
        activityInStore?.type === 'Note' ? (
          <IconNotes size={theme.icon.size.md} />
        ) : (
          <IconCheckbox size={theme.icon.size.md} />
        )
      }
      size={ChipSize.Large}
      accent={ChipAccent.TextSecondary}
      variant={ChipVariant.Highlighted}
    />
  );
};
