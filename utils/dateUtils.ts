
export const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getDaysBetween = (start: Date, end: Date): number => {
  const s = startOfDay(start);
  const e = startOfDay(end);
  const diffTime = e.getTime() - s.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getWorkingDaysBetween = (start: Date, end: Date): number => {
  let count = 0;
  const curDate = new Date(startOfDay(start));
  const endDate = new Date(startOfDay(end));
  
  if (curDate.getTime() === endDate.getTime()) return 0;
  
  const step = start <= end ? 1 : -1;
  const target = endDate.getTime();

  while (curDate.getTime() !== target) {
    const day = curDate.getDay();
    if (day !== 0 && day !== 6) count++;
    curDate.setDate(curDate.getDate() + step);
  }
  return count;
};

export const formatDateLong = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString('pt-BR');
};

/**
 * Retorna uma string no formato YYYY-MM-DD baseada nos componentes locais da data.
 * Isso evita problemas de fuso horário que ocorrem ao usar toISOString().split('T')[0].
 */
export const getDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getMonthsInRange = (start: Date, end: Date) => {
  const months = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cur <= last) {
    months.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
};
