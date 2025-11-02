import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import {
  getAllBookings,
  searchBookings,
  filterBookings,
  getBookingInfo,
  createPasserbyBooking,
  clearError,
  setFilters,
  clearFilters,
  setCurrentBooking,
  resetBookings,
} from '../store/slices/bookingSlice';
import { BookingFilter } from '../types';

export const useBooking = () => {
  const dispatch = useDispatch<AppDispatch>();
  const booking = useSelector((state: RootState) => state.booking);

  return {
    ...booking,
    getAllBookings: (keeperId: number, pageNo?: number, pageSize?: number) =>
      dispatch(getAllBookings({ keeperId, pageNo, pageSize })),
    searchBookings: (keeperId: number, searchString: string) =>
      dispatch(searchBookings({ keeperId, searchString })),
    filterBookings: (keeperId: number, filters: BookingFilter, pageNo?: number, pageSize?: number) =>
      dispatch(filterBookings({ keeperId, filters, pageNo, pageSize })),
    getBookingInfo: (bookingId: number) => dispatch(getBookingInfo(bookingId)),
    createPasserbyBooking: (data: any) => dispatch(createPasserbyBooking(data)),
    clearError: () => dispatch(clearError()),
    setFilters: (filters: BookingFilter) => dispatch(setFilters(filters)),
    clearFilters: () => dispatch(clearFilters()),
    setCurrentBooking: (booking: any) => dispatch(setCurrentBooking(booking)),
    resetBookings: () => dispatch(resetBookings()),
  };
};

