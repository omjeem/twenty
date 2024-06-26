import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { FieldCurrencyValue } from '@/object-record/record-field/types/FieldMetadata';
import { CurrencyInput } from '@/ui/field/input/components/CurrencyInput';

import { FieldInputOverlay } from '../../../../../ui/field/input/components/FieldInputOverlay';
import { useCurrencyField } from '../../hooks/useCurrencyField';

import { FieldInputEvent } from './DateTimeFieldInput';

export type CurrencyFieldInputProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const CurrencyFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: CurrencyFieldInputProps) => {
  const {
    hotkeyScope,
    draftValue,
    persistCurrencyField,
    setDraftValue,
    defaultValue,
  } = useCurrencyField();

  const currencyCode =
    draftValue?.currencyCode ??
    ((defaultValue as FieldCurrencyValue).currencyCode.replace(
      /'/g,
      '',
    ) as CurrencyCode) ??
    CurrencyCode.USD;

  const handleEnter = (newValue: string) => {
    onEnter?.(() => {
      persistCurrencyField({
        amountText: newValue,
        currencyCode,
      });
    });
  };

  const handleEscape = (newValue: string) => {
    onEscape?.(() => {
      persistCurrencyField({
        amountText: newValue,
        currencyCode,
      });
    });
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newValue: string,
  ) => {
    onClickOutside?.(() => {
      persistCurrencyField({
        amountText: newValue,
        currencyCode,
      });
    });
  };

  const handleTab = (newValue: string) => {
    onTab?.(() => {
      persistCurrencyField({
        amountText: newValue,
        currencyCode,
      });
    });
  };

  const handleShiftTab = (newValue: string) => {
    onShiftTab?.(() =>
      persistCurrencyField({
        amountText: newValue,
        currencyCode,
      }),
    );
  };

  const handleChange = (newValue: string) => {
    setDraftValue({
      amount: newValue,
      currencyCode,
    });
  };

  const handleSelect = (newValue: string) => {
    setDraftValue({
      amount: draftValue?.amount ?? '',
      currencyCode: newValue as CurrencyCode,
    });
  };

  return (
    <FieldInputOverlay>
      <CurrencyInput
        value={draftValue?.amount?.toString() ?? ''}
        currencyCode={currencyCode}
        autoFocus
        placeholder="Currency"
        onClickOutside={handleClickOutside}
        onEnter={handleEnter}
        onEscape={handleEscape}
        onShiftTab={handleShiftTab}
        onTab={handleTab}
        onChange={handleChange}
        onSelect={handleSelect}
        hotkeyScope={hotkeyScope}
      />
    </FieldInputOverlay>
  );
};
