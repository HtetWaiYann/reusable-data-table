import type { Faker } from "@faker-js/faker";

// Our own short lists: Faker's English locale would add ~115 KB gzip just for names.
const FIRST_NAMES = [
  "Aye",
  "Ben",
  "Chloe",
  "Daniel",
  "Ella",
  "Farah",
  "George",
  "Hana",
  "Ivan",
  "Julia",
  "Kyaw",
  "Lena",
  "Mateo",
  "Nina",
  "Omar",
  "Priya",
];
const LAST_NAMES = [
  "Aung",
  "Carter",
  "Tan",
  "Kim",
  "Novak",
  "Aziz",
  "Silva",
  "Müller",
  "Nguyen",
  "Rossi",
  "Win",
  "Okafor",
];

/**
 * A random full name from the lists above, using the caller's seeded Faker so results stay deterministic.
 *
 * @param faker - A seeded Faker instance.
 * @returns e.g. "Hana Rossi".
 */
export function pickFullName(faker: Faker): string {
  return `${faker.helpers.arrayElement(FIRST_NAMES)} ${faker.helpers.arrayElement(LAST_NAMES)}`;
}
