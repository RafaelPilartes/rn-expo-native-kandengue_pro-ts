import { Timestamp } from '@react-native-firebase/firestore';

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

export function convertFirestoreTimestamp(dateField: any): Date | undefined {
  if (!dateField) return undefined;

  // Se for um Firestore Timestamp
  if (dateField instanceof Timestamp) {
    return dateField.toDate();
  }

  // Se já for um Date
  if (dateField instanceof Date) {
    return dateField;
  }

  // Se for string, tentar converter
  if (typeof dateField === 'string') {
    const date = new Date(dateField);
    return isNaN(date.getTime()) ? undefined : date;
  }

  return undefined;
}

type FormatDateType =
  | 'dd/MM/yyyy'
  | 'dd MMM yyyy - HH:mm'
  | 'dd/MM/yyyy HH:mm'
  | 'dd MM yyyy';
export const formatFullDate = (
  date: any,
  format: FormatDateType = 'dd/MM/yyyy',
): string => {
  if (!date) return 'Data não disponível';

  let parsedDate: Date;

  /** ✅ Caso seja um Firestore Timestamp */
  if (date?._seconds !== undefined) {
    parsedDate = new Date(date._seconds * 1000 + date._nanoseconds / 1e6);
  } else {
    /** ✅ Caso seja um Date normal */
    parsedDate = new Date(date);
  }

  if (isNaN(parsedDate.getTime())) return 'Data inválida';

  if (format === 'dd MMM yyyy - HH:mm') {
    const day = parsedDate.getDate().toString().padStart(2, '0');
    const month = parsedDate
      .toLocaleDateString('pt-AO', { month: 'short' })
      .replace('.', ''); // remove ponto abreviado do mês
    const year = parsedDate.getFullYear();
    const hours = parsedDate.getHours().toString().padStart(2, '0');
    const minutes = parsedDate.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${year} - ${hours}:${minutes}`;
  }

  if (format === 'dd/MM/yyyy HH:mm') {
    const day = parsedDate.getDate().toString().padStart(2, '0');
    const month = parsedDate.getMonth().toString().padStart(2, '0');
    const year = parsedDate.getFullYear();
    const hours = parsedDate.getHours().toString().padStart(2, '0');
    const minutes = parsedDate.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  if (format === 'dd MM yyyy') {
    const day = parsedDate.getDate().toString().padStart(2, '0');
    const month = parsedDate.getMonth().toString().padStart(2, '0');
    const year = parsedDate.getFullYear();

    return `${day} ${month} ${year}`;
  }

  return parsedDate.toLocaleDateString('pt-AO');
};

// 🔥 aceita string | Date | Firestore Timestamp
export function toDate(d?: any): Date | null {
  if (!d) return null;

  // caso seja Firestore Timestamp
  if (typeof d === 'object' && '_seconds' in d && '_nanoseconds' in d) {
    return new Date(d._seconds * 1000 + d._nanoseconds / 1e6);
  }

  // caso seja string ou Date
  return new Date(d);
}
