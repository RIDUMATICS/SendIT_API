import { validator } from '@ioc:Adonis/Core/Validator';

validator.rule('lowerCase', (value, _, { mutate }) => {
  // skip if not string
  if (typeof value !== 'string') {
    return;
  }

  // convert value to lowercase
  value = value.toLowerCase();

  // return the new value
  mutate(value);
});
