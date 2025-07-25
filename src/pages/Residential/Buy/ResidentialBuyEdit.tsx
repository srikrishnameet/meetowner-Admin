import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import ComponentCard from "../../../components/common/ComponentCard";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import DatePicker from "../../../components/form/date-picker";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PropertyLocationFields from "../components/propertyLocationFields";

import { updateListing } from "../../../store/slices/listings";
import { AppDispatch } from "../../../store/store";
import MediaUploadSection from "../components/MediaUploadSection";
import AroundThisProperty from "../components/AroundThisProperty";



interface ResidentialBuyFormData {
  propertyType: "Residential" | "Commercial";
  lookingTo: "Sell" | "Rent" | "PG-Co-living";
  transactionType: "New" | "Resale";
  location: string;
  propertySubType: "Apartment" | "Independent House" | "Independent Villa" | "Plot" | "Land";
  constructionStatus: "Ready to move" | "Under Construction";
  possessionEnd?: string;
  bhk: "1BHK" | "2BHK" | "3BHK" | "4BHK" | "4+BHK";
  bedroom: "1" | "2" | "3" | "4" | "4+";
  balcony: "1" | "2" | "3" | "4" | "4+";
  furnishType: "Fully" | "Semi" | "Unfurnished";
  ageOfProperty: "5" | "10" | "11"; // Updated to match API values
  areaUnits: "Sq.ft" | "Sq.yd" | "Acres";
  builtUpArea: string;
  carpetArea: string;
  plotArea: string;
  lengthArea: string;
  widthArea: string;
  totalProjectArea: string;
  unitCost: string;
  pentHouse: "Yes" | "No";
  propertyCost: string;
  possessionStatus: "Immediate" | "Future";
  facilities: { [key: string]: boolean }; 
  investorProperty: "Yes" | "No";
  loanFacility: "Yes" | "No";
  facing: "East" | "West" | "South" | "North" | "";
  carParking: "0" | "1" | "2" | "3" | "4+";
  bikeParking: "0" | "1" | "2" | "3" | "4+";
  openParking: "0" | "1" | "2" | "3" | "4+";
  servantRoom: "Yes" | "No";
  propertyDescription: string;
  city: string;
  propertyName: string;
  locality: string;
  flatNo: string;
  plotNumber: string;
  floorNo: string;
  totalFloors: string;

}

interface SelectOption {
  value: string;
  label: string;
}

