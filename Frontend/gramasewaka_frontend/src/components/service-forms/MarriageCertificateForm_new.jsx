import { useState, useEffect } from 'react';
import ServiceFormBase from './ServiceFormBase';

const MarriageCertificateForm = ({ serviceName, onFormDataChange, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    husbandFullName: '',
    husbandNIC: '',
    husbandDateOfBirth: '',
    wifeFullName: '',
    wifeNIC: '',
    wifeDateOfBirth: '',
    marriageDate: '',
    marriagePlace: '',
    marriageRegistrarOffice: '',
    certificateNumber: '',
    witness1Name: '',
    witness1NIC: '',
    witness2Name: '',
    witness2NIC: '',
    purposeOfCertificate: '',
    relationshipToCouple: '',
    applicantName: '',
    applicantNIC: ''
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
        {/* Husband Information */}
        <div className="md:col-span-2">
          <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">Husband's Information</h4>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Husband's Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="husbandFullName"
            value={formData.husbandFullName}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Husband's full name as per marriage certificate"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Husband's NIC Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="husbandNIC"
            value={formData.husbandNIC}
            onChange={handleInputChange}
            required
            pattern="[0-9]{9}[vVxX]|[0-9]{12}"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 123456789V or 200012345678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Husband's Date of Birth
          </label>
          <input
            type="date"
            name="husbandDateOfBirth"
            value={formData.husbandDateOfBirth}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Wife Information */}
        <div className="md:col-span-2">
          <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2 mt-6">Wife's Information</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wife's Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="wifeFullName"
            value={formData.wifeFullName}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Wife's full name as per marriage certificate"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wife's NIC Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="wifeNIC"
            value={formData.wifeNIC}
            onChange={handleInputChange}
            required
            pattern="[0-9]{9}[vVxX]|[0-9]{12}"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 123456789V or 200012345678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wife's Date of Birth
          </label>
          <input
            type="date"
            name="wifeDateOfBirth"
            value={formData.wifeDateOfBirth}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Marriage Information */}
        <div className="md:col-span-2">
          <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2 mt-6">Marriage Information</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Marriage <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="marriageDate"
            value={formData.marriageDate}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Place of Marriage <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="marriagePlace"
            value={formData.marriagePlace}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Location where marriage ceremony took place"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Marriage Registrar Office
          </label>
          <input
            type="text"
            name="marriageRegistrarOffice"
            value={formData.marriageRegistrarOffice}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Office where marriage was registered"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Marriage Certificate Number
          </label>
          <input
            type="text"
            name="certificateNumber"
            value={formData.certificateNumber}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Original certificate number (if known)"
          />
        </div>

        {/* Witness Information */}
        <div className="md:col-span-2">
          <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2 mt-6">Witness Information (Optional)</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Witness 1 Name
          </label>
          <input
            type="text"
            name="witness1Name"
            value={formData.witness1Name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="First witness full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Witness 1 NIC
          </label>
          <input
            type="text"
            name="witness1NIC"
            value={formData.witness1NIC}
            onChange={handleInputChange}
            pattern="[0-9]{9}[vVxX]|[0-9]{12}"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="First witness NIC number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Witness 2 Name
          </label>
          <input
            type="text"
            name="witness2Name"
            value={formData.witness2Name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Second witness full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Witness 2 NIC
          </label>
          <input
            type="text"
            name="witness2NIC"
            value={formData.witness2NIC}
            onChange={handleInputChange}
            pattern="[0-9]{9}[vVxX]|[0-9]{12}"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Second witness NIC number"
          />
        </div>

        {/* Applicant Information */}
        <div className="md:col-span-2">
          <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2 mt-6">Applicant Information</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Applicant's Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="applicantName"
            value={formData.applicantName}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Person applying for the certificate"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Applicant's NIC Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="applicantNIC"
            value={formData.applicantNIC}
            onChange={handleInputChange}
            required
            pattern="[0-9]{9}[vVxX]|[0-9]{12}"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Applicant's NIC number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Relationship to Couple <span className="text-red-500">*</span>
          </label>
          <select
            name="relationshipToCouple"
            value={formData.relationshipToCouple}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select relationship</option>
            <option value="husband">Husband</option>
            <option value="wife">Wife</option>
            <option value="child">Child of the couple</option>
            <option value="parent">Parent</option>
            <option value="legal_representative">Legal Representative</option>
            <option value="authorized_person">Authorized Person</option>
          </select>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select purpose</option>
            <option value="visa_application">Visa Application</option>
            <option value="passport_application">Passport Application</option>
            <option value="spouse_visa">Spouse Visa</option>
            <option value="legal_proceedings">Legal Proceedings</option>
            <option value="official_records">Official Records</option>
            <option value="bank_purposes">Bank/Financial Purposes</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </form>
  );

  return (
    <ServiceFormBase
      title="Marriage Certificate Application"
      serviceName={serviceName}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    >
      {formFields}
    </ServiceFormBase>
  );
};

export default MarriageCertificateForm;
