import {
  Button,
  FormControl,
  FormLabel,
  Select as ChakraSelect,
  Input,
  Textarea,
  typography,
  useStatStyles,
  Spinner,
} from "@chakra-ui/react";
import { BiX } from "react-icons/bi";
import { useDispatch } from "react-redux";
import { closeAddLeadsDrawer } from "../../../../redux/reducers/misc";
import { toast } from "react-toastify";
import { useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LeadsDrawer = ({
  fetchAllLeads,
  closeDrawerHandler,
  fetchLeadSummary,
}) => {
  const [cookies] = useCookies();
  const [companies, setCompanies] = useState([]);
  const [peoples, setPeoples] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [prcQt, setPrcQt] = useState();
  const [location, setLocation] = useState();
  const [isLoading,setIsLoading] = useState(false)
  const [productOptionsList, setProductOptionsList] = useState();
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [showSelectPeoples, setShowSelectPeoples] = useState(true);
  const [showSelectCompanies, setShowSelectCompanies] = useState(true);

  const [peopleOptionsList, setPeopleOptionsList] = useState();
  const [selectedPeopleOption, setPeopleSelectedOption] = useState();

  const [employeeOptionsList, setEmployeeOptionsList] = useState();
  const [selectedEmployeeOption, setEmployeeSelectedOption] = useState();

  const [companyOptionsList, setCompanyOptionsList] = useState();
  const [selectedCompanyOption, setSelectedCompanyOption] = useState();
  const [showPreviewImage, SetImagePreview] = useState(null)
  const [file, setFile] = useState(null)
  const typeOptionsList = [
    { value: "Company", label: "Corporate" },
    { value: "People", label: "Individual" },
  ];

  const statusOptionsList = [
    // { value: "Draft", label: "Draft" },
    { value: "New", label: "New" },
    { value: "Demo", label: "Demo" },
    { value: "Demo Preparation", label: "Demo Preparation" },
    { value: "In Negotiation", label: "In Negotiation" },
    { value: "Completed", label: "Completed" },
    { value: "Loose", label: "Loose" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Assigned", label: "Assigned" },
    { value: "On Hold", label: "On Hold" },
    { value: "Follow Up", label: "Follow Up" },
  ];
  const sourceOptionsList = [
    { value: "Linkedin", label: "Linkedin" },
    { value: "Social Media", label: "Social Media" },
    { value: "Website", label: "Website" },
    { value: "Advertising", label: "Advertising" },
    { value: "Friend", label: "Friend" },
    { value: "Professionals Network", label: "Professionals Network" },
    { value: "Customer Referral", label: "Customer Referral" },
    { value: "Sales", label: "Sales" },
    { value: "Digital Marketing", label: "Digital Marketing" },
    { value: "Upwork", label: "Upwork" },
    { value: "Gem", label: "Gem" },
    { value: "Freelancer", label: "Freelancer" },
    { value: "IndiaMart", label: "IndiaMart" },
    { value: "Fiverr", label: "Fiverr" },
  ];

  const [typeId, setTypeId] = useState();

  const [statusId, setStatusId] = useState();

  const [sourceId, setSourceId] = useState();

  const [peopleId, setPeopleId] = useState();

  const [companyId, setCompanyId] = useState();

  const [notes, setNotes] = useState("");

  const [assigned, setAssigned] = useState();

  const [followupDate, setFollowupDate] = useState();

  const [followupReason, setFollowupReason] = useState();

  const [category, setCategory] = useState("");

  const navigate = useNavigate();

  const getAllCompanies = async () => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL;

      const response = await fetch(baseURL + "company/all-companies", {
        method: "POST",
        headers: {
          authorization: `Bearer ${cookies?.access_token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setCompanies(data.companies);
    } catch (err) {
      toast(err.message);
    }
  };

  const getAllProducts = async () => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL;

      const response = await fetch(baseURL + "product/all-products", {
        method: "POST",
        headers: {
          authorization: `Bearer ${cookies?.access_token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }
      setProducts(data.products);
    } catch (err) {
      toast(err.message);
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

  const getAllEmployees = async () => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL;

      const response = await fetch(baseURL + "admin/all-admins", {
        method: "GET",
        headers: {
          authorization: `Bearer ${cookies?.access_token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }
      setEmployees(data.admins);
    } catch (err) {
      toast(err.message);
    }
  };

   const ImageUploader = async (formData) => {

    try {
      const res = await axios.post("https://images.deepmart.shop/upload", formData);
      // console.log(res.data?.[0])
      return res.data?.[0];
    } catch (error) {
      console.error("Image upload failed:", error);
      return null;
    }
  };

  const addLeadHandler = async (e) => {
    e.preventDefault();

    // 👇 START LOADING
    setIsLoading(true);

    // Validation
    if (!typeId?.value) {
      toast.error("Type not selected");
      setIsLoading(false); // 👈 ADD THIS
      return;
    }

    if (!peopleId?.value && !companyId?.value) {
      toast.error("Individual/Corporate not selected");
      setIsLoading(false); // 👈 ADD THIS
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error("At least 1 product should be selected");
      setIsLoading(false); // 👈 ADD THIS
      return;
    }

    if (
      statusId?.value === "Follow Up" &&
      (!followupDate || !followupReason || followupReason === "")
    ) {
      toast.error("Follow-up date and Follow-up reason required");
      setIsLoading(false); // 👈 ADD THIS
      return;
    }

    const productsId = selectedProducts.map((p) => p?.value);
    let body = {};
    let DemoImage = null;

    if (
      statusId?.value === "Assigned" &&
      assigned?.value &&
      assigned?.value !== ""
    ) {
      body = JSON.stringify({
        leadtype: typeId?.value,
        status: statusId?.value,
        source: sourceId?.value,
        peopleId: peopleId?.value,
        companyId: companyId?.value,
        products: productsId,
        notes,
        assigned: assigned?.value,
        prc_qt: prcQt,
        location: location,
        leadCategory: category.value,
      });
    } else if (
      statusId?.value === "Follow Up" &&
      followupDate &&
      followupReason
    ) {
      body = JSON.stringify({
        leadtype: typeId?.value,
        status: statusId?.value,
        source: sourceId?.value,
        peopleId: peopleId?.value,
        companyId: companyId?.value,
        products: productsId,
        notes,
        assigned: assigned?.value,
        followup_date: followupDate,
        followup_reason: followupReason,
        prc_qt: prcQt,
        location: location,
        leadCategory: category.value,
      });
    } else {
      body = JSON.stringify({
        leadtype: typeId?.value,
        status: statusId?.value,
        source: sourceId?.value,
        peopleId: peopleId?.value,
        companyId: companyId?.value,
        products: productsId,
        notes,
        prc_qt: prcQt,
        location: location,
        leadCategory: category.value,
      });
    }

    const formData = new FormData();
    formData.append("file", file);
    DemoImage = await ImageUploader(formData);

    const payload = {
      ...JSON.parse(body),
      demoPdf: DemoImage,
    };

    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL;

      const response = await fetch(baseURL + "lead/create-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${cookies?.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      fetchAllLeads();
      fetchLeadSummary();
      closeDrawerHandler();
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false); // 👈 THIS ensures button is re-enabled
    }
  };


  useEffect(() => {
    getAllCompanies();
    getAllPeoples();
    getAllProducts();
    getAllEmployees();
  }, []);

  useEffect(() => {
    let options = [{ value: "Add Individual", label: "+ Add Individual" }];
    options = options.concat(
      peoples.map((data) => {
        return {
          value: data._id,
          label: data?.firstname + " " + (data?.lastname || ""),
        };
      })
    );
    setPeopleOptionsList(options);
  }, [peoples]);

  useEffect(() => {
    let options = [{ value: "", label: "None" }];
    options = options.concat(
      employees.map((data) => {
        return {
          value: data._id,
          label: data?.name,
        };
      })
    );
    setEmployeeOptionsList(options);
  }, [employees]);

  useEffect(() => {
    let options = [{ value: "Add Corporate", label: "+ Add Corporate" }];
    options = options.concat(
      companies.map((data) => {
        return { value: data._id, label: data.companyname };
      })
    );
    setCompanyOptionsList(options);
  }, [companies]);

  useEffect(() => {
    let options = [{ value: "Add Product", label: "+ Add Product" }];
    options = options.concat(
      products.map((data) => {
        return { value: data._id, label: data.name };
      })
    );
    setProductOptionsList(options);
  }, [products]);

  const [Leadoptions] = useState(() => [
    { value: "Hot", label: "Hot" },
    { value: "Warm", label: "Warm" },
    { value: "Cold", label: "Cold" },
  ]);

  useEffect(() => {
    setShowSelectPeoples(typeId?.label === "Individual" ? true : false);
    setShowSelectCompanies(typeId?.label === "Corporate" ? true : false);
    setPeopleId();
    setCompanyId();
  }, [typeId]);



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
        Lead
      </h1>

      <div className="mt-8 px-5">
        <h2 className="text-2xl font-bold py-5 text-center mb-6 border-y bg-blue-200 rounded-lg shadow-md">
          Add New Lead
        </h2>

        <form onSubmit={addLeadHandler} className="space-y-5">
          {/* Lead Type */}
          <div className="mt-2 mb-5">
            <label className="font-bold text-[#4B5563]">Type</label>
            <Select
              className="rounded mt-2"
              options={typeOptionsList}
              placeholder="Select type"
              value={typeId}
              onChange={(d) => setTypeId(d)}
              isSearchable={true}
            />
          </div>

          {/* Lead Status */}
          <div className="mt-2 mb-5">
            <label className="font-bold text-[#4B5563]">Status</label>
            <Select
              className="rounded mt-2"
              options={statusOptionsList}
              placeholder="Select status"
              value={statusId}
              onChange={(d) => setStatusId(d)}
              isSearchable={true}
            />
          </div>

          {/* Assigned Employee (Conditional Rendering based on Status) */}
          {statusId?.value === "Assigned" && (
            <div className="mt-2 mb-5">
              <label className="font-bold text-[#4B5563]">Assigned</label>
              <Select
                required={statusId?.value === "Assigned"}
                className="rounded mt-2"
                options={employeeOptionsList}
                placeholder="Select employee"
                value={assigned}
                onChange={(d) => setAssigned(d)}
                isSearchable={true}
              />
            </div>
          )}

          {/* Lead Source */}
          <div className="mt-2 mb-5">
            <label className="font-bold text-[#4B5563]">Source</label>
            <Select
              className="rounded mt-2"
              options={sourceOptionsList}
              placeholder="Select source"
              value={sourceId}
              onChange={(d) => setSourceId(d)}
              isSearchable={true}
            />
          </div>

          {/* Products Selection */}
          <div className="mt-2 mb-5">
            <label className="font-bold text-[#4B5563]">Products</label>
            <Select
              required={true}
              className="rounded mt-2"
              options={productOptionsList}
              placeholder="Select products"
              value={selectedProducts}
              onChange={(d) => {
                if (d[d.length - 1]?.value === "Add Product") {
                  closeDrawerHandler();
                  navigate("/crm/products");
                }
                setSelectedProducts(d);
              }}
              isSearchable={true}
              isMulti={true}
            />
          </div>

          {/* Individual Selection (Conditional Rendering based on Type) */}
          {(showSelectPeoples || !typeId) && (
            <div className="mt-2 mb-5">
              <label className="font-bold text-[#4B5563]">Individual</label>
              <Select
                className="rounded mt-2"
                options={peopleOptionsList}
                placeholder="Select individual"
                value={peopleId}
                onChange={(d) => {
                  if (d.value === "Add Individual") {
                    closeDrawerHandler();
                    navigate("/crm/individuals");
                  }
                  setPeopleId(d);
                }}
                isSearchable={true}
              />
            </div>
          )}

          {/* Corporate Selection (Conditional Rendering based on Type) */}
          {(showSelectCompanies || !typeId) && (
            <div className="mt-2 mb-5">
              <label className="font-bold text-[#4B5563]">Corporate</label>
              <Select
                className="rounded mt-2"
                options={companyOptionsList}
                placeholder="Select corporate"
                value={companyId}
                onChange={(d) => {
                  if (d.value === "Add Corporate") {
                    closeDrawerHandler();
                    navigate("/crm/corporates");
                  }
                  setCompanyId(d);
                }}
                isSearchable={true}
              />
            </div>
          )}

          {/* Follow-up Date and Reason (Conditional Rendering based on Status) */}
          {statusId?.value === "Follow Up" && (
            <>
              <FormControl className="mt-2 mb-5">
                <FormLabel fontWeight="bold" className="text-[#4B5563]">
                  Follow-up Date
                </FormLabel>
                <Input
                  type="date"
                  value={followupDate}
                  min={new Date().toISOString().substring(0, 10)}
                  onChange={(e) => setFollowupDate(e.target.value)}
                  className="rounded mt-2 border p-3 focus:ring-2 focus:ring-blue-400"
                />
              </FormControl>
              <FormControl className="mt-2 mb-5">
                <FormLabel fontWeight="bold" className="text-[#4B5563]">
                  Follow-up Reason
                </FormLabel>
                <Input
                  type="text"
                  value={followupReason}
                  onChange={(e) => setFollowupReason(e.target.value)}
                  className="rounded mt-2 border p-3 focus:ring-2 focus:ring-blue-400"
                />
              </FormControl>
            </>
          )}

          {statusId?.value === "Demo Preparation" && <div className="mt-2 mb-5">
            <label htmlFor="demoPdf" className="block mb-2 text-sm font-semibold text-gray-700">
              Attach Demo File
            </label>

            <div className="relative">
              <input
                id="demoPdf"
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files[0]
                  setFile(file)
                  
                  const ImageUrl = URL.createObjectURL(file)
                  SetImagePreview(ImageUrl)
                }}
              />

              <div className="flex items-center justify-between px-4 py-2 bg-white border-2 border-dashed border-gray-300 rounded-md shadow-sm hover:border-blue-500 transition-all duration-200">
                <span className="text-sm text-gray-500">{file?.name || "No file chosen"}</span>
                <button
                  type="button"
                  disabled={!!file}
                  className="text-white bg-blue-600 hover:bg-blue-700 font-medium text-xs px-4 py-1 rounded shadow"
                >
                  Upload File
                </button>
              </div>
            </div>
          </div>}
          {
            showPreviewImage && (
              <div>
                <img
                  className="w-32 h-32 object-cover rounded-md "
                  src={showPreviewImage}
                  alt="Preview"
                />
              </div>
            )
          }


          {/* Lead Remarks */}
          <FormControl className="mt-2 mb-5">
            <FormLabel fontWeight="bold" className="text-[#4B5563]">
              Remarks
            </FormLabel>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              resize="none"
              className="rounded mt-2 border p-3 focus:ring-2 focus:ring-blue-400"
            />
          </FormControl>

          {/* PRC QT */}
          <FormControl className="mt-2 mb-5">
            <FormLabel fontWeight="bold" className="text-[#4B5563]">
              PRC QT
            </FormLabel>
            <Input
              type="text"
              value={prcQt}
              onChange={(e) => setPrcQt(e.target.value)}
              className="rounded mt-2 border p-3 focus:ring-2 focus:ring-blue-400"
            />
          </FormControl>

          {/* Location */}
          <FormControl className="mt-2 mb-5">
            <FormLabel fontWeight="bold" className="text-[#4B5563]">
              Location
            </FormLabel>
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded mt-2 border p-3 focus:ring-2 focus:ring-blue-400"
            />
          </FormControl>

          {/* condition */}
          <FormControl className="mt-2 mb-5">
            <FormLabel fontWeight="bold" className="text-[#4B5563]">
              Lead Category 
            </FormLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e)}
              placeholder="Select a lead status"
              options={Leadoptions}
            ></Select>
          </FormControl>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className={`mt-4 w-full py-3 text-white font-bold rounded-lg hover:bg-blue-600 transition duration-300 flex items-center justify-center ${isLoading ? "cursor-not-allowed bg-blue-400" : ""}`}
            colorScheme="blue"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" mr={2} /> Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LeadsDrawer;