const ResidentialBuyEdit: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const property = location.state?.property;

  const defaultFacilities = {
    Lift: false,
    CCTV: false,
    Gym: false,
    Garden: false,
    "Club House": false,
    Sports: false,
    "Swimming Pool": false,
    Intercom: false,
    "Power Backup": false,
    "Gated Community": false,
    "Regular Water": false,
    "Community Hall": false,
    "Pet Allowed": false,
    "Entry / Exit": false,
    "Outdoor Fitness Station": false,
    "Half Basket Ball Court": false,
    Gazebo: false,
    "Badminton Court": false,
    "Children Play Area": false,
    "Ample Greenery": false,
    "Water Harvesting Pit": false,
    "Water Softner": false,
    "Solar Fencing": false,
    "Security Cabin": false,
    Lawn: false,
    "Transformer Yard": false,
    Amphitheatre: false,
    "Lawn with Stepping Stones": false,
    None: false,
  };

  const transformToUIValue = (value: string | number | undefined): "0" | "1" | "2" | "3" | "4+" => {
    const numValue = Number(value);
    if (isNaN(numValue)) return "0"; // Handle undefined or invalid values
    return numValue >= 5 ? "4+" : String(value) as "0" | "1" | "2" | "3" | "4+";
  };
  const [originalData, setOriginalData] = useState<any>(property || {});
  const transformParkingValue = (value: string | number | undefined): "0" | "1" | "2" | "3" | "4+" => {
    const stringValue = String(value); // Convert to string for consistent comparison
    return stringValue === "5" ? "4+" : (stringValue as "0" | "1" | "2" | "3" | "4+");
  };

  const [formData, setFormData] = useState<ResidentialBuyFormData>(() => {
    if (property) {
      const possessionEndDate = property.under_construction
        ? new Date(property.under_construction).toISOString().split("T")[0]
        : "";
      const facilitiesString = property.facilities || "";
      const selectedFacilities = facilitiesString
        .split(", ")
        .map((item: string) => item.trim())
        .filter(Boolean);
      const updatedFacilities = { ...defaultFacilities };
      selectedFacilities.forEach((facility: PropertyKey) => {
        if (updatedFacilities.hasOwnProperty(facility)) {
          updatedFacilities[facility as keyof typeof defaultFacilities] = true;
        }
      });

      return {
        propertyType: property.property_in || "Residential",
        lookingTo: property.property_for || "Sell",
        transactionType: property.transaction_type || "New",
        location: property.google_address || "",
        propertySubType: property.sub_type || "Apartment",
        constructionStatus: property.occupancy === "Under Construction" ? "Under Construction" : "Ready to move",
        possessionEnd: possessionEndDate,
        bhk: property.bedrooms ? `${property.bedrooms}BHK` : "1BHK",
        bedroom: transformToUIValue(property.bathroom),
        balcony:  transformToUIValue(property.balconies),
        furnishType: property.furnished_status || "Fully",
        ageOfProperty: property.property_age ? String(property.property_age) as "5" | "10" | "11" : "5",
        areaUnits: property.area_units || "Sq.yd",
        builtUpArea: property.builtup_area || "",
        carpetArea: property.carpet_area || "",
        plotArea: property.plot_area || "",
        lengthArea: property.length_area || "",
        widthArea: property.width_area || "",
        totalProjectArea: property.total_project_area || "",
        unitCost: property.builtup_unit || "6800.00",
        pentHouse: property.pent_house || "No",
        propertyCost: property.property_cost || "",
        possessionStatus: property.possession_status || "Immediate",
        facilities: updatedFacilities,
        investorProperty: property.investor_property || "No",
        loanFacility: property.loan_facility || "No",
        facing: property.facing || "",
        carParking: transformParkingValue(property.car_parking), 
        bikeParking: transformParkingValue(property.bike_parking), 
        openParking: transformParkingValue(property.open_parking), 
        servantRoom: property.servant_room || "No",
        propertyDescription: property.description || "",
        city: property.city_id || "",
        propertyName: property.property_name || "",
        locality: property.location_id || "",
        flatNo: property.unit_flat_house_no || "",
        plotNumber: property.plot_number || "",
        floorNo: property.floors || "",
        totalFloors: property.total_floors || "",
       
      };
    }
    return {
      propertyType: "Residential",
      lookingTo: "Sell",
      transactionType: "New",
      location: "",
      propertySubType: "Plot",
      constructionStatus: "Ready to move",
      possessionEnd: "",
      bhk: "1BHK",
      bedroom: "1",
      balcony: "1",
      furnishType: "Fully",
      ageOfProperty: "5",
      areaUnits: "Sq.yd",
      builtUpArea: "",
      carpetArea: "",
      plotArea: "",
      lengthArea: "",
      widthArea: "",
      totalProjectArea: "",
      unitCost: "6800.00",
      pentHouse: "No",
      propertyCost: "",
      possessionStatus: "Immediate",
      facilities: { ...defaultFacilities },
      investorProperty: "No",
      loanFacility: "No",
      facing: "",
      carParking: "0",
      bikeParking: "0",
      openParking: "0",
      servantRoom: "No",
      propertyDescription: "",
      city: "",
      propertyName: "",
      locality: "",
      flatNo: "",
      plotNumber: "",
      floorNo: "",
      totalFloors: "",
    
    };
  });


  const [errors, setErrors] = useState({
    propertyType: "",
    lookingTo: "",
    propertySubType: "",
    constructionStatus: "",
    possessionEnd: "",
    bhk: "",
    bedroom: "",
    balcony: "",
    furnishType: "",
    builtUpArea: "",
    plotArea: "",
    lengthArea: "",
    widthArea: "",
    totalProjectArea: "",
    unitCost: "",
    propertyCost: "",
    investorProperty: "",
    loanFacility: "",

    servantRoom: "",
    propertyDescription: "",
    city: "",
    propertyName: "",
    locality: "",
    flatNo: "",
    plotNumber: "",
    floorNo: "",
    totalFloors: "",
  
  });

  
 
  const propertyTypeOptions: SelectOption[] = [
    { value: "Residential", label: "Residential" },
    { value: "Commercial", label: "Commercial" },
  ];
  const lookingToOptions: SelectOption[] = [
    { value: "Sell", label: "Sell" },
    { value: "Rent", label: "Rent" },
    { value: "PG-Co-living", label: "PG-Co-living" },
  ];
  const transactionTypeOptions: SelectOption[] = [
    { value: "New", label: "New" },
    { value: "Resale", label: "Resale" },
  ];
  const propertySubTypeOptions: SelectOption[] = [
    { value: "Apartment", label: "Apartment" },
    { value: "Independent House", label: "Independent House" },
    { value: "Independent Villa", label: "Independent Villa" },
    { value: "Plot", label: "Plot" },
    { value: "Land", label: "Land" },
  ];
  const constructionStatusOptions: SelectOption[] = [
    { value: "Ready to move", label: "Ready to move" },
    { value: "Under Construction", label: "Under Construction" },
  ];
  const bhkOptions: SelectOption[] = [
    { value: "1BHK", label: "1BHK" },
    { value: "2BHK", label: "2BHK" },
    { value: "3BHK", label: "3BHK" },
    { value: "4BHK", label: "4BHK" },
    { value: "4+BHK", label: "4+BHK" },
  ];
  const bedroomOptions: SelectOption[] = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "4+", label: "4+" },
  ];
  const balconyOptions: SelectOption[] = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "4+", label: "4+" },
  ];
  const furnishTypeOptions: SelectOption[] = [
    { value: "Fully", label: "Fully" },
    { value: "Semi", label: "Semi" },
    { value: "Unfurnished", label: "Unfurnished" },
  ];
  const ageOfPropertyOptions: SelectOption[] = [
    { value: "5", label: "0-5" }, 
    { value: "10", label: "5-10" }, 
    { value: "11", label: "Above 10" },
  ];
  const areaUnitsOptions: SelectOption[] = [
    { value: "Sq.ft", label: "Sq.ft" },
    { value: "Sq.yd", label: "Sq.yd" },
    { value: "Acres", label: "Acres" },
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
    "Lift",
    "CCTV",
    "Gym",
    "Garden",
    "Club House",
    "Sports",
    "Swimming Pool",
    "Intercom",
    "Power Backup",
    "Gated Community",
    "Regular Water",
    "Community Hall",
    "Pet Allowed",
    "Entry / Exit",
    "Outdoor Fitness Station",
    "Half Basket Ball Court",
    "Gazebo",
    "Badminton Court",
    "Children Play Area",
    "Ample Greenery",
    "Water Harvesting Pit",
    "Water Softner",
    "Solar Fencing",
    "Security Cabin",
    "Lawn",
    "Transformer Yard",
    "Amphitheatre",
    "Lawn with Stepping Stones",
    "None",
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
    if (name === "flatNo" && formData.propertySubType !== "Plot") {
      setErrors((prev) => ({ ...prev, flatNo: !value ? "Flat number is required" : "" }));
    }
    if (name === "plotNumber" && formData.propertySubType === "Plot") {
      setErrors((prev) => ({ ...prev, plotNumber: !value ? "Plot number is required" : "" }));
    }
    if (name === "floorNo" && formData.propertySubType !== "Plot") {
      setErrors((prev) => ({ ...prev, floorNo: !value ? "Floor number is required" : "" }));
    }
    if (name === "totalFloors" && formData.propertySubType !== "Plot") {
      setErrors((prev) => ({ ...prev, totalFloors: !value ? "Total floors is required" : "" }));
    }
    if (name === "builtUpArea" && formData.propertySubType !== "Plot") {
      setErrors((prev) => ({ ...prev, builtUpArea: !value ? "Built-up area is required" : "" }));
    }
    if (name === "plotArea" && formData.propertySubType === "Plot") {
      setErrors((prev) => ({ ...prev, plotArea: !value ? "Plot area is required" : "" }));
    }
    if (name === "lengthArea" && formData.propertySubType === "Plot") {
      setErrors((prev) => ({ ...prev, lengthArea: !value ? "Length area is required" : "" }));
    }
    if (name === "widthArea" && formData.propertySubType === "Plot") {
      setErrors((prev) => ({ ...prev, widthArea: !value ? "Width area is required" : "" }));
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
        propertyCost:
          propertyCostValue < 100000 || propertyCostValue > 3000000000
            ? "Property cost should be between 1 lakh to 300 cr"
            : "",
      }));
    }
    if (name === "propertyDescription") {
      setErrors((prev) => ({ ...prev, propertyDescription: !value ? "Property description is required" : "" }));
    }
  };

  const handleSelectChange = (name: keyof ResidentialBuyFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFacilityChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = event.target;
    if (id === "None") {
      setFormData((prev) => {
        const updatedFacilities = { ...prev.facilities };
        for (const key in updatedFacilities) {
          updatedFacilities[key] = false;
        }
        updatedFacilities[id] = checked;
        return { ...prev, facilities: updatedFacilities };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        facilities: {
          ...prev.facilities,
          None: false, 
          [id]: checked,
        },
      }));
    }
  };

  

  const handleDateChange = (selectedDates: Date[]) => {
    const dateObj = selectedDates[0] ;
    let date = "";
    if (dateObj){
      const year = dateObj.getFullYear();
      const month = String (dateObj.getMonth()+1).padStart(2,"0");
      const day = String(dateObj.getDate()).padStart(2,"0");
      date = `${year}-${month}-${day}`;
    }
    setFormData((prev) => ({ ...prev, possessionEnd: date }));
    setErrors((prev) => ({ ...prev, possessionEnd: !date ? "Possession end date is required" : "" }));
  };

  // Function to get changed fields
  const getChangedFields = () => {
    const changedFields: Partial<any> = {};
  
    const fieldMappings: {
      [key in keyof ResidentialBuyFormData]?: {
        apiField: string;
        transform?: (value: any) => any;
        applicableTo: string[];
      };
    } = {
      propertyType: { apiField: "property_in", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      lookingTo: { apiField: "property_for", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      transactionType: { apiField: "transaction_type", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      location: { apiField: "google_address", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      propertySubType: { apiField: "sub_type", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      constructionStatus: { apiField: "occupancy", applicableTo: ["Apartment", "Independent House", "Independent Villa"] },
      possessionEnd: { apiField: "under_construction", applicableTo: ["Apartment", "Independent House", "Independent Villa"] },
      bhk: {
        apiField: "bedrooms",
        transform: (value: string) => value.replace("BHK", ""),
        applicableTo: ["Apartment", "Independent House", "Independent Villa"],
      },
      bedroom: {
        apiField: "bathroom",
        transform: (value: string) => (value === "4+" ? 5 : parseInt(value)),
        applicableTo: ["Apartment"],
      },
      balcony: {
        apiField: "balconies",
        transform: (value: string) => (value === "4+" ? 5 : parseInt(value)),
        applicableTo: ["Apartment"],
      },
      furnishType: { apiField: "furnished_status", applicableTo: ["Apartment", "Independent House", "Independent Villa"] },
      ageOfProperty: { apiField: "property_age", applicableTo: ["Apartment", "Independent House", "Independent Villa"] },
      areaUnits: { apiField: "area_units", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      builtUpArea: { apiField: "builtup_area", applicableTo: ["Apartment", "Independent House", "Independent Villa"] },
      carpetArea: { apiField: "carpet_area", applicableTo: ["Apartment", "Independent House", "Independent Villa"] },
      plotArea: { apiField: "plot_area", applicableTo: ["Plot"] },
      lengthArea: { apiField: "length_area", applicableTo: ["Plot"] },
      widthArea: { apiField: "width_area", applicableTo: ["Plot"] },
      totalProjectArea: { apiField: "total_project_area", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      unitCost: { 
        apiField: "builtup_unit", 
        transform: (value: string) => value, // Keep as string for "6800.00"
        applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] 
      },
      pentHouse: { apiField: "pent_house", applicableTo: ["Independent House", "Independent Villa"] },
      propertyCost: { apiField: "property_cost", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      possessionStatus: { apiField: "possession_status", applicableTo: ["Plot", "Land"] },
      facilities: {
        apiField: "facilities",
        transform: (value: { [key: string]: boolean }) =>
          Object.keys(value)
            .filter((key) => value[key])
            .join(", ") || null,
        applicableTo: ["Apartment", "Independent House", "Independent Villa"],
      },
      investorProperty: { apiField: "investor_property", applicableTo: ["Apartment", "Independent Villa", "Plot"] },
      loanFacility: { apiField: "loan_facility", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      facing: { apiField: "facing", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      carParking: {
        apiField: "car_parking",
        transform: (value: string | null | undefined) => (value === "4+" ? 5 : value || "0"), 
        applicableTo: ["Apartment", "Independent House", "Independent Villa"],
      },
      bikeParking: {
        apiField: "bike_parking",
        transform: (value: string | null | undefined) => (value === "4+" ? 5 : value || "0"), 
        applicableTo: ["Apartment", "Independent House", "Independent Villa"],
      },
      openParking: {
        apiField: "open_parking",
        transform: (value: string | null | undefined) => (value === "4+" ? 5 : value || "0"), 
        applicableTo: ["Apartment", "Independent House", "Independent Villa"],
      },
      servantRoom: { apiField: "servant_room", applicableTo: ["Apartment", "Independent House", "Independent Villa"] },
      propertyDescription: { apiField: "description", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      city: { apiField: "city_id", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      propertyName: { apiField: "property_name", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      locality: { apiField: "location_id", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      flatNo: { apiField: "unit_flat_house_no", applicableTo: ["Apartment", "Independent House", "Independent Villa"] },
      plotNumber: { apiField: "plot_number", applicableTo: ["Plot"] },
      floorNo: { apiField: "floors", applicableTo: ["Apartment", "Independent House", "Independent Villa"] },
      totalFloors: { apiField: "total_floors", applicableTo: ["Apartment", "Independent House", "Independent Villa"] },
    };
  
    Object.keys(formData).forEach((key) => {
      const mapping = fieldMappings[key as keyof ResidentialBuyFormData];
      if (!mapping) return;
  
      const { apiField, transform, applicableTo } = mapping;
  
      if (!applicableTo.includes(formData.propertySubType)) return;
  
      const originalValue = originalData[apiField];
      let newValue = formData[key as keyof ResidentialBuyFormData];
  
      if (transform) {
        newValue = transform(newValue);
      }
      if (key === "facilities") {
        const originalFacilities = originalValue ? String(originalValue).split(", ").filter(Boolean) : [];
        const newFacilities = newValue ? String(newValue).split(", ").filter(Boolean) : [];
        if (JSON.stringify(originalFacilities.sort()) !== JSON.stringify(newFacilities.sort())) {
          changedFields[apiField] = newValue;
        }
      } else {
        const original = originalValue === null || originalValue === undefined ? "" : String(originalValue);
        const current = newValue === null || newValue === undefined ? "" : String(newValue);
  
        if (original !== current) {
          changedFields[apiField] = newValue;
        }
      }
    });
  
    return changedFields;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: any = {};
    if (!formData.propertyType) newErrors.propertyType = "Property type is required";
    if (!formData.lookingTo) newErrors.lookingTo = "Looking to is required";
    if (!formData.propertySubType) newErrors.propertySubType = "Property sub type is required";
    if (
      (formData.propertySubType === "Apartment" ||
        formData.propertySubType === "Independent House" ||
        formData.propertySubType === "Independent Villa") &&
      !formData.constructionStatus
    ) {
      newErrors.constructionStatus = "Construction status is required";
    }
    if (
      formData.constructionStatus === "Under Construction" &&
      (formData.propertySubType === "Apartment" ||
        formData.propertySubType === "Independent House" ||
        formData.propertySubType === "Independent Villa") &&
      !formData.possessionEnd
    ) {
      newErrors.possessionEnd = "Possession end date is required";
    }
    if (
      (formData.propertySubType === "Apartment" ||
        formData.propertySubType === "Independent House" ||
        formData.propertySubType === "Independent Villa") &&
      !formData.bhk
    ) {
      newErrors.bhk = "BHK is required";
    }
    if (formData.propertySubType === "Apartment" && !formData.bedroom) {
      newErrors.bedroom = "Bathroom is required";
    }
    if (formData.propertySubType === "Apartment" && !formData.balcony) {
      newErrors.balcony = "Balcony is required";
    }
    if (
      (formData.propertySubType === "Apartment" ||
        formData.propertySubType === "Independent House" ||
        formData.propertySubType === "Independent Villa") &&
      !formData.furnishType
    ) {
      newErrors.furnishType = "Furnish type is required";
    }
    if (
      formData.propertySubType !== "Plot" &&
      formData.propertySubType !== "Land" &&
      !formData.builtUpArea
    ) {
      newErrors.builtUpArea = "Built-up area is required";
    }
    if (formData.propertySubType === "Plot" && !formData.plotArea) {
      newErrors.plotArea = "Plot area is required";
    }
    if (formData.propertySubType === "Plot" && !formData.lengthArea) {
      newErrors.lengthArea = "Length area is required";
    }
    if (formData.propertySubType === "Plot" && !formData.widthArea) {
      newErrors.widthArea = "Width area is required";
    }
    if (!formData.totalProjectArea) newErrors.totalProjectArea = "Total project area is required";
    if (!formData.unitCost) newErrors.unitCost = "Unit cost is required";
    if (!formData.propertyCost) newErrors.propertyCost = "Property cost is required";
    if (
      (formData.propertySubType === "Apartment" ||
        formData.propertySubType === "Independent Villa" ||
        formData.propertySubType === "Plot") &&
      !formData.investorProperty
    ) {
      newErrors.investorProperty = "Investor property is required";
    }
    if (
      (formData.propertySubType === "Apartment" ||
        formData.propertySubType === "Independent House" ||
        formData.propertySubType === "Independent Villa" ||
        formData.propertySubType === "Plot" ||
        formData.propertySubType === "Land") &&
      !formData.loanFacility
    ) {
      newErrors.loanFacility = "Loan facility is required";
    }
    if (
      (formData.propertySubType === "Apartment" ||
        formData.propertySubType === "Independent House" ||
        formData.propertySubType === "Independent Villa") &&
      !formData.servantRoom
    ) {
      newErrors.servantRoom = "Servant room is required";
    }
    if (!formData.propertyDescription) newErrors.propertyDescription = "Property description is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.propertyName) newErrors.propertyName = "Property name is required";
    if (!formData.locality) newErrors.locality = "Locality is required";
    if (formData.propertySubType !== "Plot" && !formData.flatNo) newErrors.flatNo = "Flat number is required";
    if (formData.propertySubType === "Plot" && !formData.plotNumber) newErrors.plotNumber = "Plot number is required";
    if (formData.propertySubType !== "Plot" && !formData.floorNo) newErrors.floorNo = "Floor number is required";
    if (formData.propertySubType !== "Plot" && !formData.totalFloors) newErrors.totalFloors = "Total floors is required";
    

    setErrors((prev) => ({ ...prev, ...newErrors }));

  if (Object.values(newErrors).every((error) => !error)) {
    const changedFields = getChangedFields();
    if (Object.keys(changedFields).length > 0) {
      const confirmSubmit = window.confirm("Are you sure you want to save changes and go back?");
      if (!confirmSubmit) return; // Cancel submission if user clicks "Cancel"

      const payload = {
        unique_property_id: property.unique_property_id,
        updates: changedFields,
      };


      dispatch(updateListing(payload))
        .unwrap()
        .then((response) => {
          navigate(-1);
        })
        .catch((err) => {
          console.error("Update failed:", err);
        });
    } else {
      navigate(-1);
    }
  }
  };

  useEffect(() => {
    if (property) {
      setOriginalData(property);
    }
  }, [property]);

  const areaUnitLabel = formData.areaUnits || "Sq.yd";
  const shouldRenderFields =
    formData.propertyType === "Residential" &&
    formData.lookingTo === "Sell" &&
    (formData.transactionType === "New" || formData.transactionType === "Resale");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-2 sm:px-6 lg:px-8">
      <PageBreadcrumb pageTitle="Residential Buy Edit" />
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
                      ? "bg-[#1D3A76] text-white border-blue-600"
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
                      ? "bg-[#1D3A76] text-white border-blue-600"
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
                      ? "bg-[#1D3A76] text-white border-blue-600"
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
              {(formData.propertySubType === "Apartment" ||
                formData.propertySubType === "Independent House" ||
                formData.propertySubType === "Independent Villa") && (
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
                            ? "bg-[#1D3A76] text-white border-blue-600"
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

              {(formData.propertySubType === "Apartment" ||
                formData.propertySubType === "Independent House" ||
                formData.propertySubType === "Independent Villa" ||
                formData.propertySubType === "Plot") && (
                <>
                  {formData.constructionStatus === "Ready to move" && (
                    <div>
                      <Label htmlFor="ageOfProperty">Age of Property</Label>
                      <Select
                        options={ageOfPropertyOptions}
                        placeholder="Select age of property"
                        onChange={handleSelectChange("ageOfProperty")}
                        value={formData.ageOfProperty}
                        className="dark:bg-dark-900"
                      />
                    </div>
                  )}
                  {formData.constructionStatus === "Under Construction" && (
                    <div>
                      <Label htmlFor="possessionEnd">Possession End *</Label>
                      <DatePicker
                        id="possessionEnd"
                        mode="single"
                        onChange={handleDateChange}
                        defaultDate={
                          formData.possessionEnd
                            ? (() => {
                                const defaultDate = new Date(formData.possessionEnd);
                                return defaultDate;
                              })()
                            : undefined
                        }
                        placeholder="Select possession end date"
                        label=""
                      />
                      {errors.possessionEnd && <p className="text-red-500 text-sm mt-1">{errors.possessionEnd}</p>}
                    </div>
                  )}
                </>
              )}

              {(formData.propertySubType === "Apartment" ||
                formData.propertySubType === "Independent House" ||
                formData.propertySubType === "Independent Villa") && (
                <div>
                  <Label htmlFor="bhk">BHK *</Label>
                  <div className="flex space-x-4">
                    {bhkOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelectChange("bhk")(option.value)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.bhk === option.value
                            ? "bg-[#1D3A76] text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {errors.bhk && <p className="text-red-500 text-sm mt-1">{errors.bhk}</p>}
                </div>
              )}

              {formData.propertySubType === "Apartment" && (
                <div>
                  <Label htmlFor="bedroom">Bathroom *</Label>
                  <div className="flex space-x-4">
                    {bedroomOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelectChange("bedroom")(option.value)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.bedroom === option.value
                            ? "bg-[#1D3A76] text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {errors.bedroom && <p className="text-red-500 text-sm mt-1">{errors.bedroom}</p>}
                </div>
              )}

              {formData.propertySubType === "Apartment" && (
                <div>
                  <Label htmlFor="balcony">Balcony *</Label>
                  <div className="flex space-x-4">
                    {balconyOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelectChange("balcony")(option.value)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.balcony === option.value
                            ? "bg-[#1D3A76] text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {errors.balcony && <p className="text-red-500 text-sm mt-1">{errors.balcony}</p>}
                </div>
              )}

              {(formData.propertySubType === "Apartment" ||
                formData.propertySubType === "Independent House" ||
                formData.propertySubType === "Independent Villa") && (
                <div>
                  <Label htmlFor="furnishType">Furnish Type *</Label>
                  <div className="flex space-x-4">
                    {furnishTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelectChange("furnishType")(option.value)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.furnishType === option.value
                            ? "bg-[#1D3A76] text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {errors.furnishType && <p className="text-red-500 text-sm mt-1">{errors.furnishType}</p>}
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

              {(formData.propertySubType === "Apartment" ||
                formData.propertySubType === "Independent House" ||
                formData.propertySubType === "Independent Villa") && (
                <>
                  <div>
                    <Label htmlFor="builtUpArea">Built-up Area ({areaUnitLabel}) *</Label>
                    <Input
                      type="number"
                      id="builtUpArea"
                      name="builtUpArea"
                      value={formData.builtUpArea}
                      onChange={handleInputChange}
                      className="dark:bg-dark-900"
                    />
                    {errors.builtUpArea && <p className="text-red-500 text-sm mt-1">{errors.builtUpArea}</p>}
                  </div>

                  <div>
                    <Label htmlFor="carpetArea">Carpet Area ({areaUnitLabel})</Label>
                    <Input
                      type="number"
                      id="carpetArea"
                      name="carpetArea"
                      value={formData.carpetArea}
                      onChange={handleInputChange}
                      className="dark:bg-dark-900"
                    />
                  </div>
                </>
              )}

              {formData.propertySubType === "Plot" && (
                <>
                  <div>
                    <Label htmlFor="plotArea">Plot Area ({areaUnitLabel}) *</Label>
                    <Input
                      type="number"
                      id="plotArea"
                      name="plotArea"
                      value={formData.plotArea}
                      onChange={handleInputChange}
                      className="dark:bg-dark-900"
                    />
                    {errors.plotArea && <p className="text-red-500 text-sm mt-1">{errors.plotArea}</p>}
                  </div>

                  <div>
                    <Label htmlFor="lengthArea">Length Area (meters) *</Label>
                    <Input
                      type="number"
                      id="lengthArea"
                      name="lengthArea"
                      value={formData.lengthArea}
                      onChange={handleInputChange}
                      className="dark:bg-dark-900"
                    />
                    {errors.lengthArea && <p className="text-red-500 text-sm mt-1">{errors.lengthArea}</p>}
                  </div>

                  <div>
                    <Label htmlFor="widthArea">Width Area (meters) *</Label>
                    <Input
                      type="number"
                      id="widthArea"
                      name="widthArea"
                      value={formData.widthArea}
                      onChange={handleInputChange}
                      className="dark:bg-dark-900"
                    />
                    {errors.widthArea && <p className="text-red-500 text-sm mt-1">{errors.widthArea}</p>}
                  </div>
                </>
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
                  className="dark:bg-dark-900"
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

              {(formData.propertySubType === "Independent House" ||
                formData.propertySubType === "Independent Villa") && (
                <div>
                  <Label htmlFor="pentHouse">Pent House</Label>
                  <div className="flex space-x-4">
                    {["Yes", "No"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelectChange("pentHouse")(option)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.pentHouse === option
                            ? "bg-[#1D3A76] text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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

              {(formData.propertySubType === "Plot" || formData.propertySubType === "Land") && (
                <div>
                  <Label htmlFor="possessionStatus">Possession Status</Label>
                  <div className="flex space-x-4">
                    {["Immediate", "Future"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelectChange("possessionStatus")(option)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.possessionStatus === option
                            ? "bg-[#1D3A76] text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

                {(formData.propertySubType === "Apartment" ||
                  formData.propertySubType === "Independent House" ||
                  formData.propertySubType === "Independent Villa") && (
                  <div>
                    <Label htmlFor="facilities">Facilities</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {facilitiesOptions.map((facility) => (
                        <label key={facility} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={facility} // Add id for better accessibility
                            checked={formData.facilities[facility]} // Check the boolean value
                            onChange={handleFacilityChange} // Use the event-based handler
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-700 dark:text-gray-300">{facility}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

              {(formData.propertySubType === "Apartment" ||
                formData.propertySubType === "Independent Villa" ||
                formData.propertySubType === "Plot") && (
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
                            ? "bg-[#1D3A76] text-white border-blue-600"
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

              {(formData.propertySubType === "Apartment" ||
                formData.propertySubType === "Independent House" ||
                formData.propertySubType === "Independent Villa" ||
                formData.propertySubType === "Plot" ||
                formData.propertySubType === "Land") && (
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
                            ? "bg-[#1D3A76] text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {errors.loanFacility && <p className="text-red-500 text-sm mt-1">{errors.loanFacility}</p>}
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
                            ? "bg-[#1D3A76] text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {(formData.propertySubType === "Apartment" ||
                  formData.propertySubType === "Independent House" ||
                  formData.propertySubType === "Independent Villa") && (
                  <>
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
                  </>
                )}

               <div className="py-5">

                 
                  <AroundThisProperty  unique_property_id={property.unique_property_id} />
                </div>

                {(formData.propertySubType === "Apartment" ||
                  formData.propertySubType === "Independent House" ||
                  formData.propertySubType === "Independent Villa") && (
                  <div>
                    <Label htmlFor="servantRoom">Servant Room? *</Label>
                    <div className="flex space-x-4">
                      {["Yes", "No"].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleSelectChange("servantRoom")(option)}
                          className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                            formData.servantRoom === option
                              ? "bg-[#1D3A76] text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {errors.servantRoom && <p className="text-red-500 text-sm mt-1">{errors.servantRoom}</p>}
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
                  {errors.propertyDescription && (
                    <p className="text-red-500 text-sm mt-1">{errors.propertyDescription}</p>
                  )}
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
            isPlot={formData.propertySubType === "Plot" || formData.propertySubType === "Land"}
          />

          <div>
           
           <MediaUploadSection
              unique_property_id={property.unique_property_id} />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-[#1D3A76] text-white rounded-lg hover:bg-brand-600 transition-colors duration-200"
            >
              Submit
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default ResidentialBuyEdit;