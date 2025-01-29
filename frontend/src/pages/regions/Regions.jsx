import { useEffect, useState } from "react";
import { RiShoppingBagLine } from "react-icons/ri";
import { GiReceiveMoney } from "react-icons/gi";
import { TbTruckDelivery } from "react-icons/tb";
import { MdChevronRight } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { MdKeyboardArrowDown } from "react-icons/md";
import { IoTrashBinOutline } from "react-icons/io5";
import { TfiStatsDown } from "react-icons/tfi";
import { IoIosStarOutline } from "react-icons/io";
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
  const [show, setShow] = useState("active");
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [showAddRegion, setShowAddRegion] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteRegion, setDeleteRegion] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const token = useSelector((state) => state.userSlice.user.token);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleMediaChange = () => setIsSmallScreen(mediaQuery.matches);
    handleMediaChange();
    mediaQuery.addEventListener("change", handleMediaChange);
    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  useEffect(() => {
    if (showAddRegion) {
      dispatch(setSidebar(false));
    }
  }, [showAddRegion, dispatch]);

  const { data: regions } = useQuery(
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
        onSuccess: (response) => {
          queryClient.invalidateQueries(["regions"]);
          toast.success("Region deleted successfully");
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
      <div className="flex flex-row justify-between items-center  shadow">
        <div className="flex flex-row items-center space-x-5 w-[66%]">
          <div
            className={`p-2 py-3 text-sm font-roboto font-bold w-[50%] md:w-36 text-center cursor-pointer ${
              show === "active" ? "bg-primary-400" : "text-gray-600"
            }`}
            onClick={() => setShow("active")}>
            Active
          </div>
          <div
            className={`p-2 py-3 text-sm font-roboto font-bold md:w-36 text-center cursor-pointer w-[50%] ${
              show === "inactive" ? "bg-primary-400" : "text-gray-600"
            }`}
            onClick={() => setShow("inactive")}>
            Inactive
          </div>
        </div>
        <div
          className={`p-2 py-3 text-sm font-roboto font-bold bg-primary-400 w-[33%] md:w-36 text-center cursor-pointer`}
          onClick={() => setShowAddRegion(!showAddRegion)}>
          Add region
        </div>
      </div>
      <div className="">
        <p className="py-2 font-roboto text-neutral-900 font-medium text-sm">
          General stats today
        </p>
        <div className="flex flex-col md:flex-row justify-between items-center bg-white shadow-sm rounded-sm p-4 border border-neutral-200">
          <div className="flex flex-wrap items-center gap-6 md:gap-12">
            <div className="flex flex-row items-center w-40 space-x-4 cursor-pointer  p-2 rounded-md transition">
              <RiShoppingBagLine
                size={isSmallScreen ? 22 : 28}
                className="text-primary-500"
              />
              <div>
                <p className="font-roboto font-bold text-base text-neutral-800">
                  120
                </p>
                <p className="text-sm text-neutral-500">
                  Total orders completed
                </p>
              </div>
            </div>
            <div className="flex flex-row items-center w-40 space-x-4 cursor-pointer  p-2 rounded-md transition">
              <GiReceiveMoney
                size={isSmallScreen ? 22 : 28}
                className="text-primary-500"
              />
              <div>
                <p className="font-roboto font-bold text-base text-neutral-800">
                  Ksh 456,000
                </p>
                <p className="text-sm text-neutral-500">Income earned</p>
              </div>
            </div>
            <div className="flex flex-row items-center w-40 space-x-4 cursor-pointer  p-2 rounded-md transition">
              <TbTruckDelivery
                size={isSmallScreen ? 22 : 28}
                className="text-primary-500"
              />
              <div>
                <p className="font-roboto font-bold text-base text-neutral-800">
                  170
                </p>
                <p className="text-sm text-neutral-500">New phones received</p>
              </div>
            </div>
            <div className="flex flex-row items-center w-40 space-x-4 cursor-pointer  p-2 rounded-md transition">
              <IoTrashBinOutline
                size={isSmallScreen ? 22 : 22}
                className="text-primary-500"
              />
              <div>
                <p className="font-roboto font-bold text-base text-neutral-800">
                  2
                </p>
                <p className="text-sm text-neutral-500">Phones lost</p>
              </div>
            </div>
          </div>
          <div
            className="flex flex-row items-center space-x-3 mt-4 md:mt-0 cursor-pointer text-primary-500 hover:text-primary-700 transition"
            onClick={() => navigate("/reports")}>
            <p className="font-roboto font-medium text-sm md:text-base">
              Click for details
            </p>
            {isSmallScreen ? (
              <MdKeyboardArrowDown size={30} />
            ) : (
              <MdChevronRight size={30} />
            )}
          </div>
        </div>
        <p className="py-2 font-roboto text-neutral-900 text-sm font-medium">
          Regional stats today
        </p>
        <div className="min-h-full flex flex-col flex-1">
          <div className="space-y-2 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {totalItems === 0 && <p>No regions data found</p>}
              {currentRegions?.map((region, index) => (
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

                  <div className="p-2 bg-rose-100 inline-flex items-center space-x-3 rounded-md">
                    <TfiStatsDown size={18} className="text-rose-500" />
                    <p className="text-sm font-medium text-neutral-700">
                      20% less sales
                    </p>
                  </div>
                  <div className="flex flex-row items-center space-x-3 py-4">
                    <p className="font-roboto font-semibold text-sm md:text-base text-neutral-800">
                      {region.location}
                    </p>
                    <MdChevronRight size={24} className="text-rose-500" />
                  </div>
                  <div className="flex flex-row items-center space-x-4">
                    <MdOutlineAttachMoney size={18} className="text-rose-500" />
                    <div>
                      <p className="font-roboto font-semibold text-sm text-neutral-800">
                        Ksh 160,000
                      </p>
                      <p className="text-xs text-neutral-500">
                        Average income today
                      </p>
                    </div>
                  </div>
                  <hr className="my-4 border-neutral-200" />
                  <div className="flex flex-row items-center space-x-4">
                    <IoIosStarOutline size={18} className="text-rose-500" />
                    <div>
                      <p className="font-roboto font-semibold text-sm text-neutral-800">
                        6
                      </p>
                      <p className="text-xs text-neutral-500">
                        Completed orders
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
