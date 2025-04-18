import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { MdOutlineDelete } from "react-icons/md";
import { toast } from "react-toastify";
import NewModel from "../components/NewModel";
import { setSidebar } from "../redux/reducers/ sidebar";
import {
  deletePhoneModel,
  editCommission,
  fetchAllModels,
  fetchAllRegions,
} from "../services/services";
import DeleteConfirmationModal from "../components/DeleteModal";
import { useNavigate } from "react-router-dom";

const Commissions = () => {
  const [showAddModel, setShowAddModel] = useState(false);
  const token = useSelector((state) => state.userSlice.user.token);
  const user = useSelector((state) => state.userSlice.user.user);
  const [commissions, setCommissions] = useState({});
  const [editedCells, setEditedCells] = useState(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [editCommissionLoading, setEditCommissionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modelToDelete, setModelToDelete] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (showAddModel) {
      dispatch(setSidebar(false));
    }
  }, [showAddModel, dispatch]);

  const { data: models, isLoading: isLoadingModels } = useQuery(
    ["models", { page: 1, limit: 100 }],
    ({ queryKey, signal }) => fetchAllModels({ queryKey, signal, token }),
    {
      keepPreviousData: true,
      enabled: !!token,
    }
  );

  const { data: regions, isLoading: isLoadingRegions } = useQuery(
    ["regions", { page: 1, limit: 100 }],
    ({ queryKey, signal }) => fetchAllRegions({ queryKey, signal, token }),
    {
      keepPreviousData: true,
      enabled: !!token,
    }
  );

  const isLoading = isLoadingModels || isLoadingRegions;

  useEffect(() => {
    setHasChanges(editedCells.size > 0);
  }, [editedCells]);

  const handleInputChange = (regionId, modelId, value) => {
    if (!/^\d*$/.test(value)) return;

    setCommissions((prev) => ({
      ...prev,
      [`${regionId}-${modelId}`]: value,
    }));

    setEditedCells((prev) => {
      const updatedSet = new Set(prev);
      updatedSet.add(`${regionId}-${modelId}`);
      return updatedSet;
    });
  };

  useEffect(() => {
    if (models?.models) {
      const initialCommissions = {};

      models.models.forEach((model) => {
        if (model.commissions) {
          try {
            const parsedCommissions = model.commissions;
            parsedCommissions.forEach((commission) => {
              const key = `${commission.regionId}-${model.id}`;
              initialCommissions[key] = commission.amount;
            });
          } catch (error) {
            console.error("Error parsing commissions:", error);
          }
        }
      });

      setCommissions(initialCommissions);
    }
  }, [models]);

  const handleSubmit = () => {
    const changes = Array.from(editedCells).map((key) => {
      const [regionId, modelId] = key.split("-");
      return {
        model: modelId,
        regionId: regionId,
        amount: commissions[key],
      };
    });
    editCommisionMutation.mutate({ commissionData: changes, token });
    setHasChanges(false);
  };

  const useEditCommission = () => {
    return useMutation(
      ({ commissionData, token }) => editCommission(commissionData, token),
      {
        onMutate: () => {
          setEditCommissionLoading(true);
        },
        onSuccess: (response) => {
          setEditCommissionLoading(false);
          queryClient.invalidateQueries(["models", "phones"]);
          toast.success("Commission details updated");
        },
        onError: (error) => {
          setEditCommissionLoading(false);
          toast.error(error.message || "Failed to update commission details");
        },
      }
    );
  };

  const editCommisionMutation = useEditCommission();

  const useDeletePhoneModel = () => {
    const queryClient = useQueryClient();

    return useMutation(
      ({ modelId, token }) => deletePhoneModel(modelId, token),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["models"]);
          toast.success("Model deleted successfully");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to delete model");
        },
      }
    );
  };

  const deletePhoneModelMutation = useDeletePhoneModel();

  const handleDeleteModel = () => {
    if (modelToDelete) {
      deletePhoneModelMutation.mutate({ modelId: modelToDelete, token });
    }
    setShowDeleteModal(false);
  };

  useEffect(() => {
    if (!["super admin", "admin"].includes(user?.role)) {
      navigate("/inventory");
    }
  }, [user, navigate]);

  return (
    <div className="p-5">
      <div className="space-y-2">
        <p className="text-xl font-bold">Daily commissions</p>
        <div className="flex flex-row items-center justify-end p-5">
          <button
            onClick={() => setShowAddModel(true)}
            className={`p-2 py-3 text-sm font-roboto font-bold bg-primary-500 md:w-36 text-center cursor-pointer `}>
            Add Model
          </button>
        </div>
        <div className="p-5 w-auto">
          <div className="py-5">
            <p className="text-zinc-600 font-bold">Set Commissions</p>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400 mr-2"></div>
              <p>Loading commissions data...</p>
            </div>
          ) : !regions?.regions ||
            regions.regions.length === 0 ||
            !models?.models ||
            models.models.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">
                {!regions?.regions || regions.regions.length === 0
                  ? "No regions available. Please add regions first."
                  : "No models available. Please add models first."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[450px]">
              <table className="text-sm w-full text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-neutral-100 border-gray-200 border sticky top-0 z-10">
                  <tr>
                    <th className="px-1 w-5 py-3 border-x border-gray-200">
                      #
                    </th>
                    <th className="px-1 w-60 py-3 border-r border-gray-200">
                      Region
                    </th>
                    {models?.models.map((model) => (
                      <th
                        key={model.id}
                        className="px-1 w-40 py-3 border-r border-gray-200">
                        {model.model}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {regions?.regions.map((region, index) => (
                    <tr key={region.id} className="bg-white border-b">
                      <td className="px-3 py-2 border-x border-gray-200">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2 border-r border-gray-200">
                        {region.location}
                      </td>
                      {models?.models.map((model) => (
                        <td
                          key={model.id}
                          className=" border-r border-gray-200">
                          <input
                            type="text"
                            value={
                              commissions[`${region.id}-${model.id}`] || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                region.id,
                                model.id,
                                e.target.value
                              )
                            }
                            className="text-center outline-none focus:border-primary-500"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-neutral-100">
                    <td className="border-x border-gray-200"></td>
                    <td className="border-r border-gray-200 text-sm font-medium text-gray-600">
                      Delete Model
                    </td>
                    {models?.models.map((model) => (
                      <td
                        key={model.id}
                        className="border-r border-gray-200 text-center py-2">
                        <button
                          onClick={() => {
                            setModelToDelete(model.id);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full transition-all duration-200">
                          <MdOutlineDelete size={20} />
                        </button>
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          <div className="my-5 flex flex-row justify-end">
            <button
              className={`p-2 h-12 w-[300px] md:w-40 ${
                hasChanges
                  ? "bg-primary-500 text-white"
                  : "bg-gray-400 text-gray-700"
              }`}
              onClick={handleSubmit}
              disabled={!hasChanges}>
              {editCommissionLoading ? "Submiting..." : "Submit Changes"}
            </button>
          </div>
        </div>
      </div>
      <NewModel showAddModel={showAddModel} setShowAddModel={setShowAddModel} />
      <DeleteConfirmationModal
        action="Delete"
        showDeleteModal={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteModel}
        title="Confirm Action!"
        message={`Are you sure you want to delete model "${modelToDelete?.model}"?`}
      />
    </div>
  );
};

export default Commissions;
