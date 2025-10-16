import { Button, FormControl, FormLabel, Input, Textarea, Select } from "@chakra-ui/react";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { BiX } from "react-icons/bi";
import { toast } from "react-toastify";

const SMSDrawer = ({ fetchAllLeads, closeDrawerHandler, mobiles, names, leads }) => {

  const [cookies] = useCookies();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}sms/templates`,
          {
            headers: {
              Authorization: `Bearer ${cookies?.access_token}`,
            },
          }
        );
        setTemplates(data.templates);
      } catch (err) {
        toast.error("Failed to load templates");
      }
    };
    fetchTemplates();
  }, [cookies]);

  const sendBulkSMSHandler = async (e) => {
    e.preventDefault();

    if (mobiles.length === 0) {
      toast.error("No lead selected");
      closeDrawerHandler();
      return;
    }

    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}lead/bulk-sms`,
        {
          leadIds: leads,
          templateId: selectedTemplate,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      if (!data?.success) {
        throw new Error(data.message);
      }

      toast.success(data.message);
      fetchAllLeads();
      closeDrawerHandler();
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  if (mobiles.length === 0) {
    toast.error('No lead selected');
    closeDrawerHandler();
    return;
  }

  return (
    <div
      className="absolute overflow-auto h-[100vh] w-[90vw] md:w-[450px] bg-white right-0 top-0 z-10 py-3"
      style={{
        boxShadow:
          "rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px",
      }}
    >
      <h1 className="px-4 flex gap-x-2 items-center text-xl py-3 border-b">
        <BiX onClick={closeDrawerHandler} size="26px" />
        SMS
      </h1>

      <div className="mt-8 px-5">
        <h2 className="text-2xl font-semibold py-5 text-center mb-6 border-y bg-[#f9fafc]">
          Send Bulk SMS
        </h2>


        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Selected Recipients</h3>
          <div className="max-h-[300px] overflow-y-auto border rounded-md p-3 bg-gray-50 space-y-2">
            {mobiles.length > 0 ? (
              mobiles.map((mobile, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center px-3 py-2 border rounded bg-white shadow-sm"
                >
                  <span className="font-medium text-gray-800">{names[index]}</span>
                  <span className="text-sm text-gray-600">{mobile}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No recipients selected.</p>
            )}
          </div>
        </div>

        <FormControl mb={6}>
          <FormLabel>Select SMS Template (Verified from Nimbus)</FormLabel>
          <Select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            placeholder="Select template"
          >
            {templates.map((t) => (
              <option key={t._id} value={t._id}>
                {t.templateName}  
              </option>
            ))}
          </Select>
        </FormControl>

        <form onSubmit={sendBulkSMSHandler}>
          <Button
            type="submit"
            className="w-full"
            color="white"
            backgroundColor="#1640d6"
          >
            Submit
          </Button>
        </form>
      </div>

    </div>
  );
};

export default SMSDrawer;