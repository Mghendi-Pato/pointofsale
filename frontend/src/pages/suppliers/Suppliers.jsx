import { useEffect, useState } from "react";
import {
  MdChevronRight,
  MdOutlineDelete,
  MdOutlineNavigateNext,
} from "react-icons/md";
import { TfiStatsDown } from "react-icons/tfi";
import { TfiStatsUp } from "react-icons/tfi";
import { IoIosStarOutline } from "react-icons/io";
import { MdOutlineAttachMoney } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setSidebar } from "../../redux/reducers/ sidebar";
import NewSupplier from "../../components/NewSupplier";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  deleteQuerySupplier,
  fetchAllSuppliers,
} from "../../services/services";
import { GrFormPrevious } from "react-icons/gr";
import { toast } from "react-toastify";
import DeleteConfirmationModal from "../../components/DeleteModal";
import { useNavigate } from "react-router-dom";

// Skeleton components
const SkeletonPulse = () => (
  <div className="animate-pulse bg-gray-200 rounded-md h-full w-full" />
);

const SupplierCardSkeleton = () => (
  <div className="p-6 bg-white rounded-sm shadow-sm border border-neutral-200 relative">
    <div className="absolute top-5 right-5">
      <div className="h-8 w-8 rounded-full">
        <SkeletonPulse />
      </div>
    </div>
    <div className="p-2 bg-gray-100 inline-flex items-center space-x-3 rounded-md">
      <div className="h-[18px] w-[18px]">
        <SkeletonPulse />
      </div>
      <div className="h-4 w-24">
        <SkeletonPulse />
      </div>
    </div>
    <div className="flex flex-row items-center space-x-3 py-4">
      <div className="h-5 w-32">
        <SkeletonPulse />
      </div>
      <div className="h-6 w-6">
        <SkeletonPulse />
      </div>
    </div>
    <div className="flex flex-row items-center space-x-4">
      <div className="h-[18px] w-[18px]">
        <SkeletonPulse />
      </div>
      <div>
        <div className="h-4 w-28 mb-2">
          <SkeletonPulse />
        </div>
        <div className="h-3 w-24">
          <SkeletonPulse />
        </div>
      </div>
    </div>
    <hr className="my-4 border-neutral-200" />
    <div className="flex flex-row items-center space-x-4">
      <div className="h-[18px] w-[18px]">
        <SkeletonPulse />
      </div>
      <div>
        <div className="h-4 w-16 mb-2">
          <SkeletonPulse />
        </div>
        <div className="h-3 w-28">
          <SkeletonPulse />
        </div>
      </div>
    </div>
  </div>
);

const SuppliersGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array(count)
      .fill(0)
      .map((_, index) => (
        <SupplierCardSkeleton key={index} />
      ))}
  </div>
);

