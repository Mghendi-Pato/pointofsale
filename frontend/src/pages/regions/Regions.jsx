import { useEffect, useState } from "react";
import { MdChevronRight } from "react-icons/md";
import { TfiStatsDown } from "react-icons/tfi";
import { IoIosStarOutline } from "react-icons/io";
import { TfiStatsUp } from "react-icons/tfi";
import { MdOutlineAttachMoney } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setSidebar } from "../../redux/reducers/ sidebar";
import NewRegion from "../../components/NewRegion";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { deleteQueryRegion, fetchAllRegions } from "../../services/services";
import { MdOutlineNavigateNext } from "react-icons/md";
import { GrFormPrevious } from "react-icons/gr";
import { MdOutlineDelete } from "react-icons/md";
import DeleteConfirmationModal from "../../components/DeleteModal";
import { toast } from "react-toastify";

const Regions = () => {
  const [showAddRegion, setShowAddRegion] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteRegion, setDeleteRegion] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const token = useSelector((state) => state.userSlice.user.token);

  const dispatch = useDispatch();

  useEffect(() => {
    if (showAddRegion) {
      dispatch(setSidebar(false));
    }
  }, [showAddRegion, dispatch]);

  const { data: regions, isLoading: isLoadingRegions } = useQuery(
    ["regions", { page: 1, limit: 100 }],
    ({ queryKey, signal }) => fetchAllRegions({ queryKey, signal, token }),
    {
      keepPreviousData: true,
      enabled: !!token,
    }
  );

  const itemsPerPage = 8;
  // Calculate pagination data
  const totalItems = regions?.regions?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRegions = regions?.regions?.slice(
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

  const useDeleteRegion = () => {
    const queryClient = useQueryClient();

    return useMutation(
      ({ regionId, token }) => deleteQueryRegion(regionId, token),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["regions"]);
          toast.success("Region deleted");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to delete region");
        },
      }
    );
  };

  const deleteRegionMutation = useDeleteRegion();

  const handleDeletRegion = (region) => {
    setShowDeleteModal(true);
    setDeleteRegion(region);
  };
  const handleDelete = () => {
    if (deleteRegion) {
      deleteRegionMutation.mutate({ regionId: deleteRegion, token });
    }
    setShowDeleteModal(false);
  };

  return (
    <div className="p-5 ">
      <div className="flex flex-row justify-end items-center  shadow">
        <div
          className={`p-2 py-3 text-sm font-roboto font-bold bg-primary-400  md:w-36 text-center cursor-pointer`}
          onClick={() => setShowAddRegion(!showAddRegion)}>
          Add region
        </div>
      </div>
      <div className="py-5">
        <div className="min-h-full flex flex-col flex-1">
          <div className="space-y-2 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {isLoadingRegions ? (
                <div className="col-span-full flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-400 mr-2"></div>
                  <p>Loading regions...</p>
                </div>
              ) : totalItems === 0 ? (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500">No regions data found</p>
                </div>
              ) : (
                currentRegions?.map((region, index) => (
                  <div
                    className="p-6 bg-white rounded-sm shadow-sm border border-neutral-200 cursor-pointer transition-all duration-1000 ease-in-out relative"
                    key={index}>
                    <div
                      className="absolute group top-5 right-5 flex flex-row space-x-2 justify-center items-center p-2 cursor-pointer hover:bg-neutral-100 rounded-full transition-all duration-300 ease-in-out"
                      onClick={() => handleDeletRegion(region.id)}>
                      <MdOutlineDelete
                        size={20}
                        className=" text-red-300 transition-all duration-300 ease-in-out group-hover:text-red-500"
                      />
                    </div>

                    <div
                      className={`p-2 ${
                        region?.incomeComparison.startsWith("+")
                          ? "bg-green-100"
                          : "bg-rose-100"
                      }  inline-flex items-center space-x-3 rounded-md`}>
                      {region?.incomeComparison.startsWith("+") ? (
                        <TfiStatsUp size={18} className="text-green-500" />
                      ) : (
                        <TfiStatsDown size={18} className="text-rose-500" />
                      )}

                      <p className={`text-sm font-medium text-neutral-700 `}>
                        {region?.incomeComparison} sales
                      </p>
                    </div>
                    <div className="flex flex-row items-center space-x-3 py-4">
                      <p className="font-roboto font-semibold text-sm md:text-base text-neutral-800">
                        {region?.location}
                      </p>
                      <MdChevronRight
                        size={24}
                        className={` ${
                          region?.incomeComparison.startsWith("+")
                            ? "text-green-500"
                            : "text-rose-500"
                        }  `}
                      />
                    </div>
                    <div className="flex flex-row items-center space-x-4">
                      <MdOutlineAttachMoney
                        size={18}
                        className={` ${
                          region?.incomeComparison.startsWith("+")
                            ? "text-green-500"
                            : "text-rose-500"
                        }  `}
                      />
                      <div>
                        <p className="font-roboto font-semibold text-sm text-neutral-800">
                          Ksh {region?.totalIncome}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Total sales this month
                        </p>
                      </div>
                    </div>
                    <hr className="my-4 border-neutral-200" />
                    <div className="flex flex-row items-center space-x-4">
                      <IoIosStarOutline
                        size={18}
                        className={`  ${
                          region?.incomeComparison.startsWith("+")
                            ? "text-green-500"
                            : "text-rose-500"
                        }  `}
                      />
                      <div>
                        <p className="font-roboto font-semibold text-sm text-neutral-800">
                          {region?.totalPhonesSold}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Completed orders
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {totalPages > 1 && (
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
                  currentPage !== totalPages
                    ? "bg-primary-300"
                    : "bg-neutral-300"
                } p-1 rounded-full cursor-pointer`}>
                <MdOutlineNavigateNext size={20} />
              </div>
            </div>
          )}
        </div>
      </div>
      <NewRegion
        showAddRegion={showAddRegion}
        setShowAddRegion={setShowAddRegion}
      />
      <DeleteConfirmationModal
        showDeleteModal={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        title={`Confirm Deletion!`}
        message="Deleted region cannot be retrieved"
      />
    </div>
  );
};

export default Regions;
