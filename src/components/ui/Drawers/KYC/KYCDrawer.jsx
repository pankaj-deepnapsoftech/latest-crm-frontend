import React, { useState, useEffect } from 'react';
import { BiX } from "react-icons/bi";
import {
  Box,
  Progress,
  Text,
  VStack,
  HStack,
  Badge,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  Button
} from "@chakra-ui/react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCookies } from 'react-cookie';

const KYCDrawer = ({ closeDrawerHandler, dataId }) => {
  const [kycData, setKycData] = useState({
    annual_turn_over: '',
    company_type: '',
    company_located: '',
    company_tenure: '',
    kyc_remarks: ''
  });

  const [currentProgress, setCurrentProgress] = useState(0);
  const [cookies] = useCookies();
  const getProgressColor = (progress) => {
    if (progress >= 80) return "green";
    if (progress >= 60) return "yellow";
    if (progress >= 40) return "orange";
    return "red";
  };

  const getProgressStatus = (progress) => {
    if (progress >= 80) return "Excellent";
    if (progress >= 60) return "Good";
    if (progress >= 40) return "Fair";
    return "Poor";
  };

  // Calculate progress based on filled fields
  const calculateKYCProgress = (lead) => {
    const kycFields = [
      "annual_turn_over",
      "company_type",
      "company_located",
      "company_tenure",
      "kyc_remarks",
    ];

    let filled = 0;
    kycFields.forEach((field) => {
      if (lead[field] && lead[field].trim() !== "") {
        filled++;
      }
    });

    return Math.round((filled / kycFields.length) * 100); // % complete
  };

  // Update progress when KYC data changes
  useEffect(() => {
    const progress = calculateKYCProgress(kycData);
    setCurrentProgress(progress);
  }, [kycData]);

  const handleInputChange = (field, value) => {
    setKycData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  console.log(dataId)
  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}lead/kyc`,
        {
          _id:dataId,
          annual_turn_over: kycData.annual_turn_over,
          company_type: kycData.company_type,
          company_located: kycData.company_located,
          company_tenure: kycData.company_tenure,
          kyc_remarks: kycData.kyc_remarks,
        },
        {
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("KYC saved/updated successfully!");
        closeDrawerHandler(); // close modal
      } else {
        toast.error(response.data.message || "Failed to save KYC");
      }
    } catch (error) {
      console.error("KYC Error:", error);
      toast.error(error.response?.data?.message);
    }
  };

  useEffect(() => {
    const fetchLead = async () => {
      if (!dataId) return;
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}lead/lead-details`,
          { leadId: dataId },
          {
            headers: { Authorization: `Bearer ${cookies?.access_token}` },
          }
        );
         
        if (response.data.success) {
          const lead = response?.data?.lead?.kyc;
          setKycData({
            annual_turn_over: lead?.annual_turn_over || "",
            company_type: lead?.company_type || "",
            company_located: lead?.company_located || "",
            company_tenure: lead?.company_tenure || "",
            kyc_remarks: lead?.kyc_remarks || "",
          });
        }
      } catch (err) {
        console.error("Error fetching lead KYC:", err);
      }
    };

    fetchLead();
  }, [dataId]);



  return (
    <div
      className="absolute overflow-auto h-[100vh] w-[90vw] md:w-[500px] bg-white right-0 top-0 z-10 py-3"
      style={{
        boxShadow:
          "rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px",
      }}
    >
      <h1 className="px-4 flex gap-x-2 items-center text-xl py-3 border-b">
        <BiX onClick={closeDrawerHandler} size="26px" />
        KYC Form
      </h1>

      <div className="mt-4 px-5 pb-5">
        <h2 className="text-xl font-bold py-3 text-center mb-4 border-y bg-blue-200 rounded-lg shadow-md">
          KYC Information Form
        </h2>

        <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="md" mb={4}>
          <Text fontSize="lg" fontWeight="bold" mb={3} textAlign="center">
            Current Progress
          </Text>

          <VStack spacing={3}>
            <Text fontSize="2xl" fontWeight="bold" color={getProgressColor(currentProgress)}>
              {currentProgress}%
            </Text>

            <Progress
              value={currentProgress}
              size="lg"
              colorScheme={getProgressColor(currentProgress)}
              borderRadius="full"
              width="100%"
            />

            <Badge
              colorScheme={getProgressColor(currentProgress)}
              fontSize="md"
              p={2}
              borderRadius="md"
            >
              {getProgressStatus(currentProgress)}
            </Badge>
          </VStack>
        </Box>

        <VStack spacing={4} align="stretch">
          {/* Annual Turnover */}
          <FormControl>
            <FormLabel fontWeight="bold" fontSize="sm">Annual Turnover</FormLabel>
            <Input
              value={kycData.annual_turn_over}
              onChange={(e) => handleInputChange('annual_turn_over', e.target.value)}
              placeholder="Enter annual turnover (e.g., 10 Cr)"
              size="md"
              borderColor={kycData.annual_turn_over ? "green.300" : "gray.300"}
              _focus={{ borderColor: "blue.500" }}
            />
          </FormControl>

          {/* Company Type */}
          <FormControl>
            <FormLabel fontWeight="bold" fontSize="sm">Company Type</FormLabel>
            <Select
              value={kycData.company_type}
              onChange={(e) => handleInputChange('company_type', e.target.value)}
              placeholder="Select company type"
              size="md"
              borderColor={kycData.company_type ? "green.300" : "gray.300"}
              _focus={{ borderColor: "blue.500" }}
            >
              <option value="Limited">Limited</option>
              <option value="Private Limited">Private Limited</option>
              <option value="Proprietorship">Proprietorship</option>
              <option value="Partnership">Partnership</option>
            </Select>
          </FormControl>

          {/* Company Located */}
          <FormControl>
            <FormLabel fontWeight="bold" fontSize="sm">Company Located</FormLabel>
            <Input
              value={kycData.company_located}
              onChange={(e) => handleInputChange('company_located', e.target.value)}
              placeholder="Enter company location"
              size="md"
              borderColor={kycData.company_located ? "green.300" : "gray.300"}
              _focus={{ borderColor: "blue.500" }}
            />
          </FormControl>

          {/* Company Tenure */}
          <FormControl>
            <FormLabel fontWeight="bold" fontSize="sm">Company Tenure</FormLabel>
            <Input
              value={kycData.company_tenure}
              onChange={(e) => handleInputChange('company_tenure', e.target.value)}
              placeholder="Enter company tenure (e.g., 5 years)"
              size="md"
              borderColor={kycData.company_tenure ? "green.300" : "gray.300"}
              _focus={{ borderColor: "blue.500" }}
            />
          </FormControl>

          {/* KYC Remarks */}
          <FormControl>
            <FormLabel fontWeight="bold" fontSize="sm"> Remarks</FormLabel>
            <Textarea
              value={kycData.kyc_remarks}
              onChange={(e) => handleInputChange('kyc_remarks', e.target.value)}
              placeholder="Enter KYC remarks (e.g., PAN + GST verified)"
              size="md"
              rows={3}
              borderColor={kycData.kyc_remarks ? "green.300" : "gray.300"}
              _focus={{ borderColor: "blue.500" }}
            />
          </FormControl>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            colorScheme="blue"
            size="lg"
            mt={4}
          >
            Save / Update KYC
          </Button>
        </VStack>



        {/* Progress Legend */}
        {/* <Box p={4} borderWidth="1px" borderRadius="lg" bg="gray.50" mt={4}>
          <Text fontSize="sm" fontWeight="bold" mb={2}>Progress Legend:</Text>
          <VStack spacing={1} align="stretch">
            <HStack>
              <Box w={3} h={3} bg="green.500" borderRadius="sm"></Box>
              <Text fontSize="xs">80-100%: Excellent</Text>
            </HStack>
            <HStack>
              <Box w={3} h={3} bg="yellow.500" borderRadius="sm"></Box>
              <Text fontSize="xs">60-79%: Good</Text>
            </HStack>
            <HStack>
              <Box w={3} h={3} bg="orange.500" borderRadius="sm"></Box>
              <Text fontSize="xs">40-59%: Fair</Text>
            </HStack>
            <HStack>
              <Box w={3} h={3} bg="red.500" borderRadius="sm"></Box>
              <Text fontSize="xs">0-39%: Poor</Text>
            </HStack>
          </VStack>
        </Box> */}
      </div>
    </div>
  );
};

export default KYCDrawer;
