import { base, Faker } from "@faker-js/faker";
import type {
  Booking,
  Member,
  MembershipPlan,
} from "../features/members/types.ts";
import { pickFullName } from "./names.ts";

const SEED = 7;
const PLANS: readonly MembershipPlan[] = ["Basic", "Plus", "Premium"];
const BOOKABLE_CLASSES = [
  "Yoga Flow",
  "HIIT Blast",
  "Mat Pilates",
  "Spin Express",
  "Boxing Basics",
];
const MAX_VISITS = 30;
const MAX_BOOKINGS = 5;

// Fixed dates, so the data never depends on when the page is opened.
const FIRST_JOIN_DATE = new Date(2024, 0, 1);
const LAST_JOIN_DATE = new Date(2026, 9, 31);
const BOOKINGS_FROM = new Date(2026, 10, 9);
const BOOKINGS_TO = new Date(2026, 10, 30);

/**
 * Creates deterministic members, each with 0–5 upcoming bookings.
 *
 * @param count - Number of members.
 * @param seed - Same seed, same members.
 * @returns The members, in creation order.
 */
export function createMembers(count: number, seed: number): Member[] {
  const faker = new Faker({ locale: [base], seed });

  return Array.from({ length: count }, (_, index) => {
    const id = `member-${index + 1}`;
    const bookings: Booking[] = Array.from(
      { length: faker.number.int({ min: 0, max: MAX_BOOKINGS }) },
      (_, bookingIndex) => ({
        id: `${id}-booking-${bookingIndex + 1}`,
        className: faker.helpers.arrayElement(BOOKABLE_CLASSES),
        date: faker.date.between({ from: BOOKINGS_FROM, to: BOOKINGS_TO }),
      }),
    ).toSorted((a, b) => a.date.getTime() - b.date.getTime());

    return {
      id,
      name: pickFullName(faker),
      plan: faker.helpers.arrayElement(PLANS),
      joinedAt: faker.date.between({
        from: FIRST_JOIN_DATE,
        to: LAST_JOIN_DATE,
      }),
      visits: faker.number.int({ min: 0, max: MAX_VISITS }),
      bookings,
    };
  });
}

// One array per size, built on first use.
const membersBySize = new Map<number, Member[]>();

/**
 * The members mock data for a row count. Same array every call, so React sees stable data.
 *
 * @param count - Number of members.
 * @returns The members.
 */
export function getMembers(count: number): Member[] {
  let members = membersBySize.get(count);
  if (!members) {
    members = createMembers(count, SEED);
    membersBySize.set(count, members);
  }
  return members;
}
