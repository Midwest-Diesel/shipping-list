export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${m}/${day}/${y}`;
};

export const getDay = (date: Date): string | null => {
  if (!(date instanceof Date) || isNaN(date.getDay())) return null;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

export const parseResDate = (date: string): Date | null => {
  if (!date || typeof date !== 'string') return null;
  if (date.includes('T')) {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    timeZone: 'America/Chicago',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const parseDateInputValue = (date: Date | null): string => {
  return date && typeof date === 'object' && !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '';
};

export const cap = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatCurrency = (amount: any): string => {
  amount = parseFloat(amount);
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
  if (!amount) return '$0.00';
  const [integerPart, decimalPart] = amount.toFixed(2).split('.');
  const newIntPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$${newIntPart}.${decimalPart}`;
};

export const formatPercent = (amount: number | null): string => {
  if (amount == null || isNaN(amount)) return '';
  const percent = Math.ceil(amount * 100 * 100) / 100;
  const hasDecimal = percent % 1 !== 0;
  const formatted = hasDecimal ? percent.toFixed(2) : percent.toFixed(0);
  const [integerPart, decimalPart] = formatted.split('.');
  const newIntPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return hasDecimal
    ? `${newIntPart}.${decimalPart.replace(/0+$/, '')}%`
    : `${newIntPart}%`;
};

export const formatPhone = (value: string | null | undefined, noParens?: boolean) => {
  if (!value || value === '') return '';
  if (value === '+') return value;

  // Separate the country code and the rest of the number
  let countryCode = '';
  let restOfNumber = value;
  
  if (value.charAt(0) === '+') {
    const match = value.match(/\+\d*/);
    countryCode = match ? match[0].slice(0, 2) + ' ' : '';
    restOfNumber = value.slice(countryCode.length);
  } else if (value.length === 10) {
    restOfNumber = value;
  } else if (value.length === 11) {
    countryCode = '+' + value.slice(0, 1) + ' ';
    restOfNumber = value.slice(1);
  } else if (value.length >= 15) {
    countryCode = '+' + value.slice(-1) + ' ';
    restOfNumber = value.slice(0, -1);
  }

  const pattern = /\(\d{1,3}$/;
  if (pattern.test(restOfNumber)) restOfNumber = restOfNumber.slice(0, -1);

  // Remove all non-digit characters from the rest of the number
  const digits = restOfNumber.replace(/\D/g, '');

  // Format the local number based on its length
  let formattedLocalNumber = '';
  if (digits.length < 3) {
    formattedLocalNumber = `(${digits})`;
  } else if (digits.length <= 6) {
    formattedLocalNumber = `(${digits.slice(0, 3)})` + (digits.length > 3 ? ` ${digits.slice(3)}` : '');
  } else {
    formattedLocalNumber = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  let result = countryCode + formattedLocalNumber;
  if (result === '()') return '';
  else if (/^\+\d+ \(\)$/.test(result)) return result.split(' ')[0];

  if (noParens) {
    result = result.replace(/\(/g, '').replace(/\)/g, '').replace(' ', '-');
  }
  return result;
};

export const parsePhone = (value: string) => {
  return value.replace(/\D/g, '');
};

export const toAbsolutePath = (url: string) => url.startsWith('/') ? url : `/${url}`;

export const formatCCNumber = (cardNum: string): string => {
  return `XXXXXXXXXXXX${cardNum.slice(cardNum.length - 4)}`;
};

export const parseWeightDims = (weightDims: string | null): WeightDims[] => {
  if (!weightDims) return [{ qty: 1, type: 'Small Pack', lbs: 0, length: 0, width: 0, height: 0 }];

  const value = weightDims.toUpperCase();
  const results: WeightDims[] = [];
  const defaultType: WeightDims['type'] = /\b(FREIGHT|XPO|TRUCKLINE|LTL)\b/.test(value) ? 'LTL' : 'Small Pack';
  const normalRegex = /\(QTY\s*(\d+)\)\s*(\d+)\s*(?:LBS)?\s*(\d+)\s*[Xx]\s*(\d+)\s*[Xx]\s*(\d+)/g;
  const formattedRegex = /\(QTY\s*(\d+)\)\s*(SMALL PACK|LTL)?\s*:?\s*(\d+)\s*LBS\s*-\s*L:\s*(\d+)\s*,\s*W:\s*(\d+)\s*,\s*H:\s*(\d+)/g;
  let match: RegExpExecArray | null;

  while ((match = normalRegex.exec(value)) !== null) {
    results.push({
      qty: Number(match[1]),
      type: defaultType,
      lbs: Number(match[2]),
      length: Number(match[3]),
      width: Number(match[4]),
      height: Number(match[5])
    });
  }

  while ((match = formattedRegex.exec(value)) !== null) {
    results.push({
      qty: Number(match[1]),
      type: match[2] === 'LTL' ? 'LTL' : 'Small Pack',
      lbs: Number(match[3]),
      length: Number(match[4]),
      width: Number(match[5]),
      height: Number(match[6])
    });
  }

  if (!value.includes('(QTY')) {
    const formattedMatch = value.match(/(\d+)\s*LBS\s*-\s*L:\s*(\d+)\s*,\s*W:\s*(\d+)\s*,\s*H:\s*(\d+)/);

    if (formattedMatch) {
      results.push({
        type: defaultType,
        qty: 1,
        lbs: Number(formattedMatch[1]),
        length: Number(formattedMatch[2]),
        width: Number(formattedMatch[3]),
        height: Number(formattedMatch[4])
      });
    } else {
      const lbs = Number(value.match(/(\d+)\s*(?:LBS)?\s*(?:-|(?=\d+\s*[Xx]))/)?.[1] ?? 0);
      const length = Number(value.match(/(\d+)\s*[Xx]\s*\d+\s*[Xx]\s*\d+/)?.[1] ?? 0);
      const width = Number(value.match(/\d+\s*[Xx]\s*(\d+)\s*[Xx]\s*\d+/)?.[1] ?? 0);
      const height = Number(value.match(/\d+\s*[Xx]\s*\d+\s*[Xx]\s*(\d+)/)?.[1] ?? 0);

      results.push({ type: defaultType, qty: 1, lbs, length, width, height });
    }
  }

  return results;
};

export const formatWeightDims = (weightDims: WeightDims[]): string => {
  const results: string[] = [];
  const totalQty = weightDims.reduce((acc, row) => acc + row.qty, 0);
  weightDims.forEach((row) => {
    const { qty, type, lbs, length, width, height } = row;
    results.push(`${totalQty > 1 ? `(QTY ${qty}) ` : ''}${type}: ${lbs}lbs - L: ${length}, W: ${width}, H: ${height}`);
  });
  return results.join('\n');
};

export const formatShippingListWeightDims = (weightDims: WeightDims[]) => {
  return formatWeightDims(weightDims)
    .replaceAll(/\(QTY [0-9]\) /gm, '')
    .replaceAll('Small Pack: ', '')
    .replaceAll('LTL: ', '')
    .replaceAll('lbs ', ' lbs ')
    .replaceAll('L: ', '')
    .replaceAll(', W: ', 'x')
    .replaceAll(', H: ', 'x');
};

export const serializeWeightDims = (weightDims: string | null): string => {
  if (!weightDims) return '';
  return formatWeightDims(parseWeightDims(weightDims));
};
