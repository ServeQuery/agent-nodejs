import type { PrimitiveTypes } from '@servequery/datasource-toolkit';

export type ServeQuery = {
  collections: ServeQueryServerCollection[];
  meta: {
    liana: string;
    liana_version: string;
    liana_features: Record<string, string> | null;
    stack: {
      engine: string;
      engine_version: string;
    };
  };
};

export type ServeQueryServerColumnType =
  | PrimitiveTypes
  | [ServeQueryServerColumnType]
  | { fields: Array<{ field: string; type: ServeQueryServerColumnType }> };

export type ServeQueryServerCollection = {
  name: string;
  icon: null;
  integration: null;
  isReadOnly: boolean;
  isSearchable: boolean;
  isVirtual: false;
  onlyForRelationships: boolean;
  paginationType: 'page';
  actions: Array<ServeQueryServerAction>;
  fields: Array<ServeQueryServerField>;
  segments: Array<ServeQueryServerSegment>;
};

export type ServeQueryServerAction = {
  id: string;
  name: string;
  type: 'single' | 'bulk' | 'global';
  baseUrl: string;
  endpoint: string;
  httpMethod: 'POST';
  redirect: unknown;
  download: boolean;
  fields: ServeQueryServerActionField[];
  hooks: {
    load: boolean;
    change: Array<unknown>;
  };
};

export type ServeQueryServerActionFieldWidgetEditBase<TType = string, TConfig = unknown> = {
  name: TType;
  parameters: TConfig;
};

export type WidgetEditConfiguration = {
  name: string;
  parameters: Record<string, unknown>;
};
type ServeQueryServerActionFieldType = ServeQueryServerColumnType | 'File' | ['File'];

export type ServeQueryServerActionFieldCommon<
  TType extends ServeQueryServerActionFieldType = ServeQueryServerActionFieldType,
  TWidgetEdit extends WidgetEditConfiguration | null = null,
> = {
  type: TType;
  value: unknown;
  defaultValue: unknown;
  description: string | null;
  field: string;
  hook: string;
  isReadOnly: boolean;
  isRequired: boolean;
  enums: null | string[];
  widgetEdit: TWidgetEdit;
};

export type ServeQueryServerActionFieldBase = ServeQueryServerActionFieldCommon & {
  reference: string | null;
};

type ServeQueryServerActionFieldLimitedValueOptions<
  TName extends string,
  TValue = string,
  TParameters = Record<string, never>,
> = {
  name: TName;
  parameters: {
    static: {
      options: Array<{ label: string; value: TValue } | TValue>;
    };
  } & TParameters;
};

export type ServeQueryServerActionFieldDropdownOptions<TValue = string> =
  ServeQueryServerActionFieldLimitedValueOptions<
    'dropdown',
    TValue,
    {
      placeholder?: string | null;
      isSearchable?: boolean;
      searchType?: 'dynamic';
    }
  >;

export type ServeQueryServerActionFieldRadioButtonOptions<TValue = string> =
  ServeQueryServerActionFieldLimitedValueOptions<'radio button', TValue>;

export type ServeQueryServerActionFieldCheckboxGroupOptions<TValue = string> =
  ServeQueryServerActionFieldLimitedValueOptions<'checkboxes', TValue>;

export type ServeQueryServerActionFieldCheckboxOptions = {
  name: 'boolean editor';
  parameters: Record<string, never>;
};

export type ServeQueryServerActionFieldTextInputOptions = {
  name: 'text editor';
  parameters: {
    placeholder?: string | null;
  };
};

export type ServeQueryServerActionFieldAddressAutocompleteOptions = {
  name: 'address editor';
  parameters: {
    placeholder?: string | null;
  };
};

export type ServeQueryServerActionFieldDatePickerInputOptions = {
  name: 'date editor';
  parameters: {
    format?: string | null;
    placeholder?: string | null;
    minDate?: string;
    maxDate?: string;
  };
};

export type ServeQueryServerActionFieldTextInputListOptions = {
  name: 'input array';
  parameters: {
    placeholder?: string | null;
    enableReorder?: boolean;
    allowDuplicate?: boolean;
    allowEmptyValue?: boolean;
  };
};

export type ServeQueryServerActionFieldTextAreaOptions = {
  name: 'text area editor';
  parameters: {
    placeholder?: string | null;
    rows?: number;
  };
};

export type ServeQueryServerActionFieldRichTextOptions = {
  name: 'rich text';
  parameters: {
    placeholder?: string | null;
  };
};

export type ServeQueryServerActionFieldTimePickerOptions = {
  name: 'time editor';
  parameters: Record<string, never>;
};

export type ServeQueryServerActionFieldNumberInputOptions = {
  name: 'number input';
  parameters: {
    placeholder?: string | null;
    min?: number;
    max?: number;
    step?: number;
  };
};

export type ServeQueryServerActionFieldNumberInputListOptions = {
  name: 'input array';
  parameters: {
    placeholder?: string | null;
    enableReorder?: boolean;
    allowDuplicate?: boolean;
    min?: number;
    max?: number;
    step?: number;
  };
};

