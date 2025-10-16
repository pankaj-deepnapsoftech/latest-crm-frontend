import React, { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import axios from "axios";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify"; 
import { MdDelete } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
import { FaDownload } from "react-icons/fa6";

const DocumentCenter = () => {
    const [cookies] = useCookies()
    const [showModal, setShowModal] = useState(false);
    const [filePreview, setFilePreview] = useState(null);
    const [file, setFile] = useState(null);
    const fileInputRef = useRef();
    const [documents, setDocuments] = useState([])
    const [edittable, setEditTable] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const modalRef = useRef();
    const [categoryOptions, setCategoryOptions] = useState(() => {
        const stored = localStorage.getItem("documentCategories");
        return stored ? JSON.parse(stored) : [];
    });
    const [isCustomCategory, setIsCustomCategory] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const handleDownload = async (fileUrl, fileName) => {
        try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();


            const contentType = response.headers.get("content-type");
            let extension = "";

            if (contentType.includes("image/jpeg")) extension = ".jpg";
            else if (contentType.includes("image/png")) extension = ".png";
            else if (contentType.includes("application/pdf")) extension = ".pdf";
            else extension = "";

            let finalFileName = fileName;
            if (!finalFileName.includes(".")) {
                finalFileName += extension;
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = finalFileName;
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to download document.");
        }
    };



    const ImageUploader = async (formData) => {
        setIsLoading(true)
        try {
            const res = await axios.post("https://images.deepmart.shop/upload", formData);
            return res.data?.[0];
        } catch (error) {
            console.error("Image upload failed:", error);
            return null;
        } finally {
            setIsLoading(false)
        }
    };


    const formik = useFormik({
        initialValues: edittable || {
            documentName: "",
            documentCategory: "",
            documentFile: "",
        },
        validationSchema: Yup.object({
            documentName: Yup.string().required("Required"),
            documentCategory: Yup.string().required("Required"),

        }),
        enableReinitialize: true,
        onSubmit: async (values, { resetForm }) => {
            let ImgUrl = null;
            const formData = new FormData();
            formData.append("file", file);

            ImgUrl = await ImageUploader(formData);

            const payload = {
                ...values,
                documentFile: ImgUrl,
            };

            setIsLoading(true);

            try {
                if (edittable) {
                    const res = await axios.put(
                        `${process.env.REACT_APP_BACKEND_URL}document-center/${edittable?._id}`,
                        payload,
                        {
                            headers: {
                                authorization: `Bearer ${cookies?.access_token}`,
                            },
                        }
                    );
                    toast.success(res?.data?.message);
                } else {
                    const res = await axios.post(
                        `${process.env.REACT_APP_BACKEND_URL}document-center`,
                        payload,
                        {
                            headers: {
                                authorization: `Bearer ${cookies?.access_token}`,
                            },
                        }
                    );
                    toast.success(res?.data?.message);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }

            const newCategory = values.documentCategory.trim();

            if (
                newCategory &&
                !categoryOptions.some(
                    (cat) => cat.trim().toLowerCase() === newCategory.toLowerCase()
                )
            ) {
                const updatedCategories = [...categoryOptions, newCategory];
                setCategoryOptions(updatedCategories);
                localStorage.setItem("documentCategories", JSON.stringify(updatedCategories));
                setIsCustomCategory(false); // Nayi category add hone ke baad dropdown me wapas aajaye
            }
            setFile(null);
            setFilePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            setShowModal(false);
            resetForm();
            getDocumentData();
        },
    });

    const getDocumentData = async (page = currentPage) => {
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}document-center?page=${page}&limit=${limit}`,
                {
                    headers: {
                        Authorization: `Bearer ${cookies?.access_token}`,
                    },
                }
            );

            const { data, pagination } = res?.data;


            if (data.length === 0 && page > 1) {
                setCurrentPage(page - 1);
            } else {
                setDocuments(data);
                setCurrentPage(pagination.currentPage);
                setTotalPages(pagination.totalPages);
            }
        } catch (error) {
            console.log(error);
        }
    };



    const deleteDocumentData = async (_id) => {
        try {
            if (window.confirm("are ou sure you want to delete this Document data")) {
                const res = await axios.delete(`${process.env.REACT_APP_BACKEND_URL}document-center/${_id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${cookies?.access_token}`
                        }
                    }
                )
                toast.success(res?.data?.message)
                getDocumentData(currentPage);
            }

        } catch (error) {
            console.log(error)
        }
    }

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };


    useEffect(() => {
        if (cookies?.access_token) {
            getDocumentData(currentPage);
        }
    }, [cookies?.access_token, currentPage]);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowModal(false);
            }
        };

        if (showModal) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showModal]);
    useEffect(() => {
        if (edittable) {
            setFilePreview(edittable.documentFile || null);
            setFile(null); 
        } else {
            setFile(null);
            setFilePreview(null);
            formik.resetForm();
        }
    }, [edittable, showModal]);
;


    // console.log(filePreview)
    // console.log(edittable)
    return (
        <div className="">

            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-bold">Media Center</h2>
                <button
                    onClick={() => {
                        setShowModal(true);
                        setEditTable(null);
                        setFile(null);
                        setFilePreview(null);
                        setIsCustomCategory(false);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                        formik.resetForm();
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                    + Add Document
                </button>
            </div>


            <div
                className={`fixed inset-0 z-50 flex justify-end transition-transform duration-300 ${showModal ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div ref={modalRef} className="relative bg-white w-96 h-full shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Add Document</h3>

                    <form onSubmit={formik.handleSubmit} className="space-y-4">

                        <div>
                            <label className="block font-medium mb-1">Upload Document</label>
                            <input
                                required
                                type="file"
                                name="documentFile"
                                multiple
                                ref={fileInputRef}
                                onChange={(e) => {
                                    const imgUrl = e.currentTarget.files[0];
                                    setFile(imgUrl);
                                    if (imgUrl) {
                                        setFilePreview(URL.createObjectURL(imgUrl));
                                    } else {
                                        setFilePreview(null);
                                    }
                                }}
                                className="w-full border p-2 rounded-md"
                            />
                            {formik.touched.documentFile && formik.errors.documentFile && (
                                <p className="text-red-500 text-sm">
                                    {formik.errors.documentFile}
                                </p>
                            )}
                            {(file || filePreview) && (
                                <div className="mt-2">
                                    {file ? (
                                        file.type.startsWith("image/") ? (
                                            <img
                                                src={filePreview}
                                                alt="preview"
                                                className="h-24 w-24 object-cover rounded-md"
                                            />
                                        ) : file.type === "application/pdf" ? (
                                            <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded-md w-fit">
                                                📄 {file.name}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">Unknown file type</p>
                                        )    
                                    ) : (     
                                        filePreview?.endsWith(".pdf") ? (
                                            <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded-md w-fit">
                                                📄 Existing PDF
                                            </div>
                                        ) : (
                                            <img
                                                src={filePreview}
                                                alt="preview"
                                                className="h-24 w-24 object-cover rounded-md"
                                            />
                                        )
                                    )}
                                </div>
                            )}   

                        </div>


                        <div>
                            <label className="block font-medium mb-1">Document Name</label>
                            <input
                                type="text"
                                name="documentName"
                                placeholder="Enter document name"
                                className="w-full border p-2 rounded-md"
                                value={formik.values.documentName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.documentName && formik.errors.documentName && (
                                <p className="text-red-500 text-sm">
                                    {formik.errors.documentName}
                                </p>
                            )}
                        </div>

                        {!isCustomCategory ? (
                            <div>
                                <label className="block font-medium mb-1">Document Category</label>
                                <select
                                    name="documentCategory"
                                    className="w-full border p-2 rounded-md"
                                    value={formik.values.documentCategory}
                                    onChange={(e) => {
                                        const selected = e.target.value;
                                        if (selected === "__other__") {
                                            setIsCustomCategory(true);
                                            formik.setFieldValue("documentCategory", "");
                                        } else {
                                            formik.handleChange(e);
                                        }
                                    }}
                                    onBlur={formik.handleBlur}
                                >
                                    <option value="">Select category</option>
                                    <option value="__other__">Other</option> {/* Always on top */}
                                    {categoryOptions.map((cat, idx) => (
                                        <option key={idx} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>

                                {formik.touched.documentCategory && formik.errors.documentCategory && (
                                    <p className="text-red-500 text-sm">{formik.errors.documentCategory}</p>
                                )}
                            </div>
                        ) : (
                            <div>
                                <label className="block font-medium mb-1">New Category</label>
                                <input
                                    type="text"
                                    name="documentCategory"
                                    className="w-full border p-2 rounded-md"
                                    placeholder="Enter new category"
                                    value={formik.values.documentCategory}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.documentCategory && formik.errors.documentCategory && (
                                    <p className="text-red-500  text-sm">{formik.errors.documentCategory}</p>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCustomCategory(false);
                                        formik.setFieldValue("documentCategory", "");
                                    }}
                                    className="mt-2 inline-block rounded-md bg-blue-500 px-3 py-1 text-sm font-medium text-white hover:bg-blue-600 transition"
                                >
                                    Choose from list
                                </button>

                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModal(false);
                                    setFile(null);
                                    setFilePreview(null);
                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                }}
                                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600  ${isLoading ? "cursor-not-allowed opacity-25" : ""}`}
                            >
                                {isLoading ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="p-4 ">
                {documents?.length > 0 ? (
                    <div className="overflow-x-auto whitespace-nowrap rounded-md border border-gray-300 shadow-sm">
                        <table className="min-w-full bg-white ">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="text-left px-4 py-2 border-b">Document Name</th>
                                    <th className="text-left px-4 py-2 border-b">Category</th>
                                    <th className="text-left px-4 py-2 border-b">Image</th>
                                    <th className="text-start pl-12 px-4 py-2 border-b">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((doc) => (
                                    <tr
                                        key={doc._id || doc.documentName}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-2 border-b">
                                            {doc?.documentName || "Unnamed Document"}
                                        </td>
                                        <td className="px-4 py-2 border-b capitalize">
                                            {doc?.documentCategory || "Uncategorized"}
                                        </td>
                                        <td className="px-4 py-2 border-b">
                                            {doc?.documentFile ? (
                                                <a
                                                    href={doc.documentFile}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:underline"
                                                >
                                                    View Image
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">No Image</span>
                                            )}
                                        </td>
                                        <td className="px-8 whitespace-nowrap  py-2 border-b text-start space-x-4">
                                            <span
                                                onClick={() => {
                                                    setEditTable(doc);
                                                    setShowModal(true);
                                                }}
                                                title="Edit Document"
                                                className="cursor-pointer"
                                            >
                                                <RiEdit2Fill className="inline-block text-yellow-500 hover:text-yellow-600" />
                                            </span>

                                            <span
                                                onClick={() => deleteDocumentData(doc?._id)}
                                                title="Delete Document"
                                                className="cursor-pointer"
                                            >
                                                <MdDelete className="inline-block text-red-500 hover:text-red-600" />
                                            </span>

                                            {doc?.documentFile && (
                                                <span
                                                    onClick={() => handleDownload(doc.documentFile, doc._id)}
                                                    title="Download Document"
                                                    className="cursor-pointer "
                                                >
                                                    <FaDownload className="inline-block text-blue-500 hover:text-blue-600" />

                                                </span>
                                            )}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-10 text-lg">
                        No data found.
                    </div>
                )}
            </div>
            <div className="w-[max-content] m-auto mt-4 mb-6">
                <button
                    className="text-sm mt-2 bg-[#1640d6] py-1 px-4 text-white border border-[#1640d6] rounded-3xl disabled:bg-[#b2b2b2] disabled:border-[#b2b2b2] disabled:cursor-not-allowed md:text-lg md:py-1 md:px-4 lg:text-xl lg:py-1 xl:text-base"
                    disabled={currentPage === 1}
                    onClick={handlePrevPage}
                >
                    Prev
                </button>

                <span className="mx-3 text-sm md:text-lg lg:text-xl xl:text-base">
                    {currentPage} of {totalPages}
                </span>

                <button
                    className="text-sm mt-2 bg-[#1640d6] py-1 px-4 text-white border border-[#1640d6] rounded-3xl disabled:bg-[#b2b2b2] disabled:border-[#b2b2b2] disabled:cursor-not-allowed md:text-lg md:py-1 md:px-4 lg:text-xl lg:py-1 xl:text-base"
                    disabled={currentPage === totalPages}
                    onClick={handleNextPage}
                >
                    Next
                </button>
            </div>


        </div>
    );
};

export default DocumentCenter;
