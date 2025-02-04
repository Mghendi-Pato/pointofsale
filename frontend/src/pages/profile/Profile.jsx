import { RxAvatar } from "react-icons/rx";
import { CiEdit } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import EditProfile from "../../components/EditProfile";
import { setSidebar } from "../../redux/reducers/ sidebar";
const Profile = () => {
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const { user } = useSelector((state) => state.userSlice.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (showEditProfileModal) {
      dispatch(setSidebar(false));
    }
  }, [showEditProfileModal, dispatch]);

  const onEditProfile = () => {
    setShowEditProfileModal(true);
  };

  return (
    <>
      <div className="p-5 md:p-10 space-y-5 md:space-y-10">
        <p className="text-lg font-roboto font-bold text-center md:text-left">
          My profile
        </p>
        <div className="border border-neutral-100 p-5 rounded-2xl shadow-sm w-full flex flex-col md:flex-row items-center justify-between">
          <div className="flex flex-col md:flex-row items-center space-x-0 md:space-x-3">
            <RxAvatar size={60} className="text-neutral-200" />
            <div className="text-center md:text-left mt-3 md:mt-0">
              <p className="text-lg font-medium text-neutral-800 capitalize">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-neutral-500 capitalize">{user.role}</p>
              {user.role === "manager" && (
                <p className="text-sm text-neutral-500 capitalize">
                  {user.region.location}, {user.region.name} region
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              className="flex flex-row items-center border border-neutral-200 p-2 rounded-2xl hover:scale-105 hover:bg-primary-300 w-28 h-10 justify-center"
              onClick={() => onEditProfile()}>
              <span className="text-sm text-neutral-700">Edit</span>
              <CiEdit size={16} className="ml-2 text-neutral-700" />
            </button>
          </div>
        </div>
        <div className="border border-neutral-100 p-5 rounded-2xl shadow-sm w-full flex flex-col">
          <p className="text-lg font-roboto font-bold text-center md:text-left py-5">
            Personal details
          </p>
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1 flex flex-col space-y-5">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <p className="text-neutral-400">First name</p>
                  <p className="font-medium">{user.firstName}</p>
                </div>
                <div className="flex-1">
                  <p className="text-neutral-400">Last name</p>
                  <p className="font-medium">{user.lastName}</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <p className="text-neutral-400">Email address</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div className="flex-1">
                  <p className="text-neutral-400">Phone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
              <div>
                <p className="text-neutral-400">Role</p>
                <p className="font-medium">{user.role}</p>
              </div>
            </div>
            <div className="flex justify-end md:justify-start">
              <button
                className="flex flex-row items-center border border-neutral-200 p-2 rounded-2xl hover:scale-105 hover:bg-primary-300 w-28 h-10 justify-center"
                onClick={() => onEditProfile()}>
                Edit
                <CiEdit size={16} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <EditProfile
        user={user}
        showEditProfileModal={showEditProfileModal}
        setShowEditProfileModal={setShowEditProfileModal}
      />
    </>
  );
};

export default Profile;
