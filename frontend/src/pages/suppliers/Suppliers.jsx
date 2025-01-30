import { useEffect, useState } from "react";
import { GiPayMoney } from "react-icons/gi";
import { TbTruckDelivery } from "react-icons/tb";
import {
  MdChevronRight,
  MdOutlineDelete,
  MdOutlineNavigateNext,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { MdKeyboardArrowDown } from "react-icons/md";
import { CgShoppingCart } from "react-icons/cg";
import { TfiStatsDown } from "react-icons/tfi";
import { IoIosStarOutline } from "react-icons/io";
import { MdOutlineAttachMoney } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setSidebar } from "../../redux/reducers/ sidebar";
import { MdOutlineStoreMallDirectory } from "react-icons/md";
import NewSupplier from "../../components/NewSupplier";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  deleteQuerySupplier,
  fetchAllSuppliers,
} from "../../services/services";
import { GrFormPrevious } from "react-icons/gr";
import { toast } from "react-toastify";
import DeleteConfirmationModal from "../../components/DeleteModal";

const Suppliers = () => {
  const [show, setShow] = useState("active");
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteSupplier, setDeleteSupplier] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
    if (showAddSupplier) {
      dispatch(setSidebar(false));
    }
  }, [showAddSupplier, dispatch]);

  const { data: suppliers } = useQuery(
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
          onClick={() => setShowAddSupplier(!showAddSupplier)}>
          Add supplier
        </div>
      </div>
      <div className="py-5 ">
        <p className="py-2 font-roboto text-neutral-900 text-sm">
          General suppliers monthly stats
        </p>
        <div className="flex flex-col md:flex-row justify-between items-center bg-white shadow-sm rounded-sm p-4 border border-neutral-200">
          <div className="flex flex-wrap items-center gap-6 md:gap-12">
            <div className="flex flex-row items-center w-40 space-x-4 cursor-pointer  p-2 rounded-md transition">
              <TbTruckDelivery
                size={isSmallScreen ? 22 : 28}
                className="text-primary-500"
              />
              <div>
                <p className="font-roboto font-bold text-base text-neutral-800">
                  7
                </p>
                <p className="text-sm text-neutral-500">Total suppliers</p>
              </div>
            </div>
            <div className="flex flex-row items-center w-40 space-x-4 cursor-pointer  p-2 rounded-md transition">
              <CgShoppingCart
                size={isSmallScreen ? 22 : 28}
                className="text-primary-500"
              />
              <div>
                <p className="font-roboto font-bold text-base text-neutral-800">
                  1500
                </p>
                <p className="text-sm text-neutral-500">Total Supplies</p>
              </div>
            </div>
            <div className="flex flex-row items-center w-40 space-x-4 cursor-pointer  p-2 rounded-md transition">
              <GiPayMoney
                size={isSmallScreen ? 22 : 28}
                className="text-primary-500"
              />
              <div>
                <p className="font-roboto font-bold text-base text-neutral-800">
                  Ksh 560,000
                </p>
                <p className="text-sm text-neutral-500">Expenditure</p>
              </div>
            </div>
            <div className="flex flex-row items-center w-60 space-x-4 cursor-pointer  p-2 rounded-md transition">
              <MdOutlineStoreMallDirectory
                size={isSmallScreen ? 22 : 28}
                className="text-primary-500"
              />
              <div>
                <p className="font-roboto font-bold text-base text-neutral-800">
                  Bahari communications
                </p>
                <p className="text-sm text-neutral-500">Top Supplier </p>
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
        <p className="py-2 font-roboto text-neutral-900 text-sm">
          Suppliers monthly stats
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-2">
          {totalItems === 0 && <p>No suppliers data found</p>}
          {currentSuppliers?.map((supplier, index) => (
            <div
              className="p-6 bg-white rounded-sm shadow-sm border border-neutral-200 cursor-pointer transition-all duration-1000 ease-in-out relative"
              key={index}>
              <div
                className="absolute group top-5 right-5 flex flex-row space-x-2 justify-center items-center p-2 cursor-pointer hover:bg-neutral-100 rounded-full transition-all duration-300 ease-in-out"
                onClick={() => handleDeletSupplier(supplier.id)}>
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
                  {supplier.name}
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
                  <p className="text-xs text-neutral-500">Completed orders</p>
                </div>
              </div>
            </div>
          ))}
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
