export const LANGUAGE_OPTIONS = [
  { value: '100', text: 'English' },
  { value: '200', text: 'French' },
  { value: '300', text: 'Spanish' },
];

export const TIMEZONE_OPTIONS = [
  { value: '2', text: '(GMT-11:00) Midway Island' },
  { value: '1', text: '(GMT-11:00) International Date Line West' },
  { value: '3', text: '(GMT-11:00) Samoa' },
  { value: '4', text: '(GMT+05:00) Islamabad, Karachi' },
];

export const getLanguageText = (value: string) => {
  const option = LANGUAGE_OPTIONS.find(opt => opt.value === value);
  return option ? option.text : '';
};

export const getLanguageValue = (text: string) => {
  const option = LANGUAGE_OPTIONS.find(opt => opt.text === text);
  return option ? option.value : '';
};

export const getTimezoneText = (value: string) => {
  const option = TIMEZONE_OPTIONS.find(opt => opt.value === value);
  return option ? option.text : '';
};

export const getTimezoneValue = (text: string) => {
  const option = TIMEZONE_OPTIONS.find(opt => opt.text === text);
  return option ? option.value : '';
};


