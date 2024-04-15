import { Nullable } from 'twenty-ui';

import { DateInput } from '@/ui/field/input/components/DateInput';

import { usePersistField } from '../../../hooks/usePersistField';
import { useDateTimeField } from '../../hooks/useDateTimeField';

export type FieldInputEvent = (persist: () => void) => void;

export type DateTimeFieldInputProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
};

export const DateTimeFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
}: DateTimeFieldInputProps) => {
  const { fieldValue, hotkeyScope, clearable, setDraftValue } =
    useDateTimeField();

  const persistField = usePersistField();

  const persistDate = (newDate: Nullable<Date>) => {
    if (!newDate) {
      persistField(null);
    } else {
      const newDateISO = newDate?.toISOString();

      persistField(newDateISO);
    }
  };

  const handleEnter = (newDate: Nullable<Date>) => {
    onEnter?.(() => persistDate(newDate));
  };

  const handleEscape = (newDate: Nullable<Date>) => {
    onEscape?.(() => persistDate(newDate));
  };

  const handleClickOutside = (
    _event: MouseEvent | TouchEvent,
    newDate: Nullable<Date>,
  ) => {
    onClickOutside?.(() => persistDate(newDate));
  };

  const handleChange = (newDate: Nullable<Date>) => {
    setDraftValue(newDate?.toDateString() ?? '');
  };

  const dateValue = fieldValue ? new Date(fieldValue) : null;

  return (
    <DateInput
      hotkeyScope={hotkeyScope}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      value={dateValue}
      clearable={clearable}
      onChange={handleChange}
      isDateTimeInput
    />
  );
};
