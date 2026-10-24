import type {
  AdminUserEmergencyContactDto,
  AdminUserExpenseDto,
  AdminUserMaintenanceJobDto,
  AdminUserMaintenanceScheduleDto,
  AdminUserVehicleDocumentDto,
} from '@autolokate/api-client';
import { useQuery } from '@tanstack/react-query';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import {
  fetchUserEmergencyContacts,
  fetchUserExpenses,
  fetchUserMaintenanceJobs,
  fetchUserMaintenanceSchedule,
  fetchUserVehicleDocuments,
} from '@/services/users/admin-users-service';

function careErrorMessage(error: unknown): string | null {
  return error ? mapAdminApiError(error).userMessage : null;
}

/** Nested same-records lists under admin user detail (expenses / maint / docs / contacts). */
export function useAdminUserCareRecords(userId: string | null) {
  const enabled = typeof userId === 'string' && userId.length > 0;

  const expensesQuery = useQuery({
    queryKey: ['admin', 'users', 'expenses', userId],
    queryFn: ({ signal }) => {
      if (!userId) {
        throw new Error('userId required');
      }
      return fetchUserExpenses(userId, signal);
    },
    enabled,
    retry: 0,
  });

  const maintenanceJobsQuery = useQuery({
    queryKey: ['admin', 'users', 'maintenance-jobs', userId],
    queryFn: ({ signal }) => {
      if (!userId) {
        throw new Error('userId required');
      }
      return fetchUserMaintenanceJobs(userId, signal);
    },
    enabled,
    retry: 0,
  });

  const maintenanceScheduleQuery = useQuery({
    queryKey: ['admin', 'users', 'maintenance-schedule', userId],
    queryFn: ({ signal }) => {
      if (!userId) {
        throw new Error('userId required');
      }
      return fetchUserMaintenanceSchedule(userId, signal);
    },
    enabled,
    retry: 0,
  });

  const vehicleDocumentsQuery = useQuery({
    queryKey: ['admin', 'users', 'vehicle-documents', userId],
    queryFn: ({ signal }) => {
      if (!userId) {
        throw new Error('userId required');
      }
      return fetchUserVehicleDocuments(userId, signal);
    },
    enabled,
    retry: 0,
  });

  const emergencyContactsQuery = useQuery({
    queryKey: ['admin', 'users', 'emergency-contacts', userId],
    queryFn: ({ signal }) => {
      if (!userId) {
        throw new Error('userId required');
      }
      return fetchUserEmergencyContacts(userId, signal);
    },
    enabled,
    retry: 0,
  });

  const expenses: AdminUserExpenseDto[] = expensesQuery.data ?? [];
  const maintenanceJobs: AdminUserMaintenanceJobDto[] = maintenanceJobsQuery.data ?? [];
  const maintenanceSchedule: AdminUserMaintenanceScheduleDto[] =
    maintenanceScheduleQuery.data ?? [];
  const vehicleDocuments: AdminUserVehicleDocumentDto[] = vehicleDocumentsQuery.data ?? [];
  const emergencyContacts: AdminUserEmergencyContactDto[] = emergencyContactsQuery.data ?? [];

  return {
    expenses,
    expensesLoading: expensesQuery.isLoading,
    expensesError: careErrorMessage(expensesQuery.error),
    maintenanceJobs,
    maintenanceJobsLoading: maintenanceJobsQuery.isLoading,
    maintenanceJobsError: careErrorMessage(maintenanceJobsQuery.error),
    maintenanceSchedule,
    maintenanceScheduleLoading: maintenanceScheduleQuery.isLoading,
    maintenanceScheduleError: careErrorMessage(maintenanceScheduleQuery.error),
    vehicleDocuments,
    vehicleDocumentsLoading: vehicleDocumentsQuery.isLoading,
    vehicleDocumentsError: careErrorMessage(vehicleDocumentsQuery.error),
    emergencyContacts,
    emergencyContactsLoading: emergencyContactsQuery.isLoading,
    emergencyContactsError: careErrorMessage(emergencyContactsQuery.error),
    isFetching:
      expensesQuery.isFetching ||
      maintenanceJobsQuery.isFetching ||
      maintenanceScheduleQuery.isFetching ||
      vehicleDocumentsQuery.isFetching ||
      emergencyContactsQuery.isFetching,
    refresh: () => {
      void expensesQuery.refetch();
      void maintenanceJobsQuery.refetch();
      void maintenanceScheduleQuery.refetch();
      void vehicleDocumentsQuery.refetch();
      void emergencyContactsQuery.refetch();
    },
  };
}
