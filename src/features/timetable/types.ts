/** One scheduled class in the studio timetable. */
export interface ClassSession {
  id: string;
  /** Class type, e.g. "Yoga". */
  name: string;
  instructor: string;
  room: string;
  startsAt: Date;
  durationMinutes: number;
  /** Maximum number of attendees. */
  capacity: number;
  /** Spots already taken, from 0 to `capacity`. */
  booked: number;
}
