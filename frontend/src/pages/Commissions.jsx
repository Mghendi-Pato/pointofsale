import { useEffect, useState } from "react";
import NewModel from "../components/NewModel";
import { setSidebar } from "../redux/reducers/ sidebar";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  editCommission,
  fetchAllModels,
  fetchAllRegions,
} from "../services/services";
import { toast } from "react-toastify";

const Commissions = () => {
  const [showAddModel, setShowAddModel] = useState(false);
  const token = useSelector((state) => state.userSlice.user.token);
  const [commissions, setCommissions] = useState({});
  const [editedCells, setEditedCells] = useState(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [editCommissionLoading, setEditCommissionLoading] = useState(false);

  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (showAddModel) {
      dispatch(setSidebar(false));
    }
  }, [showAddModel, dispatch]);

  const { data: models } = useQuery(
    ["models", { page: 1, limit: 100 }],
    ({ queryKey, signal }) => fetchAllModels({ queryKey, signal, token }),
    {
      keepPreviousData: true,
      enabled: !!token,
    }
  );

  const { data: regions } = useQuery(
    ["regions", { page: 1, limit: 100 }],
    ({ queryKey, signal }) => fetchAllRegions({ queryKey, signal, token }),
    {
      keepPreviousData: true,
      enabled: !!token,
    }
  );

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
          <div className="overflow-x-auto max-h-[450px]">
            <table className="text-sm w-full text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-neutral-100 border-gray-200 border sticky top-0 z-10">
                <tr>
                  <th className="px-1 w-5 py-3 border-x border-gray-200">#</th>
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
                      <td key={model.id} className=" border-r border-gray-200">
                        <input
                          type="text"
                          value={commissions[`${region.id}-${model.id}`] || ""}
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
            </table>
          </div>

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
    </div>
  );
};

export default Commissions;
