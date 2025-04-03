import { useState, ChangeEvent, FormEvent } from "react";
import { useLocation } from "react-router";
import ComponentCard from "../../../components/common/ComponentCard";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PropertyLocationFields from "../../Residential/components/propertyLocationFields";
import MediaUploadSection from "../../Residential/components/MediaUploadSection";
import DatePicker from "../../../components/form/date-picker";

interface AroundProperty {
  place: string;
  distance: string;
}

interface CommercialBuyFormData {
  propertyType: "Residential" | "Commercial";
  lookingTo: "Sell" | "Rent";
  transactionType: "New" | "Resale";
  location: string;
  propertySubType: "Office" | "Retail Shop" | "Show Room" | "Warehouse" | "Plot" | "Others";
  reraApproved: "Yes" | "No";
  constructionStatus: "Ready to move" | "Under Construction";
  ageOfProperty: string;
  possessionEnds: string;
  passengerLifts: string;
  serviceLifts: string;
  stairCases: string;
  privateParking: string;
  publicParking: string;
  privateWashrooms: string;
  publicWashrooms: string;
  areaUnits: "Sq.ft" | "Sq.yd" | "Acres";
  builtUpArea: string;
  carpetArea: string;
  totalProjectArea: string;
  plotArea: string;
  lengthArea: string;
  widthArea: string;
  unitCost: string;
  propertyCost: string;
  ownership: "Freehold" | "Leasehold" | "Cooperative society" | "Power of attorney";
  facilities: string[];
  flatNo: string;
  plotNumber: string;
  zoneType: "Industrial" | "Commercial" | "Special Economic Zone" | "Open Spaces" | "Agricultural Zone" | "Other";
  suitable: "Jewellery" | "Grocery" | "Clinic" | "Footwear" | "Electronics" | "Clothing" | "Others";
  loanFacility: "Yes" | "No";
  facing: "East" | "West" | "South" | "North" | "";
  carParking: "0" | "1" | "2" | "3" | "4+";
  bikeParking: "0" | "1" | "2" | "3" | "4+";
  openParking: "0" | "1" | "2" | "3" | "4+";
  aroundProperty: AroundProperty[];
  pantryRoom: "Yes" | "No";
  possessionStatus: "Immediate" | "Future";
  investorProperty: "Yes" | "No";
  propertyDescription: string;
  city: string;
  propertyName: string;
  locality: string;
  floorNo: string;
  totalFloors: string;
  photos: File[];
  video: File | null;
  floorPlan: File | null;
  featuredImageIndex: number | null;
}

interface SelectOption {
  value: string;
  label: string;
}