export type ServeQueryServerActionFieldColorPickerOptions = {
  name: 'color editor';
  parameters: {
    placeholder?: string | null;
    enableOpacity?: boolean;
    quickPalette?: string[];
  };
};

export type ServeQueryServerActionFieldCurrencyInputOptions = {
  name: 'price editor';
  parameters: {
    placeholder?: string | null;
    min?: number;
    max?: number;
    step?: number;
    currency: string;
    base: 'Unit' | 'Cents';
  };
};

export type ServeQueryServerActionFieldUserDropdown = {
  name: 'assignee editor';
  parameters: {
    placeholder?: string | null;
  };
};

export type ServeQueryServerActionFieldJsonEditorOptions = {
  name: 'json code editor';
  parameters: Record<string, never>;
};

export type ServeQueryServerActionFieldFilePickerOptions = {
  name: 'file picker';
  parameters: {
    // the prefix is useless in smart actions as it can be added in the execute as needed
    prefix: null;
    filesCountLimit: number | null;
    filesExtensions: string[] | null;
    filesSizeLimit: number | null;
  };
};

export type ServeQueryServerActionFieldDropdown =
  | ServeQueryServerActionFieldCommon<
    'String' | 'Dateonly' | 'Date' | 'Time',
    ServeQueryServerActionFieldDropdownOptions<string>
  >
  | ServeQueryServerActionFieldCommon<['String'], ServeQueryServerActionFieldDropdownOptions<string[]>>
  | ServeQueryServerActionFieldCommon<'Number', ServeQueryServerActionFieldDropdownOptions<number>>;

export type ServeQueryServerActionFieldRadioGroup =
  | ServeQueryServerActionFieldCommon<
    'String' | 'Dateonly' | 'Date' | 'Time',
    ServeQueryServerActionFieldRadioButtonOptions<string>
  >
  | ServeQueryServerActionFieldCommon<'Number', ServeQueryServerActionFieldRadioButtonOptions<number>>;

export type ServeQueryServerActionFieldCheckboxGroup =
  | ServeQueryServerActionFieldCommon<['String'], ServeQueryServerActionFieldCheckboxGroupOptions<string>>
  | ServeQueryServerActionFieldCommon<['Number'], ServeQueryServerActionFieldCheckboxGroupOptions<number>>;

export type ServeQueryServerActionField =
  | ServeQueryServerActionFieldDropdown
  | ServeQueryServerActionFieldRadioGroup
  | ServeQueryServerActionFieldCheckboxGroup
  | ServeQueryServerActionFieldBase
  | ServeQueryServerActionFieldCommon<'Boolean', ServeQueryServerActionFieldCheckboxOptions>
  | ServeQueryServerActionFieldCommon<'String', ServeQueryServerActionFieldTextInputOptions>
  | ServeQueryServerActionFieldCommon<'Date', ServeQueryServerActionFieldDatePickerInputOptions>
  | ServeQueryServerActionFieldCommon<['String'], ServeQueryServerActionFieldTextInputListOptions>
  | ServeQueryServerActionFieldCommon<'String', ServeQueryServerActionFieldTextAreaOptions>
  | ServeQueryServerActionFieldCommon<'String', ServeQueryServerActionFieldUserDropdown>
  | ServeQueryServerActionFieldCommon<'String', ServeQueryServerActionFieldRichTextOptions>
  | ServeQueryServerActionFieldCommon<'Time', ServeQueryServerActionFieldTimePickerOptions>
  | ServeQueryServerActionFieldCommon<'Number', ServeQueryServerActionFieldNumberInputOptions>
  | ServeQueryServerActionFieldCommon<'Number', ServeQueryServerActionFieldCurrencyInputOptions>
  | ServeQueryServerActionFieldCommon<['Number'], ServeQueryServerActionFieldNumberInputListOptions>
  | ServeQueryServerActionFieldCommon<'String', ServeQueryServerActionFieldColorPickerOptions>
  | ServeQueryServerActionFieldCommon<'File' | ['File'], ServeQueryServerActionFieldFilePickerOptions>
  | ServeQueryServerActionFieldCommon<'Json', ServeQueryServerActionFieldJsonEditorOptions>
  | ServeQueryServerActionFieldCommon<'String', ServeQueryServerActionFieldAddressAutocompleteOptions>;

export type ServeQueryServerField = Partial<{
  field: string;
  type: ServeQueryServerColumnType;
  defaultValue: unknown;
  enums: null | string[];
  integration: null; // Always null on servequery-express
  isFilterable: boolean;
  isPrimaryKey: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  isSortable: boolean;
  isVirtual: boolean; // Computed. Not sure what is done with that knowledge on the frontend.
  reference: null | string;
  inverseOf: null | string;
  relationship: 'BelongsTo' | 'BelongsToMany' | 'HasMany' | 'HasOne';
  validations: Array<{ message: string | null; type: ValidationType; value?: unknown }>;
}>;

export type ServeQueryServerSegment = {
  id: string;
  name: string;
};

export type ValidationType =
  | 'contains'
  | 'is after'
  | 'is before'
  | 'is greater than'
  | 'is less than'
  | 'is like'
  | 'is longer than'
  | 'is present'
  | 'is shorter than';
