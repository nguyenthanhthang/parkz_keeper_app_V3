import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
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

  // Memoize các functions để tránh re-render không cần thiết
  const getAllBookingsMemo = useCallback(
    (keeperId: number, pageNo?: number, pageSize?: number) =>
      dispatch(getAllBookings({ keeperId, pageNo, pageSize })),
    [dispatch]
  );

  const searchBookingsMemo = useCallback(
    (keeperId: number, searchString: string) =>
      dispatch(searchBookings({ keeperId, searchString })),
    [dispatch]
  );

  const filterBookingsMemo = useCallback(
    (keeperId: number, filters: BookingFilter, pageNo?: number, pageSize?: number) =>
      dispatch(filterBookings({ keeperId, filters, pageNo, pageSize })),
    [dispatch]
  );

  const getBookingInfoMemo = useCallback(
    (bookingId: number) => dispatch(getBookingInfo(bookingId)),
    [dispatch]
  );

  const createPasserbyBookingMemo = useCallback(
    (data: any) => dispatch(createPasserbyBooking(data)),
    [dispatch]
  );

  const clearErrorMemo = useCallback(() => dispatch(clearError()), [dispatch]);

  const setFiltersMemo = useCallback(
    (filters: BookingFilter) => dispatch(setFilters(filters)),
    [dispatch]
  );

  const clearFiltersMemo = useCallback(() => dispatch(clearFilters()), [dispatch]);

  const setCurrentBookingMemo = useCallback(
    (booking: any) => dispatch(setCurrentBooking(booking)),
    [dispatch]
  );

  const resetBookingsMemo = useCallback(() => dispatch(resetBookings()), [dispatch]);

  return {
    ...booking,
    getAllBookings: getAllBookingsMemo,
    searchBookings: searchBookingsMemo,
    filterBookings: filterBookingsMemo,
    getBookingInfo: getBookingInfoMemo,
    createPasserbyBooking: createPasserbyBookingMemo,
    clearError: clearErrorMemo,
    setFilters: setFiltersMemo,
    clearFilters: clearFiltersMemo,
    setCurrentBooking: setCurrentBookingMemo,
    resetBookings: resetBookingsMemo,
  };
};

