import { useState, useEffect } from 'react';
import ServiceFormBase from './ServiceFormBase';

const DeathCertificateForm = ({ serviceName, onFormDataChange, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    deceasedFullName: '',
    dateOfDeath: '',
    placeOfDeath: '',
    ageAtDeath: '',
    causeOfDeath: '',
    deceasedNIC: '',
    deceasedAddress: '',
    spouseFullName: '',
    spouseNIC: '',
    fatherFullName: '',
    motherFullName: '',
    informantName: '',
    informantNIC: '',
    informantRelationship: '',
    informantAddress: '',
    informantPhone: '',
    registrationDistrict: '',
    registrationDate: '',
    purposeOfCertificate: '',
    relationshipToDeceased: ''
  });

  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange(formData);
    }
  }, [formData, onFormDataChange]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        {/* Deceased Information */}
        <div className="md:col-span-2">
          <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">Deceased Information</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name of Deceased <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="deceasedFullName"
            value={formData.deceasedFullName}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Enter full name as per death register"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Death <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="dateOfDeath"
            value={formData.dateOfDeath}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Place of Death <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="placeOfDeath"
            value={formData.placeOfDeath}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Hospital/Place where death occurred"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age at Death <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="ageAtDeath"
            value={formData.ageAtDeath}
            onChange={handleInputChange}
            required
            min="0"
            max="150"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Age in years"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            NIC Number of Deceased
          </label>
          <input
            type="text"
            name="deceasedNIC"
            value={formData.deceasedNIC}
            onChange={handleInputChange}
            pattern="[0-9]{9}[vVxX]|[0-9]{12}"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="NIC number (if available)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cause of Death
          </label>
          <input
            type="text"
            name="causeOfDeath"
            value={formData.causeOfDeath}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Medical cause of death (if known)"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Known Address of Deceased
          </label>
          <textarea
            name="deceasedAddress"
            value={formData.deceasedAddress}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Complete last known address"
          />
        </div>

        {/* Family Information */}
        <div className="md:col-span-2">
          <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2 mt-6">Family Information</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Spouse's Full Name
          </label>
          <input
            type="text"
            name="spouseFullName"
            value={formData.spouseFullName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Spouse's full name (if married)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Spouse's NIC Number
          </label>
          <input
            type="text"
            name="spouseNIC"
            value={formData.spouseNIC}
            onChange={handleInputChange}
            pattern="[0-9]{9}[vVxX]|[0-9]{12}"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Spouse's NIC number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Father's Full Name
          </label>
          <input
            type="text"
            name="fatherFullName"
            value={formData.fatherFullName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Father's full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mother's Full Name
          </label>
          <input
            type="text"
            name="motherFullName"
            value={formData.motherFullName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Mother's full name"
          />
        </div>

        {/* Informant Information */}
        <div className="md:col-span-2">
          <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2 mt-6">Informant Information</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Informant's Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="informantName"
            value={formData.informantName}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Person who reported the death"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Informant's NIC Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="informantNIC"
            value={formData.informantNIC}
            onChange={handleInputChange}
            required
            pattern="[0-9]{9}[vVxX]|[0-9]{12}"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Informant's NIC number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Relationship to Deceased <span className="text-red-500">*</span>
          </label>
          <select
            name="informantRelationship"
            value={formData.informantRelationship}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">Select relationship</option>
            <option value="spouse">Spouse</option>
            <option value="son">Son</option>
            <option value="daughter">Daughter</option>
            <option value="father">Father</option>
            <option value="mother">Mother</option>
            <option value="brother">Brother</option>
            <option value="sister">Sister</option>
            <option value="relative">Other Relative</option>
            <option value="guardian">Legal Guardian</option>
            <option value="friend">Friend</option>
            <option value="neighbor">Neighbor</option>
            <option value="official">Government Official</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Informant's Phone Number
          </label>
          <input
            type="tel"
            name="informantPhone"
            value={formData.informantPhone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Contact number"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Informant's Address <span className="text-red-500">*</span>
          </label>
          <textarea
            name="informantAddress"
            value={formData.informantAddress}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Complete address of the informant"
          />
        </div>

        {/* Registration Information */}
        <div className="md:col-span-2">
          <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2 mt-6">Registration Information</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Registration District
          </label>
          <input
            type="text"
            name="registrationDistrict"
            value={formData.registrationDistrict}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="District where death was registered"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Registration Date
          </label>
          <input
            type="date"
            name="registrationDate"
            value={formData.registrationDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Application Information */}
        <div className="md:col-span-2">
          <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2 mt-6">Application Information</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purpose of Certificate <span className="text-red-500">*</span>
          </label>
          <select
            name="purposeOfCertificate"
            value={formData.purposeOfCertificate}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">Select purpose</option>
            <option value="insurance_claim">Insurance Claim</option>
            <option value="pension_claim">Pension Claim</option>
            <option value="property_transfer">Property Transfer</option>
            <option value="legal_proceedings">Legal Proceedings</option>
            <option value="bank_purposes">Bank/Financial Purposes</option>
            <option value="official_records">Official Records</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Applicant's Relationship to Deceased <span className="text-red-500">*</span>
          </label>
          <select
            name="relationshipToDeceased"
            value={formData.relationshipToDeceased}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">Select relationship</option>
            <option value="spouse">Spouse</option>
            <option value="child">Child</option>
            <option value="parent">Parent</option>
            <option value="sibling">Sibling</option>
            <option value="grandchild">Grandchild</option>
            <option value="grandparent">Grandparent</option>
            <option value="relative">Other Relative</option>
            <option value="legal_heir">Legal Heir</option>
            <option value="executor">Executor</option>
            <option value="legal_representative">Legal Representative</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </form>
  );

  return (
    <ServiceFormBase
      title="Death Certificate Application"
      serviceName={serviceName}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    >
      {formFields}
    </ServiceFormBase>
  );
};

export default DeathCertificateForm;