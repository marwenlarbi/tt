/** Clés anglaises comme stockées dans le JSON `schedule` (profil vétérinaire). */
export const VET_SCHEDULE_DAY_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const VET_SCHEDULE_DAY_LABEL_FR = {
  Monday: 'Lundi',
  Tuesday: 'Mardi',
  Wednesday: 'Mercredi',
  Thursday: 'Jeudi',
  Friday: 'Vendredi',
  Saturday: 'Samedi',
  Sunday: 'Dimanche',
};

export function formatVetScheduleHours(hours) {
  if (hours == null || hours === '') return '—';
  if (typeof hours === 'string') return hours;
  if (typeof hours === 'object') {
    if (hours.open === false) return 'Fermé';
    if (hours.start != null && hours.end != null) return `${hours.start} - ${hours.end}`;
  }
  return String(hours);
}

/**
 * Entrées [jour, horaires] triées du lundi au dimanche, puis clés non standard à la fin.
 */
export function getVetScheduleEntriesSorted(schedule) {
  if (!schedule || typeof schedule !== 'object') return [];
  const ordered = VET_SCHEDULE_DAY_ORDER.filter((d) =>
    Object.prototype.hasOwnProperty.call(schedule, d)
  ).map((d) => [d, schedule[d]]);
  const extras = Object.keys(schedule).filter((k) => !VET_SCHEDULE_DAY_ORDER.includes(k));
  extras.sort();
  return [...ordered, ...extras.map((k) => [k, schedule[k]])];
}

export function vetScheduleDayLabelFr(dayKey) {
  return VET_SCHEDULE_DAY_LABEL_FR[dayKey] || dayKey;
}
