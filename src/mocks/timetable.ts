import { base, Faker } from "@faker-js/faker";
import type { ClassSession } from "../features/timetable/types.ts";

const SEED = 42;
const SESSION_COUNT = 50;

const CLASS_NAMES = [
  "Yoga",
  "HIIT",
  "Pilates",
  "Spin",
  "Boxing",
  "Barre",
  "Strength",
  "Mobility",
];
const INSTRUCTORS = [
  "John Doe",
  "James Doe",
  "Chloe",
  "Daniel",
  "Ella",
  "Frank",
  "Htet",
];
// "Studio 10" is there on purpose for sorting tests
const ROOMS = ["Studio 1", "Studio 2", "Studio 10", "Spin Room"];
const DURATIONS_MINUTES = [30, 45, 60];
const CAPACITIES = [12, 16, 20, 24];

// A fixed Monday, so the timetable never depends on when the page is opened.
const WEEK_START = new Date(2026, 10, 9);
const DAYS_IN_WEEK = 7;
const FIRST_HOUR = 6;
const LAST_HOUR = 20;
const START_MINUTES = [0, 30];

/**
 * Creates deterministic class sessions spread over one week.
 *
 * @param count - Number of sessions.
 * @param seed - Same seed, same sessions.
 * @returns The sessions, in creation order (not sorted).
 */
export function createClassSessions(
  count: number,
  seed: number,
): ClassSession[] {
  // Base locale only to reduce the unnecessary bundle size.
  // we bring our own word lists, and the English locale data adds only ~115 KB
  const faker = new Faker({ locale: [base], seed });

  return Array.from({ length: count }, (_, index) => {
    const startsAt = new Date(WEEK_START);
    startsAt.setDate(
      startsAt.getDate() + faker.number.int({ min: 0, max: DAYS_IN_WEEK - 1 }),
    );
    startsAt.setHours(
      faker.number.int({ min: FIRST_HOUR, max: LAST_HOUR }),
      faker.helpers.arrayElement(START_MINUTES),
    );
    const capacity = faker.helpers.arrayElement(CAPACITIES);

    return {
      id: `class-${index + 1}`,
      name: faker.helpers.arrayElement(CLASS_NAMES),
      instructor: faker.helpers.arrayElement(INSTRUCTORS),
      room: faker.helpers.arrayElement(ROOMS),
      startsAt,
      durationMinutes: faker.helpers.arrayElement(DURATIONS_MINUTES),
      capacity,
      booked: faker.number.int({ min: 0, max: capacity }),
    };
  });
}

/** The timetable's mock data. Built only once when the module loads, so it's the same array on every render. */
export const classSessions = createClassSessions(SESSION_COUNT, SEED);
