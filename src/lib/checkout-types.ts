export interface OrderDetail {
  label: string;
  value: string;
}

export interface CheckoutState {
  service: string;
  title: string;
  details: OrderDetail[];
  price: number;
  isBooking?: boolean;
}
