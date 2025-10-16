import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import { BiX } from "react-icons/bi";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import Loading from "../../Loading";

const CompaniesEditDrawer = ({
  dataId: id,
  closeDrawerHandler,
  fetchAllCompanies,
}) => {
  const [peoples, setPeoples] = useState([]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [address, setAddress] = useState("");
  const [secondPersonName, setSecondPersonName] = useState("");
  const [secondPersonContact, setSecondPersonContact] = useState("");
  const [secondPersonDesignation, setSecondPersonDesignation] = useState("");
  const [status, setStatus] = useState("Not Pick");
  const [statusOptions, setStatusOptions] = useState([
    "Not Pick",
    "Not Interested",
    "Switch Off",
  ]);
  const [customStatus, setCustomStatus] = useState("");
  const [cookies] = useCookies();
  const [isLoading, setIsLoading] = useState(false);

  const editCompanyHandler = async (e) => {
    e.preventDefault();

    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL;

      const response = await fetch(baseURL + "company/edit-company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${cookies?.access_token}`,
        },
        body: JSON.stringify({
          companyId: id,
          companyname: name,
          email: email,
          contact: contact,
          phone: phone,
          website: website,
          gst_no: gstNo,
          address,
          secondPersonName,
          secondPersonContact,
          secondPersonDesignation,
          status,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      closeDrawerHandler();
      fetchAllCompanies();
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getAllPeoples = async () => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL;

      const response = await fetch(baseURL + "people/all-persons", {
        method: "POST",
        headers: {
          authorization: `Bearer ${cookies?.access_token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }
      setPeoples(data.people);
    } catch (err) {
      toast(err.message);
    }
  };

  const fetchCompanyDetails = async () => {
    setIsLoading(true);
    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(baseUrl + "company/company-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.access_token}`,
        },
        body: JSON.stringify({
          companyId: id,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setName(data.company?.companyname);
      setEmail(data.company?.email);
      setContact(data.company?.contact);
      setPhone(data.company?.phone);
      setWebsite(data.company?.website);
      setGstNo(data.company?.gst_no);
      setAddress(data.company?.address || "");
      setSecondPersonName(data.company?.secondPersonName || "");
      setSecondPersonContact(data.company?.secondPersonContact || "");
      setSecondPersonDesignation(data.company?.secondPersonDesignation || "");
      setStatus(data.company?.status || "Not Pick");

      setIsLoading(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
    getAllPeoples();
  }, []);

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
        Corporate
      </h1>

      <div className="mt-8 px-5">
        <h2 className="text-2xl font-bold py-5 text-center mb-6 border-y bg-blue-200 rounded-lg shadow-md">
          Edit Corporate
        </h2>

        {isLoading && <Loading />}
        {!isLoading && (
          <form onSubmit={editCompanyHandler} className="space-y-5">
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" className="text-[#4B5563]">
                Name
              </FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Corporate Name"
                className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </FormControl>

            {/* Address */}
            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" className="text-[#4B5563]">
                Address
              </FormLabel>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter Company Address"
                className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </FormControl>

            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" className="text-[#4B5563]">
                Contact Person
              </FormLabel>
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                type="text"
                placeholder="Contact Person"
                className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </FormControl>

            {/* Second Person Name */}
            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" className="text-[#4B5563]">
                2nd Person Name
              </FormLabel>
              <Input
                value={secondPersonName}
                onChange={(e) => setSecondPersonName(e.target.value)}
                type="text"
                placeholder="Enter 2nd Person Name"
                className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </FormControl>

            {/* Second Person Contact */}
            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" className="text-[#4B5563]">
                2nd Person Contact
              </FormLabel>
              <Input
                value={secondPersonContact}
                onChange={(e) => setSecondPersonContact(e.target.value)}
                type="text"
                placeholder="Enter 2nd Person Contact"
                className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </FormControl>

            {/* Second Person Designation */}
            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" className="text-[#4B5563]">
                2nd Person Designation
              </FormLabel>
              <Input
                value={secondPersonDesignation}
                onChange={(e) => setSecondPersonDesignation(e.target.value)}
                type="text"
                placeholder="Enter 2nd Person Designation"
                className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </FormControl>

            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" className="text-[#4B5563]">
                Phone
              </FormLabel>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="number"
                className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Phone"
              />
            </FormControl>

            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" className="text-[#4B5563]">
                Email
              </FormLabel>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
                className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </FormControl>

            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" className="text-[#4B5563]">
                Website
              </FormLabel>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                type="text"
                placeholder="Website"
                className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </FormControl>

            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" className="text-[#4B5563]">
                GST No.
              </FormLabel>
              <Input
                value={gstNo}
                onChange={(e) => setGstNo(e.target.value)}
                placeholder="GST No."
                className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </FormControl>

            {/* Status with Add More */}
            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" className="text-[#4B5563]">
                Status
              </FormLabel>
              <Select value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Select status">
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
              <div className="flex gap-2 mt-2">
                <Input
                  value={customStatus}
                  onChange={(e) => setCustomStatus(e.target.value)}
                  placeholder="Add more status"
                />
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    const val = customStatus.trim();
                    if (!val) return;
                    if (!statusOptions.includes(val)) {
                      setStatusOptions((prev) => [...prev, val]);
                      setStatus(val);
                    }
                    setCustomStatus("");
                  }}
                >
                  Add
                </Button>
              </div>
            </FormControl>

            <Button
              type="submit"
              className="mt-1 w-full py-3 text-white font-bold rounded-lg"
              colorScheme="blue"
            >
              Submit
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CompaniesEditDrawer;
