import { useMemo, useCallback, useState, useEffect } from "react";
import { useInfiniteQuery } from "react-query";
import { fetchActivePhones, fetchLostPhones } from "../services/services";

// Client-side utility functions
const enhancePhonesWithDays = (phones) => {
  const today = new Date();

  return phones.map((phone) => {
    const assignedDate = new Date(phone.dateAssigned || phone.createdAt);
    const differenceInTime = today - assignedDate;
    const daysSinceAssigned = Math.floor(
      differenceInTime / (1000 * 60 * 60 * 24)
    );

    return {
      ...phone,
      daysSinceAssigned,
    };
  });
};

const filterPhonesBySearch = (phones, searchQuery, filterByDaysOnly) => {
  if (!searchQuery.trim()) {
    return phones;
  }

  return phones.filter((phone) => {
    // Filter by days logic
    if (filterByDaysOnly && !isNaN(searchQuery.trim())) {
      const searchDays = parseInt(searchQuery.trim(), 10);
      return (phone.daysSinceAssigned || 0) >= searchDays;
    }

    // Regular text search
    const searchParts = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);

    return searchParts.every((part) => {
      return [
        phone?.modelName?.toLowerCase(),
        phone?.imei?.toLowerCase(),
        phone?.supplierName?.toLowerCase(),
        phone?.managerName?.toLowerCase(),
        phone?.managerLocation?.toLowerCase(),
      ].some((field) => field?.includes(part));
    });
  });
};

const sortPhonesByDays = (phones) => {
  return [...phones].sort((a, b) => {
    // Sort by days descending (most urgent first)
    return (b.daysSinceAssigned || 0) - (a.daysSinceAssigned || 0);
  });
};

export const usePhoneData = (
  status,
  token,
  searchQuery = "",
  filterByDaysOnly = false
) => {
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  // Determine the appropriate service function and parameters
  const fetchFunction =
    status === "active" ? fetchActivePhones : fetchLostPhones;
  const defaultLimit = status === "active" ? 2000 : 500; // Larger pages for better performance

  // Main data fetching with React Query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery(
    [`phones`, { status }],
    ({ pageParam = 1 }) =>
      fetchFunction({
        queryKey: [
          `phones`,
          {
            page: pageParam,
            limit: defaultLimit,
          },
        ],
        token,
      }),
    {
      getNextPageParam: (lastPage) => {
        const { page, total, limit } = lastPage;
        return page * limit < total ? page + 1 : undefined;
      },
      enabled: !!token,
      keepPreviousData: true,
      staleTime: 3 * 60 * 1000, // 3 minutes
      refetchOnWindowFocus: false,
      refetchInterval: 45000, // Refresh every 45 seconds
    }
  );

  // Process raw phone data with client-side enhancements
  const processedPhones = useMemo(() => {
    const rawPhones = data?.pages?.flatMap((page) => page.phones) || [];

    // Step 1: Enhance with calculated days
    const phonesWithDays = enhancePhonesWithDays(rawPhones);

    // Step 2: Apply client-side filtering
    const filteredPhones = filterPhonesBySearch(
      phonesWithDays,
      searchQuery,
      filterByDaysOnly
    );

    // Step 3: Sort for better UX (most urgent first)
    return sortPhonesByDays(filteredPhones);
  }, [data?.pages, searchQuery, filterByDaysOnly]);

  // Get total count from server
  const totalCount = useMemo(() => {
    return data?.pages?.[0]?.total || 0;
  }, [data?.pages]);

  // Get filtered count (client-side)
  const filteredCount = processedPhones.length;

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    const totalFetched =
      data?.pages?.reduce((acc, page) => acc + page.phones.length, 0) || 0;
    const compressionRatio =
      totalCount > 0 ? (filteredCount / totalCount) * 100 : 100;

    return {
      totalFetched,
      totalCount,
      filteredCount,
      compressionRatio,
      pagesLoaded: data?.pages?.length || 0,
    };
  }, [data?.pages, totalCount, filteredCount]);

  // Optimized fetch more function
  const handleFetchMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Force refresh function
  const handleRefresh = useCallback(() => {
    setLastUpdateTime(Date.now());
    refetch();
  }, [refetch]);

  // Auto-refresh when data gets stale
  useEffect(() => {
    const interval = setInterval(() => {
      // Only auto-refresh if user hasn't interacted recently
      const timeSinceUpdate = Date.now() - lastUpdateTime;
      if (timeSinceUpdate > 120000) {
        // 2 minutes of inactivity
        handleRefresh();
      }
    }, 45000); // Check every 45 seconds

    return () => clearInterval(interval);
  }, [lastUpdateTime, handleRefresh]);

  return {
    // Data
    phones: processedPhones,
    rawPhones: data?.pages?.flatMap((page) => page.phones) || [],

    // Loading states
    isLoading,
    isLoadingMore: isFetchingNextPage,

    // Pagination
    hasMorePhones: hasNextPage,
    fetchMorePhones: handleFetchMore,

    // Counts and metrics
    totalCount,
    filteredCount,
    performanceMetrics,

    // Control functions
    refresh: handleRefresh,

    // Error handling
    error,
  };
};

// Custom hook for managing multiple phone statuses
export const useMultiplePhoneData = (token) => {
  const activeData = usePhoneData("active", token);
  const lostData = usePhoneData("lost", token);

  const combinedMetrics = useMemo(
    () => ({
      totalPhones: activeData.totalCount + lostData.totalCount,
      totalFiltered: activeData.filteredCount + lostData.filteredCount,
      activePercentage:
        activeData.totalCount > 0
          ? (activeData.filteredCount / activeData.totalCount) * 100
          : 0,
      lostPercentage:
        lostData.totalCount > 0
          ? (lostData.filteredCount / lostData.totalCount) * 100
          : 0,
    }),
    [activeData, lostData]
  );

  return {
    active: activeData,
    lost: lostData,
    metrics: combinedMetrics,
    refreshAll: () => {
      activeData.refresh();
      lostData.refresh();
    },
  };
};
