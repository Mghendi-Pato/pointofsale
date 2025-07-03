import React, { useCallback, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { BiCartAdd, BiEdit } from "react-icons/bi";
import { MdDeleteOutline, MdSettingsBackupRestore } from "react-icons/md";
import { FixedSizeList as List } from "react-window";

// Skeleton components
const SkeletonPulse = () => (
  <div className="animate-pulse bg-gray-200 rounded-md h-full w-full" />
);

const TableSkeletonRow = ({ userRole }) => {
  return (
    <tr className="bg-white border-b border-l-4 border-l-gray-300">
      <td className="px-2 py-3 border-r">
        <div className="h-4 w-4">
          <SkeletonPulse />
        </div>
      </td>
      <td className="px-2 py-3 border-r">
        <div className="h-4 w-4">
          <SkeletonPulse />
        </div>
      </td>
      <td className="px-2 py-3 border-r">
        <div className="h-4 w-20">
          <SkeletonPulse />
        </div>
      </td>
      <td className="px-6 py-3 border-r">
        <div className="h-4 w-24">
          <SkeletonPulse />
        </div>
      </td>
      <td className="px-6 py-3 border-r">
        <div className="h-4 w-16">
          <SkeletonPulse />
        </div>
      </td>
      {userRole !== "manager" && (
        <>
          <td className="px-6 py-3 border-r">
            <div className="h-4 w-20">
              <SkeletonPulse />
            </div>
          </td>
          <td className="px-6 py-3 border-r">
            <div className="h-4 w-24">
              <SkeletonPulse />
            </div>
          </td>
        </>
      )}
      <td className="px-6 py-3 border-r">
        <div className="h-4 w-24">
          <SkeletonPulse />
        </div>
      </td>
      <td className="px-6 py-3 border-r">
        <div className="h-4 w-16">
          <SkeletonPulse />
        </div>
      </td>
      {userRole !== "manager" && (
        <>
          <td className="px-6 py-3 border-r">
            <div className="h-4 w-20">
              <SkeletonPulse />
            </div>
          </td>
          <td className="px-6 py-3 border-r">
            <div className="h-4 w-24">
              <SkeletonPulse />
            </div>
          </td>
        </>
      )}
      <td className="px-6 py-3 flex flex-row space-x-2">
        <div className="h-8 w-20 rounded-xl">
          <SkeletonPulse />
        </div>
        {userRole !== "manager" && (
          <div className="h-8 w-20 rounded-xl">
            <SkeletonPulse />
          </div>
        )}
        {userRole === "super admin" && (
          <div className="h-8 w-20 rounded-xl">
            <SkeletonPulse />
          </div>
        )}
      </td>
    </tr>
  );
};

const TableSkeleton = ({ userRole }) => {
  return (
    <div className="max-h-[57vh] overflow-y-auto" id="scrollableDiv">
      <table className="w-full text-sm text-left text-gray-500 sticky top-0 z-10">
        <TableHeader userRole={userRole} />
        <tbody>
          {[...Array(8)].map((_, index) => (
            <TableSkeletonRow key={index} userRole={userRole} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Table Header Component
const TableHeader = React.memo(({ userRole }) => {
  return (
    <thead className="text-xs text-gray-700 uppercase bg-neutral-100 border-b border-gray-200 sticky top-0 z-10">
      <tr>
        <th scope="col" className="px-2 border-r py-2">
          <div className="flex items-center justify-center gap-1">#</div>
        </th>
        <th scope="col" className="px-2 border-r py-2">
          <div className="flex items-center justify-center gap-1">*</div>
        </th>
        <th scope="col" className="px-2 border-r text-[14px] normal-case py-2">
          <div className="flex items-center gap-1">
            <span>Model</span>
          </div>
        </th>
        <th scope="col" className="px-6 border-r text-[14px] normal-case py-2">
          <div className="flex items-center gap-1">
            <span>IMEI</span>
          </div>
        </th>
        <th scope="col" className="px-6 border-r text-[14px] normal-case py-2">
          <div className="flex items-center gap-1">
            <span>Capacity</span>
          </div>
        </th>
        {userRole !== "manager" && (
          <th
            scope="col"
            className="px-6 border-r text-[14px] normal-case py-2">
            <div className="flex items-center gap-1">
              <span>Supplier</span>
            </div>
          </th>
        )}
        {userRole !== "manager" && (
          <th
            scope="col"
            className="px-6 border-r text-[14px] normal-case py-2">
            <div className="flex items-center gap-1">
              <span>Buying Price</span>
            </div>
          </th>
        )}
        <th scope="col" className="px-6 border-r text-[14px] normal-case py-2">
          <div className="flex items-center gap-1">
            <span>Selling Price</span>
          </div>
        </th>
        <th scope="col" className="px-6 border-r text-[14px] normal-case py-2">
          <div className="flex items-center gap-1">
            <span>Manager Commission</span>
          </div>
        </th>
        {userRole !== "manager" && (
          <th
            scope="col"
            className="px-6 border-r text-[14px] normal-case py-2">
            <div className="flex items-center gap-1">
              <span>Location</span>
            </div>
          </th>
        )}
        {userRole !== "manager" && (
          <th
            scope="col"
            className="px-6 border-r text-[14px] normal-case py-2">
            <div className="flex items-center gap-1">
              <span>Manager</span>
            </div>
          </th>
        )}
        <th scope="col" className="px-6 text-[14px] normal-case py-2">
          <div className="flex items-center gap-1">
            <span>Actions</span>
          </div>
        </th>
      </tr>
    </thead>
  );
});

TableHeader.displayName = "TableHeader";

// Phone Table Row Component
const PhoneTableRow = React.memo(
  ({
    phone,
    index,
    userRole,
    onEdit,
    onCheckout,
    onDelete,
    onDeclareLost,
    isUpdating = false,
    show,
  }) => {
    // Safety check for phone data
    if (!phone) return null;

    const hideActions = userRole === "shop keeper";

    return (
      <tr
        className={`bg-white border-b hover:bg-blue-50 border-l-4 transition-opacity duration-200 ${
          isUpdating ? "opacity-50" : "opacity-100"
        } ${
          (phone?.daysSinceAssigned || 0) < 5 && phone?.status !== "lost"
            ? "border-l-green-500"
            : (phone?.daysSinceAssigned || 0) >= 5 &&
              (phone?.daysSinceAssigned || 0) < 7
            ? "border-l-amber-500"
            : "border-l-red-500"
        }`}>
        <td className="px-2 py-2 border-r font-medium text-gray-900">
          {index + 1}
        </td>
        <td className="px-2 border-r py-2 capitalize">
          {phone?.daysSinceAssigned || 0}
        </td>
        <td className="px-2 border-r py-2 capitalize">{phone?.modelName}</td>
        <td className="px-6 border-r py-2 capitalize">{phone?.imei}</td>
        <td className="px-6 border-r py-2 capitalize">{phone?.capacity}GB</td>
        {userRole !== "manager" && (
          <td className="px-6 border-r py-2">{phone?.supplierName}</td>
        )}
        {userRole !== "manager" && (
          <td className="px-6 border-r py-2">Ksh {phone?.purchasePrice}</td>
        )}
        <td className="px-6 border-r py-2">Ksh {phone?.sellingPrice}</td>
        <td className="px-6 border-r py-2">{phone?.managerCommission}</td>
        {userRole !== "manager" && (
          <td className="px-6 border-r py-2 capitalize">
            {phone?.managerLocation}
          </td>
        )}
        {userRole !== "manager" && (
          <td className="px-6 border-r py-2 capitalize">
            {phone?.managerName}
          </td>
        )}
        {!hideActions && (
          <td className="px-6 py-2 flex flex-col md:flex-row items-center md:space-x-5 space-y-2 md:space-y-0">
            {phone?.status === "lost" ? (
              <button
                onClick={() => onDeclareLost(phone?.id)}
                disabled={isUpdating}
                aria-label={`Restore ${phone?.modelName || "phone"}`}
                className={`flex flex-row justify-center w-32 items-center gap-2 p-1 rounded-xl border text-black border-green-500 hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                  userRole === "manager" ? "hidden" : "flex"
                }`}>
                <MdSettingsBackupRestore />
                Activate
              </button>
            ) : (
              <>
                <button
                  onClick={() => onCheckout(phone)}
                  disabled={isUpdating}
                  aria-label={`Sale ${phone?.modelName || "phone"}`}
                  className="flex flex-row justify-center items-center w-20 gap-2 p-1 rounded-xl border text-black border-green-500 hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                  <BiCartAdd />
                  Sale
                </button>
                <button
                  onClick={() => onEdit(phone)}
                  disabled={isUpdating}
                  aria-label={`Edit ${phone?.modelName || "phone"}`}
                  className={`${
                    userRole === "manager" ? "hidden" : "flex"
                  } flex-row justify-center w-20 items-center gap-2 p-1 rounded-xl border text-black border-amber-500 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}>
                  <BiEdit />
                  Edit
                </button>
                {userRole === "super admin" && (
                  <button
                    onClick={() => onDelete(phone?.imei)}
                    disabled={isUpdating}
                    aria-label={`Delete ${phone?.modelName || "phone"}`}
                    className="flex flex-row justify-center items-center gap-2 px-2 py-1 rounded-xl border text-black border-rose-500 hover:bg-rose-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                    <MdDeleteOutline />
                    Delete
                  </button>
                )}
              </>
            )}
          </td>
        )}
      </tr>
    );
  }
);

PhoneTableRow.displayName = "PhoneTableRow";

// Memoized row component for virtualization
const VirtualizedPhoneRow = React.memo(({ index, style, data }) => {
  const {
    phones,
    userRole,
    show,
    onEdit,
    onCheckout,
    onDelete,
    onDeclareLost,
  } = data;
  const phone = phones[index];

  if (!phone) return null;

  return (
    <div style={style} className="flex border-b hover:bg-blue-50">
      <div className="flex w-full">
        <div className="px-2 py-2 border-r font-medium text-gray-900 w-16">
          {index + 1}
        </div>
        <div className="px-2 border-r py-2 w-16">
          {phone?.daysSinceAssigned || 0}
        </div>
        <div className="px-2 border-r py-2 w-32 capitalize truncate">
          {phone?.modelName}
        </div>
        <div className="px-6 border-r py-2 w-48 truncate">{phone?.imei}</div>
        <div className="px-6 border-r py-2 w-24">{phone?.capacity}GB</div>
        {userRole !== "manager" && (
          <>
            <div className="px-6 border-r py-2 w-32 truncate">
              {phone?.supplierName}
            </div>
            <div className="px-6 border-r py-2 w-32">
              Ksh {phone?.purchasePrice}
            </div>
          </>
        )}
        <div className="px-6 border-r py-2 w-32">Ksh {phone?.sellingPrice}</div>
        <div className="px-6 border-r py-2 w-32">
          {phone?.managerCommission}
        </div>
        {userRole !== "manager" && (
          <>
            <div className="px-6 border-r py-2 w-32 capitalize truncate">
              {phone?.managerLocation}
            </div>
            <div className="px-6 border-r py-2 w-32 capitalize truncate">
              {phone?.managerName}
            </div>
          </>
        )}
        {userRole !== "shop keeper" && (
          <div className="px-6 py-2 flex flex-row items-center space-x-2 w-48">
            {phone?.status === "lost" ? (
              <button
                onClick={() => onDeclareLost(phone?.id)}
                className={`flex flex-row justify-center w-32 items-center gap-2 p-1 rounded-xl border text-black border-green-500 hover:bg-green-300 transition-all duration-200 ${
                  userRole === "manager" ? "hidden" : "flex"
                }`}>
                <MdSettingsBackupRestore />
                Activate
              </button>
            ) : (
              <>
                <button
                  onClick={() => onCheckout(phone)}
                  className="flex flex-row justify-center items-center w-20 gap-2 p-1 rounded-xl border text-black border-green-500 hover:bg-green-300 transition-all duration-200">
                  <BiCartAdd />
                  Sale
                </button>
                <button
                  onClick={() => onEdit(phone)}
                  className={`${
                    userRole === "manager" ? "hidden" : "flex"
                  } flex-row justify-center w-20 items-center gap-2 p-1 rounded-xl border text-black border-amber-500 hover:bg-amber-300 transition-all duration-200`}>
                  <BiEdit />
                  Edit
                </button>
                {userRole === "super admin" && (
                  <button
                    onClick={() => onDelete(phone?.imei)}
                    className="flex flex-row justify-center items-center gap-2 px-2 py-1 rounded-xl border text-black border-rose-500 hover:bg-rose-300 transition-all duration-200">
                    <MdDeleteOutline />
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

VirtualizedPhoneRow.displayName = "VirtualizedPhoneRow";

// Optimized pagination component
const PaginatedPhoneTable = React.memo(
  ({
    phones,
    userRole,
    show,
    onEdit,
    onCheckout,
    onDelete,
    onDeclareLost,
    pageSize = 50,
  }) => {
    const [currentPage, setCurrentPage] = useState(0);

    const paginatedPhones = useMemo(() => {
      const start = currentPage * pageSize;
      const end = start + pageSize;
      return phones.slice(start, end);
    }, [phones, currentPage, pageSize]);

    const totalPages = Math.ceil(phones.length / pageSize);

    const handlePageChange = useCallback((newPage) => {
      setCurrentPage(newPage);
    }, []);

    return (
      <div>
        <table className="w-full text-sm text-left text-gray-500">
          <TableHeader userRole={userRole} />
          <tbody>
            {paginatedPhones.map((phone, index) => (
              <PhoneTableRow
                key={phone?.id}
                phone={phone}
                index={currentPage * pageSize + index}
                userRole={userRole}
                onEdit={onEdit}
                show={show}
                onCheckout={onCheckout}
                onDelete={onDelete}
                onDeclareLost={onDeclareLost}
              />
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 py-4">
            <button
              onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1 border rounded disabled:opacity-50">
              Previous
            </button>

            <span className="px-3 py-1">
              Page {currentPage + 1} of {totalPages}
            </span>

            <button
              onClick={() =>
                handlePageChange(Math.min(totalPages - 1, currentPage + 1))
              }
              disabled={currentPage === totalPages - 1}
              className="px-3 py-1 border rounded disabled:opacity-50">
              Next
            </button>
          </div>
        )}
      </div>
    );
  }
);

PaginatedPhoneTable.displayName = "PaginatedPhoneTable";

// Performance monitoring component
const PerformanceMonitor = React.memo(({ phones, isLoading }) => {
  const metrics = useMemo(() => {
    const now = Date.now();
    return {
      phoneCount: phones.length,
      averageDays:
        phones.length > 0
          ? phones.reduce(
              (sum, phone) => sum + (phone.daysSinceAssigned || 0),
              0
            ) / phones.length
          : 0,
      oldPhones: phones.filter((phone) => (phone.daysSinceAssigned || 0) >= 5)
        .length,
      renderTime: now,
    };
  }, [phones]);

  if (isLoading) return null;

  return (
    <div className="text-xs text-gray-500 p-2 bg-gray-50 border-t">
      <div className="flex space-x-4">
        <span>📱 {metrics.phoneCount} phones</span>
        <span>📅 Avg: {metrics.averageDays.toFixed(1)} days</span>
        <span>⚠️ {metrics.oldPhones} phones ≥5 days</span>
      </div>
    </div>
  );
});

PerformanceMonitor.displayName = "PerformanceMonitor";

// Main optimized table component
const OptimizedPhoneTable = React.memo(
  ({
    phones,
    isLoading,
    userRole,
    show,
    searchQuery,
    filterByDaysOnly,
    hasMorePhones,
    onFetchMore,
    onEdit,
    onCheckout,
    onDelete,
    onDeclareLost,
    useVirtualization = false,
    usePagination = true,
  }) => {
    // Determine which rendering strategy to use based on data size
    const shouldUseVirtualization = phones.length > 2000 || useVirtualization;
    const shouldUsePagination =
      phones.length > 100 && !shouldUseVirtualization && usePagination;

    // Show loading skeleton
    if (isLoading) {
      return <TableSkeleton userRole={userRole} />;
    }

    // Calculate colspan for empty state
    const getColspan = () => {
      let colspan = 5; // Base columns
      if (userRole !== "manager") colspan += 4;
      colspan += 2;
      if (userRole !== "shop keeper") colspan += 1;
      return colspan.toString();
    };

    // Show empty state
    if (phones.length === 0) {
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <TableHeader userRole={userRole} />
            <tbody>
              <tr>
                <td colSpan={getColspan()} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-16 h-16 text-gray-300">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2v8h10V6H5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">
                      {filterByDaysOnly && searchQuery
                        ? `No phones found that are ${searchQuery} days or older.`
                        : `No ${
                            show === "active" ? "active" : "lost"
                          } phones found.`}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {searchQuery && !filterByDaysOnly
                        ? "Try adjusting your search criteria"
                        : "Check back later for new inventory"}
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    // Choose rendering strategy
    if (shouldUseVirtualization) {
      // Virtualized rendering for large datasets
      return (
        <div className="overflow-x-auto">
          <List
            height={600}
            itemCount={phones.length}
            itemSize={60}
            itemData={{
              phones,
              userRole,
              show,
              onEdit,
              onCheckout,
              onDelete,
              onDeclareLost,
            }}>
            {VirtualizedPhoneRow}
          </List>
          <PerformanceMonitor phones={phones} isLoading={isLoading} />
        </div>
      );
    } else if (shouldUsePagination) {
      // Paginated rendering for medium datasets
      return (
        <div className="overflow-x-auto">
          <PaginatedPhoneTable
            phones={phones}
            userRole={userRole}
            show={show}
            onEdit={onEdit}
            onCheckout={onCheckout}
            onDelete={onDelete}
            onDeclareLost={onDeclareLost}
          />
          <PerformanceMonitor phones={phones} isLoading={isLoading} />
        </div>
      );
    } else {
      // Regular rendering for small datasets (original implementation)
      return (
        <div className="overflow-x-auto">
          <InfiniteScroll
            dataLength={phones.length}
            next={onFetchMore}
            hasMore={hasMorePhones}
            loader={
              <div className="flex justify-center py-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-600">
                    Loading more phones...
                  </p>
                </div>
              </div>
            }
            scrollableTarget="scrollableDiv">
            <div className="max-h-[57vh] overflow-y-auto" id="scrollableDiv">
              <table className="w-full text-sm text-left text-gray-500">
                <TableHeader userRole={userRole} />
                <tbody>
                  {phones.map((phone, index) => (
                    <PhoneTableRow
                      key={phone?.id}
                      phone={phone}
                      index={index}
                      userRole={userRole}
                      onEdit={onEdit}
                      show={show}
                      onCheckout={onCheckout}
                      onDelete={onDelete}
                      onDeclareLost={onDeclareLost}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </InfiniteScroll>
          <PerformanceMonitor phones={phones} isLoading={isLoading} />
        </div>
      );
    }
  },
  (prevProps, nextProps) => {
    // Optimized comparison
    const keys = [
      "phones",
      "isLoading",
      "userRole",
      "show",
      "hasMorePhones",
      "isLoadingMore",
    ];

    // Deep comparison for phones array if lengths are different
    if (prevProps.phones.length !== nextProps.phones.length) {
      return false;
    }

    // Shallow comparison for other props
    return keys.every((key) => prevProps[key] === nextProps[key]);
  }
);

OptimizedPhoneTable.displayName = "OptimizedPhoneTable";

export default OptimizedPhoneTable;
