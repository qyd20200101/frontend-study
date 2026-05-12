import InputField from './fields/InputField';
import SelectField from './fields/SelectField';
import DateField from './fields/DateField';
import RadioField from './fields/RadioField';
import GroupField from './fields/GroupField';

export const componentMap = {
    input: InputField,
    select: SelectField,
    date: DateField,
    radio: RadioField,
    group: GroupField
} as const;
