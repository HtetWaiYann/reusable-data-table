/** How an attendee paid for this class. */
export type PaymentType = "One-time" | "Package" | "Membership";

/** Where an attendee's booking stands. */
export type BookingStatus = "Booked" | "Checked-in" | "Cancelled" | "No-show";

/** Shown in the Status column; derived from the class, never stored (see `getClassStatus`). */
export type ClassStatus = "Scheduled" | "Full" | "Cancelled";

/** Someone booked into a class: the child rows under a class. */
export interface Attendee {
  id: string;
  name: string;
  paymentType: PaymentType;
  bookingStatus: BookingStatus;
}

/** One scheduled class in the studio timetable: the parent rows. */
export interface ClassSession {
  id: string;
  /** Class name, e.g. "Yoga Flow". */
  name: string;
  instructor: string;
  startsAt: Date;
  durationMinutes: number;
  /** Maximum number of active bookings. */
  capacity: number;
  /** Set when the studio cancelled the class. "Full" and "Scheduled" are derived from the bookings. */
  isCancelled: boolean;
  /** All bookings, including cancelled ones. Attendance counts only the active ones. */
  attendees: Attendee[];
}
