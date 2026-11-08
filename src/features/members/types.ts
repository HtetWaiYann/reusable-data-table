/** Membership tier. */
export type MembershipPlan = "Basic" | "Plus" | "Premium";

/** A member's upcoming booking: the child rows under a member. */
export interface Booking {
  id: string;
  className: string;
  date: Date;
}

/** A studio member: the second, differently shaped dataset that shows the table isn't tied to classes. */
export interface Member {
  id: string;
  name: string;
  plan: MembershipPlan;
  joinedAt: Date;
  /** Visits in the last 30 days. */
  visits: number;
  /** Upcoming bookings, possibly none. */
  bookings: Booking[];
}