const Suppliers = () => {
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteSupplier, setDeleteSupplier] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const token = useSelector((state) => state.userSlice.user.token);
  const user = useSelector((state) => state.userSlice.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (showAddSupplier) {
      dispatch(setSidebar(false));
    }
  }, [showAddSupplier, dispatch]);

  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery(
    ["suppliers", { page: 1, limit: 100 }],
    ({ queryKey, signal }) => fetchAllSuppliers({ queryKey, signal, token }),
    {
      keepPreviousData: true,
      enabled: !!token,
    }
  );

  const itemsPerPage = 8;
  // Calculate pagination data
  const totalItems = suppliers?.suppliers?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSuppliers = suppliers?.suppliers?.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const useDeleteSupplier = () => {
    const queryClient = useQueryClient();

    return useMutation(
      ({ supplierId, token }) => deleteQuerySupplier(supplierId, token),
      {
        onSuccess: (response) => {
          queryClient.invalidateQueries(["suppliers"]);
          toast.success("Supplier deleted");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to delete supplier");
        },
      }
    );
  };

  const deleteSupplierMutation = useDeleteSupplier();

  const handleDeletSupplier = (region) => {
    setShowDeleteModal(true);
    setDeleteSupplier(region);
  };
  const handleDelete = () => {
    if (deleteSupplier) {
      deleteSupplierMutation.mutate({ supplierId: deleteSupplier, token });
    }
    setShowDeleteModal(false);
  };

  useEffect(() => {
    if (!["super admin", "admin"].includes(user?.role)) {
      navigate("/inventory");
    }
  }, [user, navigate]);

  return (
    <div className="p-5 ">
      <div className="flex flex-row justify-end items-center shadow">
        <div
          className={`p-2 py-3 text-sm font-roboto font-bold ${
            isLoadingSuppliers ? "bg-gray-400" : "bg-primary-400"
          } w-[33%] md:w-36 text-center ${
            isLoadingSuppliers ? "cursor-not-allowed" : "cursor-pointer"
          }`}
          onClick={
            isLoadingSuppliers
              ? undefined
              : () => setShowAddSupplier(!showAddSupplier)
          }>
          Add supplier
        </div>
      </div>
      <div className="py-5 ">
        {isLoadingSuppliers ? (
          // Skeleton loading state
          <SuppliersGridSkeleton count={itemsPerPage} />
        ) : totalItems === 0 ? (
          // Empty state
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">No suppliers data found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentSuppliers?.map((supplier, index) => (
              <div
                className="p-6 bg-white rounded-sm shadow-sm border border-neutral-200 cursor-pointer transition-all duration-1000 ease-in-out relative"
                key={index}>
                <div
                  className="absolute group top-5 right-5 flex flex-row space-x-2 justify-center items-center p-2 cursor-pointer hover:bg-neutral-100 rounded-full transition-all duration-300 ease-in-out"
                  onClick={() => handleDeletSupplier(supplier?.id)}>
                  <MdOutlineDelete
                    size={20}
                    className=" text-red-300 transition-all duration-300 ease-in-out group-hover:text-red-500"
                  />
                </div>
                <div
                  className={`p-2 ${
                    supplier?.percentageChange.startsWith("-")
                      ? "bg-rose-100"
                      : "bg-green-100"
                  } inline-flex items-center space-x-3 rounded-md`}>
                  {supplier?.percentageChange.startsWith("-") ? (
                    <TfiStatsDown size={18} className="text-rose-500" />
                  ) : (
                    <TfiStatsUp size={18} className="text-green-500" />
                  )}

                  <p className="text-sm font-medium text-neutral-700">
                    {supplier?.percentageChange} sales
                  </p>
                </div>
                <div className="flex flex-row items-center space-x-3 py-4">
                  <p className="font-roboto font-semibold text-sm md:text-base text-neutral-800">
                    {supplier.name}
                  </p>
                  <MdChevronRight
                    size={24}
                    className={`${
                      supplier?.percentageChange.startsWith("-")
                        ? "text-rose-500"
                        : "text-green-500"
                    }`}
                  />
                </div>
                <div className="flex flex-row items-center space-x-4">
                  <MdOutlineAttachMoney
                    size={18}
                    className={`${
                      supplier?.percentageChange.startsWith("-")
                        ? "text-rose-500"
                        : "text-green-500"
                    }`}
                  />
                  <div>
                    <p className="font-roboto font-semibold text-sm text-neutral-800">
                      Ksh {supplier?.totalBuyingPriceThisMonth}
                    </p>
                    <p className="text-xs text-neutral-500">Total Supplies</p>
                  </div>
                </div>
                <hr className="my-4 border-neutral-200" />
                <div className="flex flex-row items-center space-x-4">
                  <IoIosStarOutline
                    size={18}
                    className={`${
                      supplier?.percentageChange.startsWith("-")
                        ? "text-rose-500"
                        : "text-green-500"
                    }`}
                  />
                  <div>
                    <p className="font-roboto font-semibold text-sm text-neutral-800">
                      {supplier?.totalPhonesThisMonth}
                    </p>
                    <p className="text-xs text-neutral-500">Phones Supplied</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoadingSuppliers && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 py-5 mt-auto bg-white">
            <span className="text-sm font-medium text-neutral-700">
              {`${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                currentPage * itemsPerPage,
                totalItems
              )} of ${totalItems}`}
            </span>
            <div
              onClick={handleBack}
              disabled={currentPage === 1}
              className={`${
                currentPage !== 1 ? "bg-primary-300" : "bg-neutral-300"
              } p-1 rounded-full cursor-pointer`}>
              <GrFormPrevious size={20} className="text-neutral-700" />
            </div>

            <div
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`${
                currentPage !== totalPages ? "bg-primary-300" : "bg-neutral-300"
              } p-1 rounded-full cursor-pointer`}>
              <MdOutlineNavigateNext size={20} />
            </div>
          </div>
        )}
      </div>
      <NewSupplier
        showAddSupplier={showAddSupplier}
        setShowAddSupplier={setShowAddSupplier}
      />
      <DeleteConfirmationModal
        showDeleteModal={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        title={`Confirm Deletion!`}
        message="Deleted supplier cannot be retrieved"
      />
    </div>
  );
};

export default Suppliers;