const CommercialBuyEdit: React.FC = () => {
  const location = useLocation();
  const property = location.state?.property;

  const [formData, setFormData] = useState<CommercialBuyFormData>(() => {
    if (property) {
      const possessionEndDate = property.under_construction
        ? new Date(property.under_construction).toISOString().split("T")[0]
        : "";
        const carParkingValue = property.car_parking 
        ? (parseInt(property.car_parking) > 4 ? "4+" : String(property.car_parking)) as "0" | "1" | "2" | "3" | "4+"
        : "0";
      const bikeParkingValue = property.bike_parking 
        ? (parseInt(property.bike_parking) > 4 ? "4+" : String(property.bike_parking)) as "0" | "1" | "2" | "3" | "4+"
        : "0";
      const openParkingValue = property.open_parking 
        ? (parseInt(property.open_parking) > 4 ? "4+" : String(property.open_parking)) as "0" | "1" | "2" | "3" | "4+"
        : "0";
      return {
        propertyType: property.property_in || "Commercial",
        lookingTo: property.property_for || "Sell",
        transactionType: property.transaction_type || "New",
        location: property.google_address || "",
        propertySubType: property.sub_type || "Office",
        reraApproved: property.rera_approved === 1 ? "Yes" : "No",
        constructionStatus:
          property.occupancy === "Under Construction" ? "Under Construction" : "Ready to move",
        ageOfProperty: property.property_age || "",
        possessionEnds: possessionEndDate,
        passengerLifts: property.passenger_lifts ? String(property.passenger_lifts) : "",
        serviceLifts: property.service_lifts ? String(property.service_lifts) : "",
        stairCases: property.stair_cases ? String(property.stair_cases) : "",
        privateParking: property.private_parking ? String(property.private_parking) : "",
        publicParking: property.public_parking ? String(property.public_parking) : "",
        privateWashrooms: property.private_washrooms ? String(property.private_washrooms) : "",
        publicWashrooms: property.public_washrooms ? String(property.public_washrooms) : "",
        areaUnits: property.area_units || "Sq.ft",
        builtUpArea: property.builtup_area || "",
        carpetArea: property.carpet_area || "",
        totalProjectArea: property.total_project_area || "",
        plotArea: property.plot_area || "",
        lengthArea: property.length_area || "",
        widthArea: property.width_area || "",
        unitCost: property.builtup_unit || "",
        propertyCost: property.property_cost || "",
        ownership: property.ownership_type || "Freehold",
        facilities: property.facilities ? property.facilities.split(", ") : [],
        flatNo: property.unit_flat_house_no || "",
        plotNumber: property.plot_number || "",
        zoneType: property.zone_types || "Commercial",
        suitable: property.business_types || "Others",
        loanFacility: property.loan_facility || "Yes",
        facing: property.facing || "",
        carParking: carParkingValue,
        bikeParking: bikeParkingValue,
        openParking: openParkingValue,
        aroundProperty: [],
        pantryRoom: property.pantry_room || "No",
        possessionStatus: property.possession_status || "Immediate",
        investorProperty: property.investor_property || "No",
        propertyDescription: property.description || "",
        city: property.city_id || "",
        propertyName: property.property_name || "",
        locality: property.location_id || "",
        floorNo: property.floors || "",
        totalFloors: property.total_floors || "",
        photos: [],
        video: null,
        floorPlan: null,
        featuredImageIndex: null,
      };
    }
    return {
      propertyType: "Commercial",
      lookingTo: "Sell",
      transactionType: "New",
      location: "",
      propertySubType: "Office",
      reraApproved: "Yes",
      constructionStatus: "Ready to move",
      ageOfProperty: "",
      possessionEnds: "",
      passengerLifts: "",
      serviceLifts: "",
      stairCases: "",
      privateParking: "",
      publicParking: "",
      privateWashrooms: "",
      publicWashrooms: "",
      areaUnits: "Sq.ft",
      builtUpArea: "",
      carpetArea: "",
      totalProjectArea: "",
      plotArea: "",
      lengthArea: "",
      widthArea: "",
      unitCost: "",
      propertyCost: "",
      ownership: "Freehold",
      facilities: [],
      flatNo: "",
      plotNumber: "",
      zoneType: "Commercial",
      suitable: "Others",
      loanFacility: "Yes",
      facing: "",
      carParking: "0",
      bikeParking: "0",
      openParking: "0",
      aroundProperty: [],
      pantryRoom: "No",
      possessionStatus: "Immediate",
      investorProperty: "No",
      propertyDescription: "",
      city: "",
      propertyName: "",
      locality: "",
      floorNo: "",
      totalFloors: "",
      photos: [],
      video: null,
      floorPlan: null,
      featuredImageIndex: null,
    };
  });

  const [errors, setErrors] = useState({
    propertyType: "",
    lookingTo: "",
    propertySubType: "",
    reraApproved: "",
    constructionStatus: "",
    ageOfProperty: "",
    possessionEnds: "",
    passengerLifts: "",
    serviceLifts: "",
    stairCases: "",
    privateParking: "",
    publicParking: "",
    privateWashrooms: "",
    publicWashrooms: "",
    builtUpArea: "",
    carpetArea: "",
    totalProjectArea: "",
    plotArea: "",
    lengthArea: "",
    widthArea: "",
    unitCost: "",
    propertyCost: "",
    ownership: "",
    flatNo: "",
    plotNumber: "",
    zoneType: "",
    suitable: "",
    loanFacility: "",
    aroundProperty: "",
    pantryRoom: "",
    possessionStatus: "",
    investorProperty: "",
    propertyDescription: "",
    city: "",
    propertyName: "",
    locality: "",
    floorNo: "",
    totalFloors: "",
    photos: "",
    video: "",
    floorPlan: "",
    featuredImage: "",
  });

  const [placeAroundProperty, setPlaceAroundProperty] = useState("");
  const [distanceFromProperty, setDistanceFromProperty] = useState("");

  const propertyTypeOptions: SelectOption[] = [
    { value: "Residential", label: "Residential" },
    { value: "Commercial", label: "Commercial" },
  ];

  const lookingToOptions: SelectOption[] = [
    { value: "Sell", label: "Sell" },
    { value: "Rent", label: "Rent" },
  ];

  const transactionTypeOptions: SelectOption[] = [
    { value: "New", label: "New" },
    { value: "Resale", label: "Resale" },
  ];

  const propertySubTypeOptions: SelectOption[] = [
    { value: "Office", label: "Office" },
    { value: "Retail Shop", label: "Retail Shop" },
    { value: "Show Room", label: "Show Room" },
    { value: "Warehouse", label: "Warehouse" },
    { value: "Plot", label: "Plot" },
    { value: "Others", label: "Others" },
  ];

  const constructionStatusOptions: SelectOption[] = [
    { value: "Ready to move", label: "Ready to move" },
    { value: "Under Construction", label: "Under Construction" },
  ];

  const areaUnitsOptions: SelectOption[] = [
    { value: "Sq.ft", label: "Sq.ft" },
    { value: "Sq.yd", label: "Sq.yd" },
    { value: "Acres", label: "Acres" },
  ];

  const ownershipOptions: SelectOption[] = [
    { value: "Freehold", label: "Freehold" },
    { value: "Leasehold", label: "Leasehold" },
    { value: "Cooperative society", label: "Cooperative society" },
    { value: "Power of attorney", label: "Power of attorney" },
  ];

  const zoneTypeOptions: SelectOption[] = [
    { value: "Industrial", label: "Industrial" },
    { value: "Commercial", label: "Commercial" },
    { value: "Special Economic Zone", label: "Special Economic Zone" },
    { value: "Open Spaces", label: "Open Spaces" },
    { value: "Agricultural Zone", label: "Agricultural Zone" },
    { value: "Other", label: "Other" },
  ];

  const suitableOptions: SelectOption[] = [
    { value: "Jewellery", label: "Jewellery" },
    { value: "Grocery", label: "Grocery" },
    { value: "Clinic", label: "Clinic" },
    { value: "Footwear", label: "Footwear" },
    { value: "Electronics", label: "Electronics" },
    { value: "Clothing", label: "Clothing" },
    { value: "Others", label: "Others" },
  ];

  const carParkingOptions: SelectOption[] = [
    { value: "0", label: "0" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4+", label: "4+" },
  ];

  const bikeParkingOptions: SelectOption[] = [
    { value: "0", label: "0" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4+", label: "4+" },
  ];

  const openParkingOptions: SelectOption[] = [
    { value: "0", label: "0" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4+", label: "4+" },
  ];

  const facilitiesOptions: string[] = [
    "Lift", "CCTV", "Gym", "Garden", "Club House", "Sports", "Swimming Pool",
    "Intercom", "Power Backup", "Gated Community", "Regular Water", "Community Hall",
    "Pet Allowed", "Entry / Exit", "Outdoor Fitness Station", "Half Basket Ball Court",
    "Gazebo", "Badminton Court", "Children Play Area", "Ample Greenery",
    "Water Harvesting Pit", "Water Softner", "Solar Fencing", "Security Cabin",
    "Lawn", "Transformer Yard", "Amphitheatre", "Lawn with Stepping Stones", "None",
  ];

  const possessionStatusOptions: SelectOption[] = [
    { value: "Immediate", label: "Immediate" },
    { value: "Future", label: "Future" },
  ];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "city") {
      setErrors((prev) => ({ ...prev, city: !value ? "City is required" : "" }));
    }

    if (name === "propertyName") {
      setErrors((prev) => ({ ...prev, propertyName: !value ? "Property name is required" : "" }));
    }

    if (name === "locality") {
      setErrors((prev) => ({ ...prev, locality: !value ? "Locality is required" : "" }));
    }

    if (name === "flatNo") {
      setErrors((prev) => ({ ...prev, flatNo: !value ? "Flat number is required" : "" }));
    }

    if (name === "plotNumber") {
      setErrors((prev) => ({ ...prev, plotNumber: !value ? "Plot number is required" : "" }));
    }

    if (name === "floorNo") {
      setErrors((prev) => ({ ...prev, floorNo: !value ? "Floor number is required" : "" }));
    }

    if (name === "totalFloors") {
      setErrors((prev) => ({ ...prev, totalFloors: !value ? "Total floors is required" : "" }));
    }

    if (name === "builtUpArea") {
      setErrors((prev) => ({ ...prev, builtUpArea: !value ? "Built-up area is required" : "" }));
    }

    if (name === "totalProjectArea") {
      setErrors((prev) => ({ ...prev, totalProjectArea: !value ? "Total project area is required" : "" }));
    }

    if (name === "unitCost") {
      setErrors((prev) => ({ ...prev, unitCost: !value ? "Unit cost is required" : "" }));
    }

    if (name === "propertyCost") {
      const propertyCostValue = parseFloat(value);
      setErrors((prev) => ({
        ...prev,
        propertyCost: (propertyCostValue < 100000 || propertyCostValue > 3000000000)
          ? "Property cost should be between 1 lakh to 300 cr"
          : !value ? "Property cost is required" : ""
      }));
    }

    if (name === "propertyDescription") {
      setErrors((prev) => ({ ...prev, propertyDescription: !value ? "Property description is required" : "" }));
    }

    if (name === "ageOfProperty") {
      setErrors((prev) => ({ ...prev, ageOfProperty: !value ? "Age of property is required" : "" }));
    }
  };

  const handleSelectChange = (name: keyof CommercialBuyFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "constructionStatus") {
      setFormData((prev) => ({ ...prev, ageOfProperty: "", possessionEnds: "" }));
      setErrors((prev) => ({ ...prev, ageOfProperty: "", possessionEnds: "" }));
    }

    if (name === "propertyType") {
      setErrors((prev) => ({ ...prev, propertyType: !value ? "Property type is required" : "" }));
    }

    if (name === "lookingTo") {
      setErrors((prev) => ({ ...prev, lookingTo: !value ? "Looking to is required" : "" }));
    }

    if (name === "propertySubType") {
      setErrors((prev) => ({ ...prev, propertySubType: !value ? "Property sub type is required" : "" }));
    }

    if (name === "reraApproved") {
      setErrors((prev) => ({ ...prev, reraApproved: !value ? "RERA approval status is required" : "" }));
    }

    if (name === "constructionStatus") {
      setErrors((prev) => ({ ...prev, constructionStatus: !value ? "Construction status is required" : "" }));
    }

    if (name === "ownership") {
      setErrors((prev) => ({ ...prev, ownership: !value ? "Ownership is required" : "" }));
    }

    if (name === "zoneType") {
      setErrors((prev) => ({ ...prev, zoneType: !value ? "Zone type is required" : "" }));
    }

    if (name === "suitable") {
      setErrors((prev) => ({ ...prev, suitable: !value ? "Suitable for is required" : "" }));
    }

    if (name === "loanFacility") {
      setErrors((prev) => ({ ...prev, loanFacility: !value ? "Loan facility is required" : "" }));
    }

    if (name === "pantryRoom") {
      setErrors((prev) => ({ ...prev, pantryRoom: !value ? "Pantry room is required" : "" }));
    }

    if (name === "possessionStatus") {
      setErrors((prev) => ({ ...prev, possessionStatus: !value ? "Possession status is required" : "" }));
    }

    if (name === "investorProperty") {
      setErrors((prev) => ({ ...prev, investorProperty: !value ? "Investor property is required" : "" }));
    }
  };

  const handleFacilityChange = (facility: string) => {
    setFormData((prev) => {
      const updatedFacilities = prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility];
      return { ...prev, facilities: updatedFacilities };
    });
  };

  const handleAddAroundProperty = () => {
    if (placeAroundProperty && distanceFromProperty) {
      setFormData((prev) => ({
        ...prev,
        aroundProperty: [...prev.aroundProperty, { place: placeAroundProperty, distance: distanceFromProperty }],
      }));
      setPlaceAroundProperty("");
      setDistanceFromProperty("");
      setErrors((prev) => ({ ...prev, aroundProperty: "" }));
    } else {
      setErrors((prev) => ({ ...prev, aroundProperty: "Both place and distance are required" }));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: any = {};

    if (!formData.propertyType) newErrors.propertyType = "Property type is required";
    if (!formData.lookingTo) newErrors.lookingTo = "Looking to is required";
    if (!formData.propertySubType) newErrors.propertySubType = "Property sub type is required";
    if (!formData.reraApproved) newErrors.reraApproved = "RERA approval status is required";

    if (["Office", "Retail Shop", "Show Room", "Warehouse", "Others"].includes(formData.propertySubType) &&
        !formData.constructionStatus) {
      newErrors.constructionStatus = "Construction status is required";
    }

    if (formData.constructionStatus === "Ready to move" && !formData.ageOfProperty) {
      newErrors.ageOfProperty = "Age of property is required";
    }

    if (formData.constructionStatus === "Under Construction" && !formData.possessionEnds) {
      newErrors.possessionEnds = "Possession ends date is required";
    }

    if (["Office", "Retail Shop", "Show Room"].includes(formData.propertySubType)) {
      if (!formData.passengerLifts) newErrors.passengerLifts = "Passenger lifts are required";
      if (!formData.serviceLifts) newErrors.serviceLifts = "Service lifts are required";
      if (!formData.stairCases) newErrors.stairCases = "Stair cases are required";
      if (!formData.privateParking) newErrors.privateParking = "Private parking is required";
      if (!formData.publicParking) newErrors.publicParking = "Public parking is required";
      if (!formData.privateWashrooms) newErrors.privateWashrooms = "Private washrooms are required";
      if (!formData.publicWashrooms) newErrors.publicWashrooms = "Public washrooms are required";
      if (!formData.builtUpArea) newErrors.builtUpArea = "Built-up area is required";
    }

    if (["Warehouse", "Plot", "Others"].includes(formData.propertySubType) && !formData.plotArea) {
      newErrors.plotArea = "Plot area is required";
    }

    if (formData.propertySubType === "Plot") {
      if (!formData.lengthArea) newErrors.lengthArea = "Length area is required";
      if (!formData.widthArea) newErrors.widthArea = "Width area is required";
      if (!formData.plotNumber) newErrors.plotNumber = "Plot number is required";
    }

    if (!formData.totalProjectArea) newErrors.totalProjectArea = "Total project area is required";
    if (!formData.unitCost) newErrors.unitCost = "Unit cost is required";
    if (!formData.propertyCost) newErrors.propertyCost = "Property cost is required";
    if (!formData.ownership) newErrors.ownership = "Ownership is required";

    if (["Office", "Retail Shop", "Show Room", "Warehouse", "Others"].includes(formData.propertySubType) &&
        !formData.flatNo) {
      newErrors.flatNo = "Flat number is required";
    }

    if (["Office", "Warehouse", "Others"].includes(formData.propertySubType) && !formData.zoneType) {
      newErrors.zoneType = "Zone type is required";
    }

    if (["Retail Shop", "Show Room", "Plot", "Others"].includes(formData.propertySubType) && !formData.suitable) {
      newErrors.suitable = "Suitable for is required";
    }

    if (!formData.loanFacility) newErrors.loanFacility = "Loan facility is required";
    if (formData.aroundProperty.length === 0) newErrors.aroundProperty = "At least one place around property is required";

    if (["Office", "Show Room", "Others"].includes(formData.propertySubType) && !formData.pantryRoom) {
      newErrors.pantryRoom = "Pantry room is required";
    }

    if (formData.propertySubType === "Plot" && !formData.possessionStatus) {
      newErrors.possessionStatus = "Possession status is required";
    }

    if (formData.propertySubType === "Plot" && !formData.investorProperty) {
      newErrors.investorProperty = "Investor property is required";
    }

    if (!formData.propertyDescription) newErrors.propertyDescription = "Property description is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.propertyName) newErrors.propertyName = "Property name is required";
    if (!formData.locality) newErrors.locality = "Locality is required";
    if (!formData.floorNo) newErrors.floorNo = "Floor number is required";
    if (!formData.totalFloors) newErrors.totalFloors = "Total floors is required";

    if (formData.photos.length === 0) {
      newErrors.photos = "At least one photo is required";
    } else if (formData.photos.length < 5) {
      newErrors.photos = "You must upload exactly 5 photos";
    }

    if (formData.photos.length === 5 && formData.featuredImageIndex === null) {
      newErrors.featuredImage = "You must select a featured image when 5 photos are uploaded";
    }

    if (!formData.video) newErrors.video = "Video upload is required";
    if (!formData.floorPlan) newErrors.floorPlan = "Floor plan upload is required";

    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (Object.values(newErrors).every((error) => !error)) {
      console.log("Form Data:", formData);
    }
  };

  const areaUnitLabel = formData.areaUnits || "Sq.ft";
  const shouldRenderFields = formData.propertyType === "Commercial" &&
    formData.lookingTo === "Sell" &&
    (formData.transactionType === "New" || formData.transactionType === "Resale");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-2 sm:px-6 lg:px-8">
      <PageBreadcrumb pageTitle="Commercial Buy Edit" pagePlacHolder="Edit property details" />
      <ComponentCard title="Edit Basic Details">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="propertyType">Property Type *</Label>
            <div className="flex space-x-4">
              {propertyTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelectChange("propertyType")(option.value)}
                  className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                    formData.propertyType === option.value
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {errors.propertyType && <p className="text-red-500 text-sm mt-1">{errors.propertyType}</p>}
          </div>

          <div>
            <Label htmlFor="lookingTo">Looking to *</Label>
            <div className="flex space-x-4">
              {lookingToOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelectChange("lookingTo")(option.value)}
                  className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                    formData.lookingTo === option.value
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {errors.lookingTo && <p className="text-red-500 text-sm mt-1">{errors.lookingTo}</p>}
          </div>

          <div>
            <Label htmlFor="transactionType">Transaction Type</Label>
            <Select
              options={transactionTypeOptions}
              placeholder="Select transaction type"
              onChange={handleSelectChange("transactionType")}
              value={formData.transactionType}
              className="dark:bg-dark-900"
            />
          </div>

          <div>
            <Label htmlFor="location">Search location</Label>
            <Input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Search location"
              className="dark:bg-dark-900"
            />
          </div>

          <div>
            <Label htmlFor="propertySubType">Property Sub Type *</Label>
            <div className="flex space-x-4">
              {propertySubTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelectChange("propertySubType")(option.value)}
                  className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                    formData.propertySubType === option.value
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {errors.propertySubType && <p className="text-red-500 text-sm mt-1">{errors.propertySubType}</p>}
          </div>

          {shouldRenderFields && (
            <>
              <div>
                <Label htmlFor="reraApproved">RERA Approved *</Label>
                <div className="flex space-x-4">
                  {["Yes", "No"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelectChange("reraApproved")(option)}
                      className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                        formData.reraApproved === option
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {errors.reraApproved && <p className="text-red-500 text-sm mt-1">{errors.reraApproved}</p>}
              </div>

              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room" ||
                formData.propertySubType === "Warehouse" ||
                formData.propertySubType === "Others") && (
                <div>
                  <Label htmlFor="constructionStatus">Construction Status *</Label>
                  <div className="flex space-x-4">
                    {constructionStatusOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelectChange("constructionStatus")(option.value)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.constructionStatus === option.value
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {errors.constructionStatus && <p className="text-red-500 text-sm mt-1">{errors.constructionStatus}</p>}
                </div>
              )}

              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room" ||
                formData.propertySubType === "Warehouse" ||
                formData.propertySubType === "Others") &&
                formData.constructionStatus === "Ready to move" && (
                <div>
                  <Label htmlFor="ageOfProperty">Age of Property *</Label>
                  <Input
                    type="text"
                    id="ageOfProperty"
                    name="ageOfProperty"
                    value={formData.ageOfProperty}
                    onChange={handleInputChange}
                    placeholder="Enter age of property (e.g., 5 years)"
                    className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {errors.ageOfProperty && <p className="text-red-500 text-sm mt-1">{errors.ageOfProperty}</p>}
                </div>
              )}

              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room" ||
                formData.propertySubType === "Warehouse" ||
                formData.propertySubType === "Others") &&
                formData.constructionStatus === "Under Construction" && (
                <div>
                  <DatePicker
                    id="possessionEnds"
                    label="Possession Ends *"
                    placeholder="Select possession end date"
                    onChange={(selectedDates) => {
                      const date = selectedDates[0]?.toISOString().split("T")[0] || "";
                      setFormData((prev) => ({ ...prev, possessionEnds: date }));
                      setErrors((prev) => ({ ...prev, possessionEnds: !date ? "Possession ends date is required" : "" }));
                    }}
                    defaultDate={formData.possessionEnds ? new Date(formData.possessionEnds) : undefined}
                  />
                  {errors.possessionEnds && <p className="text-red-500 text-sm mt-1">{errors.possessionEnds}</p>}
                </div>
              )}

              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room") && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Lift & Stair Cases</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="passengerLifts">Passenger Lifts *</Label>
                      <Input
                        type="number"
                        id="passengerLifts"
                        name="passengerLifts"
                        value={formData.passengerLifts}
                        onChange={handleInputChange}
                        placeholder="Enter passenger lifts"
                        className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {errors.passengerLifts && <p className="text-red-500 text-sm mt-1">{errors.passengerLifts}</p>}
                    </div>
                    <div>
                      <Label htmlFor="serviceLifts">Service Lifts *</Label>
                      <Input
                        type="number"
                        id="serviceLifts"
                        name="serviceLifts"
                        value={formData.serviceLifts}
                        onChange={handleInputChange}
                        placeholder="Enter service lifts"
                        className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {errors.serviceLifts && <p className="text-red-500 text-sm mt-1">{errors.serviceLifts}</p>}
                    </div>
                    <div>
                      <Label htmlFor="stairCases">Stair Cases *</Label>
                      <Input
                        type="number"
                        id="stairCases"
                        name="stairCases"
                        value={formData.stairCases}
                        onChange={handleInputChange}
                        placeholder="Enter stair cases"
                        className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {errors.stairCases && <p className="text-red-500 text-sm mt-1">{errors.stairCases}</p>}
                    </div>
                  </div>
                </div>
              )}

              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room") && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Parking</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="privateParking">Private Parking *</Label>
                      <Input
                        type="number"
                        id="privateParking"
                        name="privateParking"
                        value={formData.privateParking}
                        onChange={handleInputChange}
                        placeholder="Enter private parking"
                        className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {errors.privateParking && <p className="text-red-500 text-sm mt-1">{errors.privateParking}</p>}
                    </div>
                    <div>
                      <Label htmlFor="publicParking">Public Parking *</Label>
                      <Input
                        type="number"
                        id="publicParking"
                        name="publicParking"
                        value={formData.publicParking}
                        onChange={handleInputChange}
                        placeholder="Enter public parking"
                        className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {errors.publicParking && <p className="text-red-500 text-sm mt-1">{errors.publicParking}</p>}
                    </div>
                  </div>
                </div>
              )}

              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room") && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Washrooms</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="privateWashrooms">Private Washrooms *</Label>
                      <Input
                        type="number"
                        id="privateWashrooms"
                        name="privateWashrooms"
                        value={formData.privateWashrooms}
                        onChange={handleInputChange}
                        placeholder="Enter private washrooms"
                        className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {errors.privateWashrooms && <p className="text-red-500 text-sm mt-1">{errors.privateWashrooms}</p>}
                    </div>
                    <div>
                      <Label htmlFor="publicWashrooms">Public Washrooms *</Label>
                      <Input
                        type="number"
                        id="publicWashrooms"
                        name="publicWashrooms"
                        value={formData.publicWashrooms}
                        onChange={handleInputChange}
                        placeholder="Enter public washrooms"
                        className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {errors.publicWashrooms && <p className="text-red-500 text-sm mt-1">{errors.publicWashrooms}</p>}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="areaUnits">Area Units</Label>
                <Select
                  options={areaUnitsOptions}
                  placeholder="Select area units"
                  onChange={handleSelectChange("areaUnits")}
                  value={formData.areaUnits}
                  className="dark:bg-dark-900"
                />
              </div>

              {formData.propertySubType === "Plot" && (
                <div>
                  <Label htmlFor="lengthArea">Length Area *</Label>
                  <Input
                    type="number"
                    id="lengthArea"
                    name="lengthArea"
                    value={formData.lengthArea}
                    onChange={handleInputChange}
                    placeholder="Enter length area"
                    className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {errors.lengthArea && <p className="text-red-500 text-sm mt-1">{errors.lengthArea}</p>}
                </div>
              )}

              {formData.propertySubType === "Plot" && (
                <div>
                  <Label htmlFor="widthArea">Width Area *</Label>
                  <Input
                    type="number"
                    id="widthArea"
                    name="widthArea"
                    value={formData.widthArea}
                    onChange={handleInputChange}
                    placeholder="Enter width area"
                    className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {errors.widthArea && <p className="text-red-500 text-sm mt-1">{errors.widthArea}</p>}
                </div>
              )}

              {(formData.propertySubType === "Warehouse" ||
                formData.propertySubType === "Plot" ||
                formData.propertySubType === "Others") && (
                <div>
                  <Label htmlFor="plotArea">Plot Area ({areaUnitLabel}) *</Label>
                  <Input
                    type="number"
                    id="plotArea"
                    name="plotArea"
                    value={formData.plotArea}
                    onChange={handleInputChange}
                    placeholder="Enter plot area"
                    className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {errors.plotArea && <p className="text-red-500 text-sm mt-1">{errors.plotArea}</p>}
                </div>
              )}

              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room") && (
                <div>
                  <Label htmlFor="builtUpArea">Built-up Area ({areaUnitLabel}) *</Label>
                  <Input
                    type="number"
                    id="builtUpArea"
                    name="builtUpArea"
                    value={formData.builtUpArea}
                    onChange={handleInputChange}
                    className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {errors.builtUpArea && <p className="text-red-500 text-sm mt-1">{errors.builtUpArea}</p>}
                </div>
              )}

              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room") && (
                <div>
                  <Label htmlFor="carpetArea">Carpet Area ({areaUnitLabel})</Label>
                  <Input
                    type="number"
                    id="carpetArea"
                    name="carpetArea"
                    value={formData.carpetArea}
                    onChange={handleInputChange}
                    className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {errors.carpetArea && <p className="text-red-500 text-sm mt-1">{errors.carpetArea}</p>}
                </div>
              )}

              <div>
                <Label htmlFor="totalProjectArea">Total Project Area (Acres) *</Label>
                <Input
                  type="number"
                  id="totalProjectArea"
                  name="totalProjectArea"
                  value={formData.totalProjectArea}
                  onChange={handleInputChange}
                  placeholder="Enter total project area"
                  className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                {errors.totalProjectArea && <p className="text-red-500 text-sm mt-1">{errors.totalProjectArea}</p>}
              </div>

              <div>
                <Label htmlFor="unitCost">Unit Cost (₹) *</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700 dark:text-gray-300">Rs</span>
                  <Input
                    type="number"
                    id="unitCost"
                    name="unitCost"
                    value={formData.unitCost}
                    onChange={handleInputChange}
                    className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                {errors.unitCost && <p className="text-red-500 text-sm mt-1">{errors.unitCost}</p>}
              </div>

              <div>
                <Label htmlFor="propertyCost">Property Cost *</Label>
                <Input
                  type="number"
                  id="propertyCost"
                  name="propertyCost"
                  value={formData.propertyCost}
                  onChange={handleInputChange}
                  className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                {errors.propertyCost && <p className="text-red-500 text-sm mt-1">{errors.propertyCost}</p>}
              </div>

              <div>
                <Label htmlFor="ownership">Ownership *</Label>
                <div className="flex space-x-4">
                  {ownershipOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelectChange("ownership")(option.value)}
                      className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                        formData.ownership === option.value
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {errors.ownership && <p className="text-red-500 text-sm mt-1">{errors.ownership}</p>}
              </div>

              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room" ||
                formData.propertySubType === "Others") && (
                <div>
                  <Label htmlFor="facilities">Facilities</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {facilitiesOptions.map((facility) => (
                      <label key={facility} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.facilities.includes(facility)}
                          onChange={() => handleFacilityChange(facility)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">{facility}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor={formData.propertySubType === "Plot" ? "plotNumber" : "flatNo"}>
                  {formData.propertySubType === "Plot" ? "Plot No. *" : "Flat No. *"}
                </Label>
                <Input
                  type="text"
                  id={formData.propertySubType === "Plot" ? "plotNumber" : "flatNo"}
                  name={formData.propertySubType === "Plot" ? "plotNumber" : "flatNo"}
                  value={formData.propertySubType === "Plot" ? formData.plotNumber : formData.flatNo}
                  onChange={handleInputChange}
                  placeholder={formData.propertySubType === "Plot" ? "Plot Number" : "Flat Number"}
                  className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                {formData.propertySubType === "Plot" ? (
                  errors.plotNumber && <p className="text-red-500 text-sm mt-1">{errors.plotNumber}</p>
                ) : (
                  errors.flatNo && <p className="text-red-500 text-sm mt-1">{errors.flatNo}</p>
                )}
              </div>

              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Warehouse" ||
                formData.propertySubType === "Others") && (
                <div>
                  <Label htmlFor="zoneType">Zone Type *</Label>
                  <Select
                    options={zoneTypeOptions}
                    placeholder="Select..."
                    onChange={handleSelectChange("zoneType")}
                    value={formData.zoneType}
                    className="dark:bg-dark-900"
                  />
                  {errors.zoneType && <p className="text-red-500 text-sm mt-1">{errors.zoneType}</p>}
                </div>
              )}

              {(formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room" ||
                formData.propertySubType === "Plot" ||
                formData.propertySubType === "Others") && (
                <div>
                  <Label htmlFor="suitable">Suitable *</Label>
                  <Select
                    options={suitableOptions}
                    placeholder="Select..."
                    onChange={handleSelectChange("suitable")}
                    value={formData.suitable}
                    className="dark:bg-dark-900"
                  />
                  {errors.suitable && <p className="text-red-500 text-sm mt-1">{errors.suitable}</p>}
                </div>
              )}

              <div>
                <Label htmlFor="loanFacility">Loan Facility *</Label>
                <div className="flex space-x-4">
                  {["Yes", "No"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelectChange("loanFacility")(option)}
                      className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                        formData.loanFacility === option
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {errors.loanFacility && <p className="text-red-500 text-sm mt-1">{errors.loanFacility}</p>}
              </div>

              {formData.propertySubType === "Plot" && (
                <div>
                  <Label htmlFor="possessionStatus">Possession Status *</Label>
                  <div className="flex space-x-4">
                    {possessionStatusOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelectChange("possessionStatus")(option.value)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.possessionStatus === option.value
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {errors.possessionStatus && <p className="text-red-500 text-sm mt-1">{errors.possessionStatus}</p>}
                </div>
              )}

              {formData.propertySubType === "Plot" && (
                <div>
                  <Label htmlFor="investorProperty">Investor Property *</Label>
                  <div className="flex space-x-4">
                    {["Yes", "No"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelectChange("investorProperty")(option)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.investorProperty === option
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {errors.investorProperty && <p className="text-red-500 text-sm mt-1">{errors.investorProperty}</p>}
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Additional Details</h3>
                <div>
                  <Label htmlFor="facing">Facing</Label>
                  <div className="flex space-x-4">
                    {["East", "West", "South", "North"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelectChange("facing")(option)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.facing === option
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.propertySubType !== "Plot" && (
                  <div>
                    <Label htmlFor="carParking" className="mt-2">Car Parking</Label>
                    <Select
                      options={carParkingOptions}
                      placeholder="Select car parking"
                      onChange={handleSelectChange("carParking")}
                      value={formData.carParking}
                      className="dark:bg-dark-900"
                    />
                  </div>
                )}

                {formData.propertySubType !== "Plot" && (
                  <div>
                    <Label htmlFor="bikeParking" className="mt-2">Bike Parking</Label>
                    <Select
                      options={bikeParkingOptions}
                      placeholder="Select bike parking"
                      onChange={handleSelectChange("bikeParking")}
                      value={formData.bikeParking}
                      className="dark:bg-dark-900"
                    />
                  </div>
                )}

                {formData.propertySubType !== "Plot" && (
                  <div>
                    <Label htmlFor="openParking" className="mt-2">Open Parking</Label>
                    <Select
                      options={openParkingOptions}
                      placeholder="Select open parking"
                      onChange={handleSelectChange("openParking")}
                      value={formData.openParking}
                      className="dark:bg-dark-900"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="aroundProperty" className="mt-4">Around This Property *</Label>
                  <div className="flex space-x-6 my-4 w-full">
                    <Input
                      type="text"
                      placeholder="Place around property"
                      value={placeAroundProperty}
                      onChange={(e) => setPlaceAroundProperty(e.target.value)}
                      className="dark:bg-dark-900 w-[30%] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Input
                      type="text"
                      placeholder="Distance from property"
                      value={distanceFromProperty}
                      onChange={(e) => setDistanceFromProperty(e.target.value)}
                      className="dark:bg-dark-900 w-[30%] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddAroundProperty}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 w-[20%]"
                    >
                      Add
                    </button>
                  </div>
                  {errors.aroundProperty && <p className="text-red-500 text-sm mt-1">{errors.aroundProperty}</p>}
                  {formData.aroundProperty.length > 0 && (
                    <div className="mt-4">
                      <ul className="space-y-2">
                        {formData.aroundProperty.map((entry, index) => (
                          <li
                            key={index}
                            className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                          >
                            <span>{entry.place} - {entry.distance}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  aroundProperty: prev.aroundProperty.filter((_, i) => i !== index),
                                }))
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {(formData.propertySubType === "Office" ||
                  formData.propertySubType === "Show Room" ||
                  formData.propertySubType === "Others") && (
                  <div>
                    <Label htmlFor="pantryRoom">Pantry Room? *</Label>
                    <div className="flex space-x-4">
                      {["Yes", "No"].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleSelectChange("pantryRoom")(option)}
                          className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                            formData.pantryRoom === option
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {errors.pantryRoom && <p className="text-red-500 text-sm mt-1">{errors.pantryRoom}</p>}
                  </div>
                )}

                <div>
                  <Label htmlFor="propertyDescription" className="mt-5">Property Description *</Label>
                  <textarea
                    id="propertyDescription"
                    name="propertyDescription"
                    value={formData.propertyDescription}
                    onChange={handleInputChange}
                    className="w-full p-2 m-1 border rounded-lg dark:bg-dark-900 dark:text-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder="Property Description"
                  />
                  {errors.propertyDescription && <p className="text-red-500 text-sm mt-1">{errors.propertyDescription}</p>}
                </div>
              </div>
            </>
          )}

          <PropertyLocationFields
            formData={{
              city: formData.city,
              propertyName: formData.propertyName,
              locality: formData.locality,
              flatNo: formData.propertySubType !== "Plot" ? formData.flatNo : formData.plotNumber,
              floorNo: formData.floorNo,
              totalFloors: formData.totalFloors,
            }}
            errors={{
              city: errors.city,
              propertyName: errors.propertyName,
              locality: errors.locality,
              flatNo: formData.propertySubType !== "Plot" ? errors.flatNo : errors.plotNumber,
              floorNo: errors.floorNo,
              totalFloors: errors.totalFloors,
            }}
            handleInputChange={handleInputChange}
            isPlot={formData.propertySubType === "Plot"}
          />

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Upload Media</h3>
            <MediaUploadSection
              photos={formData.photos}
              setPhotos={(photos) => setFormData((prev) => ({ ...prev, photos }))}
              video={formData.video}
              setVideo={(video) => setFormData((prev) => ({ ...prev, video }))}
              floorPlan={formData.floorPlan}
              setFloorPlan={(floorPlan) => setFormData((prev) => ({ ...prev, floorPlan }))}
              featuredImageIndex={formData.featuredImageIndex}
              setFeaturedImageIndex={(index) => setFormData((prev) => ({ ...prev, featuredImageIndex: index }))}
              photoError={errors.photos}
              videoError={errors.video}
              floorPlanError={errors.floorPlan}
              featuredImageError={errors.featuredImage}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors duration-200"
            >
              Submit
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default CommercialBuyEdit;