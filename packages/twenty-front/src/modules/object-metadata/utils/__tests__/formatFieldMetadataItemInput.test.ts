import { FieldMetadataType } from '~/generated-metadata/graphql.ts';

import {
  formatFieldMetadataItemInput,
  getOptionValueFromLabel,
} from '../formatFieldMetadataItemInput';

describe('getOptionValueFromLabel', () => {
  it('should return the option value from the label', () => {
    const label = 'Example Label';
    const expected = 'EXAMPLE_LABEL';

    const result = getOptionValueFromLabel(label);

    expect(result).toEqual(expected);
  });

  it('should handle labels with accents', () => {
    const label = 'Éxàmplè Làbèl';
    const expected = 'EXAMPLE_LABEL';

    const result = getOptionValueFromLabel(label);

    expect(result).toEqual(expected);
  });

  it('should handle labels with special characters', () => {
    const label = 'Example!@#$%^&*() Label';
    const expected = 'EXAMPLE_LABEL';

    const result = getOptionValueFromLabel(label);

    expect(result).toEqual(expected);
  });

  it('should handle labels with emojis', () => {
    const label = '📱 Example Label';
    const expected = 'EXAMPLE_LABEL';

    const result = getOptionValueFromLabel(label);

    expect(result).toEqual(expected);
  });
});

describe('formatFieldMetadataItemInput', () => {
  it('should format the field metadata item input correctly', () => {
    const input = {
      label: 'Example Label',
      icon: 'example-icon',
      type: FieldMetadataType.Select,
      description: 'Example description',
      options: [
        { id: '1', label: 'Option 1', color: 'red' as const, isDefault: true },
        { id: '2', label: 'Option 2', color: 'blue' as const },
      ],
    };

    const expected = {
      description: 'Example description',
      icon: 'example-icon',
      label: 'Example Label',
      name: 'exampleLabel',
      options: [
        {
          id: '1',
          label: 'Option 1',
          color: 'red',
          position: 0,
          value: 'OPTION_1',
        },
        {
          id: '2',
          label: 'Option 2',
          color: 'blue',
          position: 1,
          value: 'OPTION_2',
        },
      ],
      defaultValue: "'OPTION_1'",
    };

    const result = formatFieldMetadataItemInput(input);

    expect(result).toEqual(expected);
  });

  it('should handle input without options', () => {
    const input = {
      label: 'Example Label',
      icon: 'example-icon',
      type: FieldMetadataType.Select,
      description: 'Example description',
    };

    const expected = {
      description: 'Example description',
      icon: 'example-icon',
      label: 'Example Label',
      name: 'exampleLabel',
      options: undefined,
      defaultValue: undefined,
    };

    const result = formatFieldMetadataItemInput(input);

    expect(result).toEqual(expected);
  });

  it('should format the field metadata item multi select input correctly', () => {
    const input = {
      label: 'Example Label',
      icon: 'example-icon',
      type: FieldMetadataType.MultiSelect,
      description: 'Example description',
      options: [
        { id: '1', label: 'Option 1', color: 'red' as const, isDefault: true },
        { id: '2', label: 'Option 2', color: 'blue' as const, isDefault: true },
      ],
    };

    const expected = {
      description: 'Example description',
      icon: 'example-icon',
      label: 'Example Label',
      name: 'exampleLabel',
      options: [
        {
          id: '1',
          label: 'Option 1',
          color: 'red',
          position: 0,
          value: 'OPTION_1',
        },
        {
          id: '2',
          label: 'Option 2',
          color: 'blue',
          position: 1,
          value: 'OPTION_2',
        },
      ],
      defaultValue: ["'OPTION_1'", "'OPTION_2'"],
    };

    const result = formatFieldMetadataItemInput(input);

    expect(result).toEqual(expected);
  });

  it('should handle multi select input without options', () => {
    const input = {
      label: 'Example Label',
      icon: 'example-icon',
      type: FieldMetadataType.MultiSelect,
      description: 'Example description',
    };

    const expected = {
      description: 'Example description',
      icon: 'example-icon',
      label: 'Example Label',
      name: 'exampleLabel',
      options: undefined,
      defaultValue: undefined,
    };

    const result = formatFieldMetadataItemInput(input);

    expect(result).toEqual(expected);
  });
});
