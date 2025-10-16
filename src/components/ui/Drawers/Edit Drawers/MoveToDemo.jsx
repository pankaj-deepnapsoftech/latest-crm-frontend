import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { BiX } from "react-icons/bi";
import { toast } from "react-toastify";
import { useContext, useState } from "react";
import { useCookies } from "react-cookie";
import Select from "react-select";
import Loading from "../../Loading";
import { notificationContext } from "../../../ctx/notificationContext";

const MoveToDemo = ({
  dataId,
  closeDrawerHandler,
  fetchAllLeads,
  leadData,
}) => {
  const [demoDateTime, setDemoDateTime] = useState("");
  const [demoType, setDemoType] = useState(null);
  const [notes, setNotes] = useState("");
  const [cookies] = useCookies();
  const [isLoading, setIsLoading] = useState(false);

  const notificationCtx = useContext(notificationContext);

  const demoTypeOptions = [
    { value: "Physical", label: "Physical" },
    { value: "Virtual", label: "Virtual" },
  ];

  const scheduleDemoHandler = async (e) => {
    e.preventDefault();

    if (!demoDateTime || !demoType) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL;

      const response = await fetch(baseURL + "lead/schedule-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${cookies?.access_token}`,
        },
        body: JSON.stringify({
          leadId: dataId,
          demoDateTime,
          demoType: demoType?.value,
          notes,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      closeDrawerHandler();
      fetchAllLeads();
      toast.success(data.message || "Demo scheduled successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="absolute overflow-auto h-[100vh] w-[99vw] md:w-[550px] bg-white right-0 top-0 z-10 py-3"
      style={{
        boxShadow:
          "rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px",
      }}
    >
      <h1 className="px-4 flex gap-x-2 items-center text-xl py-3 border-b">
        <BiX onClick={closeDrawerHandler} size="26px" />
        Schedule Demo
      </h1>

      <div className="mt-8 px-5">
        <h2 className="text-2xl font-bold py-5 text-center mb-6 border-y bg-blue-800 text-white rounded-lg shadow-md">
          Schedule Demo
        </h2>

        {/* Lead Information */}
        <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Lead Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-[#4B5563] text-sm">Name</label>
              <div className="mt-1 p-2 bg-white border rounded text-gray-700">
                {leadData?.name || "N/A"}
              </div>
            </div>

            <div>
              <label className="font-bold text-[#4B5563] text-sm">Email</label>
              <div className="mt-1 p-2 bg-white border rounded text-gray-700">
                {leadData?.email || "N/A"}
              </div>
            </div>

            <div>
              <label className="font-bold text-[#4B5563] text-sm">Phone</label>
              <div className="mt-1 p-2 bg-white border rounded text-gray-700">
                {leadData?.phone || "N/A"}
              </div>
            </div>

            <div>
              <label className="font-bold text-[#4B5563] text-sm">Source</label>
              <div className="mt-1 p-2 bg-white border rounded text-gray-700">
                {leadData?.source || "N/A"}
              </div>
            </div>
          </div>
        </div>

        {isLoading && <Loading />}
        {!isLoading && (
          <form onSubmit={scheduleDemoHandler} className="space-y-5">
            {/* Demo DateTime */}
            <div className="mt-2 mb-5">
              <label className="font-bold text-[#4B5563]">
                Demo Date & Time *
              </label>
              <Input
                type="datetime-local"
                value={demoDateTime}
                onChange={(e) => setDemoDateTime(e.target.value)}
                className="rounded mt-2 border p-3 focus:ring-2 focus:ring-green-400"
                required
              />
            </div>

            {/* Demo Type */}
            <div className="mt-2 mb-5">
              <label className="font-bold text-[#4B5563]">Demo Type *</label>
              <Select
                className="rounded mt-2 border p-3 focus:ring-2 focus:ring-green-400"
                options={demoTypeOptions}
                placeholder="Select demo type"
                value={demoType}
                onChange={(d) => setDemoType(d)}
                isSearchable={true}
                required
              />
            </div>

            {/* Notes */}
            <FormControl className="mt-2 mb-5">
              <FormLabel fontWeight="bold" className="text-[#4B5563]">
                Notes
              </FormLabel>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                resize="none"
                placeholder="Additional notes about the demo..."
                className="rounded mt-2 border p-3 focus:ring-2 focus:ring-green-400"
              />
            </FormControl>

            {/* Submit Button */}
            <Button
              type="submit"
              className="mt-1 w-full py-3 text-white bg-blue-800 font-bold rounded-lg"
              colorScheme="black"
              isLoading={isLoading}
            >
              Schedule Demo
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default MoveToDemo;
