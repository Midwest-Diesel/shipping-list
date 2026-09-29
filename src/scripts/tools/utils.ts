import axios from 'axios';


export const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

export const generateClasses = (className: string, variantList: string[], elmt: string): string => {
  const variants = variantList ? variantList.map((i) => `${elmt}--${i}`).join(' ') : '';
  return [className ? [elmt, className].join(' ') : elmt, variants && variants].filter(Boolean).join(' ');
};

export const parseClasses = (classes: string): object => {
  return classes ? { className: classes } : {};
};

export const generateRandId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const isObjectNull = (obj: any) => Object.values(obj).filter((value) => value !== '' && value !== null).length === 0;

export const handleError = (error: unknown, fn: string) => {
  const handle = `[Error in ${fn}]`;

  if (axios.isAxiosError(error)) {
    if (error.response) {
      alert(`${handle} ${error.name} ${error.response.status}: ${error.message}`);
      console.error(handle, error.message, '\n\n', error.response.data, '\n', error.config);
    } else if (error.request) {
      alert(`${handle} ${error.name}: ${error.message}`);
      console.error(handle, error.request, '\n', error.config);
    } else {
      alert(`${handle} ${error.name}: ${error.message}`);
      console.error(handle, error.message, '\n', error.config);
    }
    return;
  }

  if (error instanceof Error) {
    alert(`${handle} ${error.name}: ${error.message}`);
    console.error(handle, error);
    return;
  }

  alert(`${handle} ${String(error)}`);
  console.error(handle, error);
};

export const windowConfirm = (msg: string) => confirm(msg);
