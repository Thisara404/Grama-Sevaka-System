import { useState, useEffect } from 'react';
import ServiceFormBase from './ServiceFormBase';

const BirthCertificateForm = ({ onSubmit, onCancel, isSubmitting, submitApplication }) => {
  const [formData, setFormData] = useState({
    childFullName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    fatherFullName: '',
    fatherNIC: '',
    motherFullName: '',
    motherNIC: '',
    parentAddress: '',
    registrationDistrict: '',
    purposeOfCertificate: '',
    relationshipToChild: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <ServiceFormBase
      title="Birth Certificate Application"
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitApplication={submitApplication}
    >
      {(handleFormDataChange) => {
        // Update parent component whenever form data changes
        useEffect(() => {
          handleFormDataChange(formData);
        }, [formData, handleFormDataChange]);

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Child Information */}
      <div className="md:col-span-2">
        <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">Child Information</h4>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Child's Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="childFullName"
          value={formData.childFullName}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Enter child's full name as per birth register"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date of Birth <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Place of Birth <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="placeOfBirth"
          value={formData.placeOfBirth}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Hospital/Home address where child was born"
        />
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
          placeholder="District where birth was registered"
        />
      </div>

      {/* Father Information */}
      <div className="md:col-span-2">
        <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2 mt-6">Father's Information</h4>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Father's Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="fatherFullName"
          value={formData.fatherFullName}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Father's full name as per NIC"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Father's NIC Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="fatherNIC"
          value={formData.fatherNIC}
          onChange={handleInputChange}
          required
          pattern="[0-9]{9}[vVxX]|[0-9]{12}"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="e.g., 123456789V or 200012345678"
        />
      </div>

      {/* Mother Information */}
      <div className="md:col-span-2">
        <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2 mt-6">Mother's Information</h4>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mother's Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="motherFullName"
          value={formData.motherFullName}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Mother's full name as per NIC"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mother's NIC Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="motherNIC"
          value={formData.motherNIC}
          onChange={handleInputChange}
          required
          pattern="[0-9]{9}[vVxX]|[0-9]{12}"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="e.g., 123456789V or 200012345678"
        />
      </div>

      {/* Additional Information */}
      <div className="md:col-span-2">
        <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2 mt-6">Additional Information</h4>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Parent's Current Address <span className="text-red-500">*</span>
        </label>
        <textarea
          name="parentAddress"
          value={formData.parentAddress}
          onChange={handleInputChange}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Complete current address of parent/guardian"
        />
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
          <option value="school_admission">School Admission</option>
          <option value="passport_application">Passport Application</option>
          <option value="scholarship">Scholarship Application</option>
          <option value="official_records">Official Records</option>
          <option value="legal_proceedings">Legal Proceedings</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Relationship to Child <span className="text-red-500">*</span>
        </label>
        <select
          name="relationshipToChild"
          value={formData.relationshipToChild}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">Select relationship</option>
          <option value="father">Father</option>
          <option value="mother">Mother</option>
          <option value="guardian">Legal Guardian</option>
          <option value="self">Self (if adult)</option>
          <option value="authorized_person">Authorized Person</option>        </select>
      </div>
    </div>
        );
      }}
    </ServiceFormBase>
  );
};

export default BirthCertificateForm;
