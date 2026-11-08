import { base, Faker } from "@faker-js/faker";
import type {
  Attendee,
  BookingStatus,
  ClassSession,
  PaymentType,
} from "../features/timetable/types.ts";
import { pickFullName } from "./names.ts";

const SEED = 42;
const SESSION_COUNT = 50;

const CLASS_NAMES = [
  "Yoga Flow",
  "HIIT Blast",
  "Mat Pilates",
  "Spin Express",
  "Boxing Basics",
  "Barre Sculpt",
  "Strength Lab",
  "Mobility Reset",
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
const DURATIONS_MINUTES = [30, 45, 60];
const CAPACITIES = [12, 15, 20, 24];
const PAYMENT_TYPES: readonly PaymentType[] = [
  "One-time",
  "Package",
  "Membership",
];

// Weighted so the demo looks like a real studio: mostly booked, some checked in, a few no-shows.
const ACTIVE_BOOKING_STATUSES: { weight: number; value: BookingStatus }[] = [
  { weight: 70, value: "Booked" },
  { weight: 22, value: "Checked-in" },
  { weight: 8, value: "No-show" },
];
// Chances out of 1, so every class status shows up in 50 classes.
const CANCELLED_CLASS_CHANCE = 0.08;
const FULL_CLASS_CHANCE = 0.2;
const MAX_CANCELLED_BOOKINGS = 2;

// A fixed Monday, so the timetable never depends on when the page is opened.
const WEEK_START = new Date(2026, 10, 9);
const DAYS_IN_WEEK = 7;
const FIRST_HOUR = 6;
const LAST_HOUR = 20;
const START_MINUTES = [0, 30];

/**
 * Creates deterministic class sessions spread over one week, with their attendees.
 *
 * @param count - Number of sessions.
 * @param seed - Same seed, same sessions.
 * @returns The sessions, in creation order (not sorted).
 */
export function createClassSessions(
  count: number,
  seed: number,
): ClassSession[] {
  // Base locale only: we bring our own word lists, and the English locale data would add ~115 KB gzip.
  const faker = new Faker({ locale: [base], seed });

  function createAttendee(
    classId: string,
    index: number,
    bookingStatus: BookingStatus,
  ): Attendee {
    return {
      id: `${classId}-attendee-${index + 1}`,
      name: pickFullName(faker),
      paymentType: faker.helpers.arrayElement(PAYMENT_TYPES),
      bookingStatus,
    };
  }

  return Array.from({ length: count }, (_, index) => {
    const id = `class-${index + 1}`;
    const startsAt = new Date(WEEK_START);
    startsAt.setDate(
      startsAt.getDate() + faker.number.int({ min: 0, max: DAYS_IN_WEEK - 1 }),
    );
    startsAt.setHours(
      faker.number.int({ min: FIRST_HOUR, max: LAST_HOUR }),
      faker.helpers.arrayElement(START_MINUTES),
    );
    const capacity = faker.helpers.arrayElement(CAPACITIES);
    const isCancelled = faker.datatype.boolean(CANCELLED_CLASS_CHANCE);
    const isFull = faker.datatype.boolean(FULL_CLASS_CHANCE);

    const activeCount = isFull
      ? capacity
      : faker.number.int({ min: 0, max: capacity - 1 });
    const cancelledCount = faker.number.int({
      min: 0,
      max: MAX_CANCELLED_BOOKINGS,
    });
    const attendees = Array.from(
      { length: activeCount + cancelledCount },
      (_, attendeeIndex) => {
        // When the studio cancels a class, every booking on it is cancelled too.
        const isBookingCancelled = isCancelled || attendeeIndex >= activeCount;
        return createAttendee(
          id,
          attendeeIndex,
          isBookingCancelled
            ? "Cancelled"
            : faker.helpers.weightedArrayElement(ACTIVE_BOOKING_STATUSES),
        );
      },
    );

    return {
      id,
      name: faker.helpers.arrayElement(CLASS_NAMES),
      instructor: faker.helpers.arrayElement(INSTRUCTORS),
      startsAt,
      durationMinutes: faker.helpers.arrayElement(DURATIONS_MINUTES),
      capacity,
      isCancelled,
      attendees,
    };
  });
}

/** The timetable's mock data. Built only once when the module loads, so it's the same array on every render. */
export const classSessions = createClassSessions(SESSION_COUNT, SEED);
