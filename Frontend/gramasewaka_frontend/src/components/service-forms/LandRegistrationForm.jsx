import { useState, useEffect } from 'react';
import ServiceFormBase from './ServiceFormBase';

const LandRegistrationForm = ({ serviceName, onFormDataChange, onSubmit, onCancel, isSubmitting }) => {  const [formData, setFormData] = useState({
    propertyType: '',
    landExtent: '',
    landExtentUnit: 'perches',
    propertyLocation: '',
    district: '',
    divisionalSecretariat: '',
    gramaNiladhari: '',
    lotNumber: '',
    planNumber: '',
    deedNumber: '',
    previousOwner: '',
    currentOwner: '',
    currentOwnerNIC: '',
    purchaseDate: '',
    purchaseValue: '',
    boundaries: {
      north: '',
      south: '',
      east: '',
      west: ''
    },
    registrationType: '',
    purposeOfRegistration: '',
    mortgageDetails: '',
    isMortgaged: 'no'
  });

  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange(formData);
    }
  }, [formData, onFormDataChange]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('boundaries.')) {
      const boundaryField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        boundaries: {
          ...prev.boundaries,
          [boundaryField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const formFields = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Property Information */}
      <div className="md:col-span-2">
        <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">Property Information</h4>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Property Type <span className="text-red-500">*</span>
        </label>
        <select
          name="propertyType"
          value={formData.propertyType}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">Select property type</option>
          <option value="residential_land">Residential Land</option>
          <option value="commercial_land">Commercial Land</option>
          <option value="agricultural_land">Agricultural Land</option>
          <option value="industrial_land">Industrial Land</option>
          <option value="paddy_field">Paddy Field</option>
          <option value="coconut_land">Coconut Land</option>
          <option value="rubber_land">Rubber Land</option>
          <option value="tea_land">Tea Land</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Land Extent <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-2">
          <input
            type="number"
            step="0.01"
            name="landExtent"
            value={formData.landExtent}
            onChange={handleInputChange}
            required
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Area"
          />
          <select
            name="landExtentUnit"
            value={formData.landExtentUnit}
            onChange={handleInputChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="perches">Perches</option>
            <option value="acres">Acres</option>
            <option value="hectares">Hectares</option>
            <option value="square_feet">Square Feet</option>
            <option value="square_meters">Square Meters</option>
          </select>
        </div>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Property Location <span className="text-red-500">*</span>
        </label>
        <textarea
          name="propertyLocation"
          value={formData.propertyLocation}
          onChange={handleInputChange}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Complete address of the property"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          District <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="district"
          value={formData.district}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="District name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Divisional Secretariat <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="divisionalSecretariat"
          value={formData.divisionalSecretariat}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="DS Division"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Grama Niladhari Division <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="gramaNiladhari"
          value={formData.gramaNiladhari}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="GN Division"
        />
      </div>

      {/* Survey Details */}
      <div className="md:col-span-2">
        <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2 mt-6">Survey Details</h4>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lot Number
        </label>
        <input
          type="text"
          name="lotNumber"
          value={formData.lotNumber}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Survey lot number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Plan Number
        </label>
        <input
          type="text"
          name="planNumber"
          value={formData.planNumber}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Survey plan number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Deed Number
        </label>
        <input
          type="text"
          name="deedNumber"
          value={formData.deedNumber}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Original deed number (if available)"
        />
      </div>

      {/* Ownership Details */}
      <div className="md:col-span-2">
        <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2 mt-6">Ownership Details</h4>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Previous Owner
        </label>
        <input
          type="text"
          name="previousOwner"
          value={formData.previousOwner}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Name of previous owner"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Current Owner <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="currentOwner"
          value={formData.currentOwner}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Name of current owner"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Current Owner NIC <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="currentOwnerNIC"
          value={formData.currentOwnerNIC}
          onChange={handleInputChange}
          required
          pattern="[0-9]{9}[vVxX]|[0-9]{12}"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="e.g., 123456789V or 200012345678"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Purchase Date
        </label>
        <input
          type="date"
          name="purchaseDate"
          value={formData.purchaseDate}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Purchase Value (LKR)
        </label>
        <input
          type="number"
          name="purchaseValue"
          value={formData.purchaseValue}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="0.00"
        />
      </div>

      {/* Boundaries */}
      <div className="md:col-span-2">
        <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2 mt-6">Property Boundaries</h4>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          North Boundary
        </label>
        <input
          type="text"
          name="boundaries.north"
          value={formData.boundaries.north}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Northern boundary description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          South Boundary
        </label>
        <input
          type="text"
          name="boundaries.south"
          value={formData.boundaries.south}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Southern boundary description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          East Boundary
        </label>
        <input
          type="text"
          name="boundaries.east"
          value={formData.boundaries.east}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Eastern boundary description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          West Boundary
        </label>
        <input
          type="text"
          name="boundaries.west"
          value={formData.boundaries.west}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Western boundary description"
        />
      </div>

      {/* Registration Details */}
      <div className="md:col-span-2">
        <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2 mt-6">Registration Details</h4>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Registration Type <span className="text-red-500">*</span>
        </label>
        <select
          name="registrationType"
          value={formData.registrationType}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">Select registration type</option>
          <option value="new_registration">New Registration</option>
          <option value="transfer_of_ownership">Transfer of Ownership</option>
          <option value="subdivision">Subdivision</option>
          <option value="land_consolidation">Land Consolidation</option>
          <option value="name_change">Name Change</option>
          <option value="correction">Correction</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Purpose of Registration <span className="text-red-500">*</span>
        </label>
        <select
          name="purposeOfRegistration"
          value={formData.purposeOfRegistration}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">Select purpose</option>
          <option value="sale_transaction">Sale Transaction</option>
          <option value="inheritance">Inheritance</option>
          <option value="gift_transfer">Gift Transfer</option>
          <option value="mortgage_registration">Mortgage Registration</option>
          <option value="legal_requirement">Legal Requirement</option>
          <option value="development_project">Development Project</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Is Property Mortgaged? <span className="text-red-500">*</span>
        </label>
        <select
          name="isMortgaged"
          value={formData.isMortgaged}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>

      {formData.isMortgaged === 'yes' && (
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mortgage Details
          </label>
          <textarea
            name="mortgageDetails"
            value={formData.mortgageDetails}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Details about the mortgage including bank/institution name and loan amount"
          />
        </div>        )}
      </div>
    </form>
  );

  return (
    <ServiceFormBase
      title="Land Registration Application"
      serviceName={serviceName}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    >
      {formFields}
    </ServiceFormBase>
  );
};

export default LandRegistrationForm;
