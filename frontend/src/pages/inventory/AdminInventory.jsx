import { TextField } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSidebar } from "../../redux/reducers/ sidebar";
import { useInfiniteQuery, useMutation, useQueryClient } from "react-query";
import {
  declarePhoneLost,
  fetchActivePhones,
  fetchLostPhones,
} from "../../services/services";
import { BiCartAdd } from "react-icons/bi";
import { BiEdit } from "react-icons/bi";
import NewPhone from "../../components/NewPhone";
import InfiniteScroll from "react-infinite-scroll-component";
import EditPhone from "../../components/EditPhone";
import PhoneCheckout from "../../components/PhoneCheckout";
import { MdSettingsBackupRestore } from "react-icons/md";
import { toast } from "react-toastify";

const AdminInventory = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.userSlice.user.token);
  const [showAddPhone, setShowAddPhone] = useState(false);
  const [show, setShow] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [editPhone, setEditPhone] = useState([]);
  const [showEditPhoneModal, setShowEditPhoneModal] = useState(false);
  const [showPhoneCheckout, setShowPhoneCheckout] = useState(false);
  const [checkoutPhone, setCheckoutPhone] = useState(null);
  const [declareLostLoading, setDeclareLostLoading] = useState(false);

  const queryClient = useQueryClient();

  const {
    data: activePhonesData,
    fetchNextPage: fetchNextActivePhones,
    hasNextPage: hasMoreActivePhones,
    isFetchingNextPage: isLoadingMoreActivePhones,
  } = useInfiniteQuery(
    ["phones", { status: "active" }],
    ({ pageParam = 1 }) =>
      fetchActivePhones({
        queryKey: ["phones", { page: pageParam, limit: 20 }],
        token,
      }),
    {
      getNextPageParam: (lastPage) => {
        const { page, total, limit } = lastPage;
        return page * limit < total ? page + 1 : undefined;
      },
      enabled: show === "active" && !!token,
    }
  );

  const {
    data: lostPhonesData,
    fetchNextPage: fetchNextLostPhones,
    hasNextPage: hasMoreLostPhones,
    isFetchingNextPage: isLoadingMoreLostPhones,
  } = useInfiniteQuery(
    ["phones", { status: "lost" }],
    ({ pageParam = 1 }) =>
      fetchLostPhones({
        queryKey: ["phones", { page: pageParam, limit: 20 }],
        token,
      }),
    {
      getNextPageParam: (lastPage) => {
        const { page, total, limit } = lastPage;
        return page * limit < total ? page + 1 : undefined;
      },
      enabled: show === "lost" && !!token,
    }
  );

  const useDeclarePhoneLost = () => {
    return useMutation(
      ({ phoneId, token }) => declarePhoneLost(phoneId, token),
      {
        onMutate: () => {
          setDeclareLostLoading(true);
        },
        onSuccess: () => {
          setDeclareLostLoading(false);

          queryClient.invalidateQueries(["phones"]);

          toast.success("Phone restored");
        },
        onError: (error) => {
          setDeclareLostLoading(false);
          toast.error(error.message || "Failed to restore phone");
        },
      }
    );
  };

  const declareLostMutation = useDeclarePhoneLost();

  const activePhones = useMemo(() => {
    return activePhonesData?.pages?.flatMap((page) => page.phones) || [];
  }, [activePhonesData?.pages]);

  const lostPhones = useMemo(() => {
    return lostPhonesData?.pages?.flatMap((page) => page.phones) || [];
  }, [lostPhonesData?.pages]);

  const filteredPhones = useMemo(() => {
    const dataToFilter =
      show === "active" ? activePhones : show === "lost" ? lostPhones : [];
    return dataToFilter.filter((phone) =>
      searchQuery
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .every((part) =>
          [
            phone?.model?.toLowerCase(),
            phone?.imei,
            phone?.supplierName?.toLowerCase(),
            phone?.managerName?.toLowerCase(),
            phone?.managerLocation?.toLowerCase(),
          ].some((field) => field?.includes(part))
        )
    );
  }, [activePhones, lostPhones, searchQuery, show]);

  // Handles search query change
  const handleSearchChange = (event) => setSearchQuery(event.target.value);

  const paginatedPhones = filteredPhones;

  useEffect(() => {
    if (showAddPhone || showEditPhoneModal || showPhoneCheckout) {
      dispatch(setSidebar(false));
    }
  }, [showAddPhone, showEditPhoneModal, showPhoneCheckout, dispatch]);

  const calculateDaysFromDate = (dateString) => {
    const givenDate = new Date(dateString);
    const today = new Date();

    const differenceInMilliseconds = today - givenDate;
    const differenceInDays = Math.floor(
      differenceInMilliseconds / (1000 * 60 * 60 * 24)
    );

    return differenceInDays;
  };

  const onEditPhone = (phone) => {
    setEditPhone(phone);
    setShowEditPhoneModal(true);
  };

  const onCheckoutPhone = (phone) => {
    setCheckoutPhone(phone);
    setShowPhoneCheckout(true);
  };

  const declareLostPhone = (phoneId) => {
    declareLostMutation.mutate({ phoneId, token });
  };

  return (
    <div className="p-5">
      <div className="space-y-2">
        <p className="text-xl font-bold">Inventory</p>
        <div className="flex flex-row items-center w-[66%]">
          <div
            className={`p-2 py-3 text-sm font-roboto font-bold w-[50%] md:w-36 text-center cursor-pointer ${
              show === "active" ? "bg-primary-400" : "text-gray-600"
            }`}
            onClick={() => setShow("active")}>
            Available
          </div>
          <div
            className={`p-2 py-3 text-sm font-roboto font-bold w-[50%] md:w-36 text-center cursor-pointer ${
              show === "lost" ? "bg-primary-400" : "text-gray-600"
            }`}
            onClick={() => setShow("lost")}>
            Lost
          </div>
        </div>
      </div>
      <div className="border border-gray-200">
        <div className="">
          <div className="p-5 flex flex-col space-y-5">
            <div className="flex flex-col md:flex-row-reverse justify-between space-y-5 md:space-y-0">
              <button
                className="p-2 bg-primary-500 hover:scale-105 flex flex-row items-center justify-center h-12 w-[280px] md:w-32 transition-all duration-500 ease-in-out"
                onClick={() => setShowAddPhone(!showAddPhone)}>
                Add inventory
              </button>

              <div className="flex flex-col md:flex-row space-y-5 md:space-y-0 md:space-x-5">
                <div className="flex flex-row justify-between items-center space-x-2 md:space-x-5">
                  <TextField
                    id="outlined-search"
                    label="Search phone..."
                    variant="outlined"
                    sx={{
                      minWidth: { xs: "280px", md: "300px" },
                      "& .MuiInputLabel-root": {
                        "&.Mui-focused": {
                          color: "#2FC3D2",
                        },
                      },
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "#2FC3D2",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#2FC3D2",
                        },
                      },
                    }}
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <InfiniteScroll
              dataLength={filteredPhones.length}
              next={() => {
                if (
                  show === "active" &&
                  hasMoreActivePhones &&
                  !isLoadingMoreActivePhones
                ) {
                  fetchNextActivePhones();
                } else if (
                  show === "lost" &&
                  hasMoreLostPhones &&
                  !isLoadingMoreLostPhones
                ) {
                  fetchNextLostPhones();
                }
              }}
              hasMore={
                show === "active" ? hasMoreActivePhones : hasMoreLostPhones
              }
              loader={
                <div className="flex justify-center py-4">
                  <p>Loading more phones...</p>
                </div>
              }
              scrollableTarget="scrollableDiv">
              <div
                className="max-h-[57vh]  overflow-y-auto "
                id="scrollableDiv">
                <table className="w-full text-sm text-left text-gray-500 sticky top-0 z-10">
                  <thead className="text-xs text-gray-700 uppercase bg-neutral-100 border-b border-gray-200 sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-2 border-r py-2">
                        #
                      </th>
                      <th
                        scope="col"
                        className="px-2 border-r text-[14px] normal-case py-2">
                        Model
                      </th>
                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        IMEI
                      </th>
                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        Capacity
                      </th>
                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        Supplier
                      </th>

                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        Buying Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        Selling Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        Manger Commission
                      </th>
                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        Location
                      </th>
                      <th
                        scope="col"
                        className="px-6 border-r text-[14px] normal-case py-2">
                        Manager
                      </th>
                      <th
                        scope="col"
                        className="px-6 text-[14px] normal-case py-2">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  {(isLoadingMoreActivePhones &&
                    !activePhones &&
                    show === "active") ||
                  (isLoadingMoreLostPhones &&
                    !lostPhonesData &&
                    show !== "active") ? (
                    <p className="p-2">Fetching phone data...</p>
                  ) : paginatedPhones.length === 0 ||
                    paginatedPhones.filter((phone) =>
                      show === "active"
                        ? phone.status === "active"
                        : phone.status !== "active"
                    ).length === 0 ? (
                    <tbody>
                      <tr>
                        <td colSpan="9" className="px-4 pt-2">
                          <p className="text-gray-500">
                            No {show === "active" ? "active" : "lost"} phones
                            found.
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {paginatedPhones
                        ?.filter((phone) =>
                          show === "active"
                            ? phone.status === "active"
                            : phone.status !== "active"
                        )
                        .map((phone, index) => (
                          <tr
                            key={phone.id}
                            className={`bg-white border-b hover:bg-blue-50 border-l-4 ${
                              calculateDaysFromDate(phone.createdAt) < 5 &&
                              phone.status !== "lost"
                                ? "border-l-green-500"
                                : calculateDaysFromDate(phone.createdAt) >= 5 &&
                                  calculateDaysFromDate(phone.createdAt) < 7
                                ? "border-l-amber-500"
                                : "border-l-red-500"
                            }`}>
                            <td className="px-2 py-2 border-r font-medium text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-2 border-r py-2 capitalize">
                              {phone.modelName}
                            </td>
                            <td className="px-6 border-r py-2 capitalize">
                              {phone.imei}
                            </td>
                            <td className="px-6 border-r py-2 capitalize">
                              {phone.capacity}GB
                            </td>
                            <td className="px-6 border-r py-2">
                              {phone.supplierName}
                            </td>

                            <td className="px-6 border-r py-2">
                              Ksh {phone.purchasePrice}
                            </td>
                            <td className="px-6 border-r py-2">
                              Ksh {phone.sellingPrice}
                            </td>
                            <td className="px-6 border-r py-2">
                              {phone.managerCommission}
                            </td>
                            <td className="px-6 border-r py-2 capitalize">
                              {phone.managerLocation}
                            </td>
                            <td className="px-6 border-r py-2 capitalize">
                              {phone.managerName}
                            </td>

                            <td className="px-6 py-2 flex flex-col md:flex-row items-center md:space-x-5 space-y-2 md:space-y-0">
                              {phone?.status === "lost" ? (
                                <button
                                  onClick={() => declareLostPhone(phone.id)}
                                  aria-label={`Analyze ${phone.name}`}
                                  className="flex flex-row justify-center w-32 items-center gap-2 p-1 rounded-xl border text-black border-green-500 hover:bg-green-300">
                                  <MdSettingsBackupRestore />
                                  Activate
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => onEditPhone(phone)}
                                    aria-label={`Analyze ${phone.name}`}
                                    className="flex flex-row justify-center w-20 items-center gap-2 p-1 rounded-xl border text-black border-amber-500 hover:bg-amber-300">
                                    <BiEdit />
                                    Edit
                                  </button>

                                  <button
                                    onClick={() => onCheckoutPhone(phone)}
                                    aria-label={`Analyze ${phone.name}`}
                                    className="flex flex-row justify-center items-center w-20 gap-2 p-1 rounded-xl border text-black border-green-500 hover:bg-green-300">
                                    <BiCartAdd />
                                    Sale
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  )}
                </table>
              </div>
            </InfiniteScroll>
          </div>
        </div>
      </div>
      <NewPhone showAddPhone={showAddPhone} setShowAddPhone={setShowAddPhone} />
      <EditPhone
        showEditPhoneModal={showEditPhoneModal}
        setShowEditPhoneModal={setShowEditPhoneModal}
        phone={editPhone}
        setEditPhone={setEditPhone}
      />
      <PhoneCheckout
        phone={checkoutPhone}
        showPhoneCheckout={showPhoneCheckout}
        setShowPhoneCheckout={setShowPhoneCheckout}
      />
    </div>
  );
};

export default AdminInventory;
