import { useQuery } from "react-query";
import { searchPhonesByIMEI } from "../services/services";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const PhoneDetails = () => {
  const token = useSelector((state) => state.userSlice.user.token);
  const usePhoneByIMEI = (imei, token) => {
    return useQuery(
      ["phone", imei], // Unique query key
      ({ queryKey, signal }) =>
        searchPhonesByIMEI({ imei: queryKey[1], token, signal }),
      {
        enabled: !!imei && !!token,
        staleTime: 1000 * 60 * 5,
        retry: 2,
      }
    );
  };

  function formatDate(date) {
    const options = { day: "numeric", month: "short", year: "numeric" };
    const formattedDate = new Intl.DateTimeFormat("en-GB", options).format(
      date
    );

    // Extract the day and add the ordinal suffix
    const day = date.getDate();
    const ordinalSuffix = getOrdinalSuffix(day);

    // Combine day with ordinal suffix and the rest of the date
    return formattedDate.replace(day, `${day}${ordinalSuffix}`);
  }

  function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return "th"; // Covers 4-20
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  const { imei } = useParams();

  const { data: phones, isLoading, isError } = usePhoneByIMEI(imei, token);

  const phone = phones?.find((phone) => phone.imei === imei);

  console.log(phone);

  return (
    <div className=" p-5 w-full flex flex-col md:flex-row items-center gap-5">
      <div className="border border-neutral-100 p-5 rounded-2xl shadow-sm w-full flex flex-col">
        <p className="text-lg font-roboto font-bold text-center md:text-left py-5">
          Phone & Customer Details
        </p>
        {isLoading && <p>Loading phone details ...</p>}
        {isLoading && <p>Error fetching details...</p>}
        {!isLoading && !isError && (
          <div className="flex flex-row justify-center gap-6">
            <div className="flex-1 flex flex-col space-y-5">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <p className="text-neutral-400">Model</p>
                  <p className=" font-medium capitalize">
                    {phone?.phoneModel?.model}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-neutral-400">IMEI</p>
                  <p className=" font-medium capitalize">{phone?.imei}</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <p className="text-neutral-400">Buying Price</p>
                  <p className=" font-medium capitalize">
                    {phone?.purchasePrice}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-neutral-400">Selling Price</p>
                  <p className=" font-medium capitalize">
                    {phone?.sellingPrice}
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <p className="text-neutral-400">Supply Date</p>
                  <p className=" font-medium capitalize">
                    {formatDate(new Date(phone?.buyDate))}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-neutral-400">Selling Date</p>
                  <p className=" font-medium capitalize">
                    {formatDate(new Date(phone?.saleDate))}
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <p className="text-neutral-400">Supplier</p>
                  <p className=" font-medium capitalize">
                    {phone?.supplier?.name}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-neutral-400">Capacity</p>
                  <p className=" font-medium capitalize">
                    {phone?.capacity} GB
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <p className="text-neutral-400">Company</p>
                  <p className=" font-medium capitalize">{phone?.company}</p>
                </div>
                <div className="flex-1">
                  <p className="text-neutral-400">Manager</p>
                  <p className=" font-medium capitalize">
                    {phone?.manager?.firstName} {phone?.manager?.lastName}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col space-y-5">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <p className="text-neutral-400">Region</p>
                  <p className=" font-medium capitalize">
                    {phone?.manager?.region?.name}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-neutral-400">Location</p>
                  <p className=" font-medium capitalize">
                    {phone?.manager?.region?.location}
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <p className="text-neutral-400">Customer ID</p>
                  <p className=" font-medium capitalize">
                    {phone?.customer?.ID}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-neutral-400">Customer Name</p>
                  <p className=" font-medium capitalize">
                    {phone?.customer?.firstName} {phone?.customer?.middleName}{" "}
                    {phone?.customer?.lastName}
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <p className="text-neutral-400">Customer Phn</p>
                  <p className=" font-medium capitalize">
                    {phone?.customer?.phoneNumber}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-neutral-400">Next of Kin Name</p>
                  <p className=" font-medium capitalize">
                    {phone?.customer?.nkLastName} {phone?.customer?.nkFirstName}
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <p className="text-neutral-400">Next of Kin Phn</p>
                  <p className=" font-medium capitalize">
                    {phone?.customer?.nkPhone}
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <p className="text-neutral-400">Status</p>
                  <p className=" font-medium capitalize">{phone?.status}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneDetails;
