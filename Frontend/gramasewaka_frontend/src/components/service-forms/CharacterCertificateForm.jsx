import { useState, useEffect } from 'react';
import ServiceFormBase from './ServiceFormBase';

const CharacterCertificateForm = ({ serviceName, onFormDataChange, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    applicantFullName: '',
    applicantNIC: '',
    applicantPhone: '',
    applicantEmail: '',
    dateOfBirth: '',
    placeOfBirth: '',
    permanentAddress: '',
    currentAddress: '',
    occupation: '',
    employerName: '',
    employerAddress: '',
    purposeOfCertificate: '',
    characterReference1Name: '',
    characterReference1Phone: '',
    characterReference1Address: '',
    characterReference1Relationship: '',
    characterReference2Name: '',
    characterReference2Phone: '',
    characterReference2Address: '',
    characterReference2Relationship: '',
    policeStation: '',
    gramaNiladhariDivision: '',
    divisionalSecretariat: '',
    district: '',
    hasAnyConvictions: 'no',
    convictionDetails: '',
    hasAnyPendingCases: 'no',
    pendingCaseDetails: '',
    declarationAgreement: false
  });

  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange(formData);
    }
  }, [formData, onFormDataChange]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      {/* Personal Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="applicantFullName"
              value={formData.applicantFullName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              National Identity Card Number *
            </label>
            <input
              type="text"
              name="applicantNIC"
              value={formData.applicantNIC}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="applicantPhone"
              value={formData.applicantPhone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="applicantEmail"
              value={formData.applicantEmail}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth *
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Place of Birth *
            </label>
            <input
              type="text"
              name="placeOfBirth"
              value={formData.placeOfBirth}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Address Information</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permanent Address *
            </label>
            <textarea
              name="permanentAddress"
              value={formData.permanentAddress}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Address *
            </label>
            <textarea
              name="currentAddress"
              value={formData.currentAddress}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Administrative Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Administrative Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Police Station *
            </label>
            <input
              type="text"
              name="policeStation"
              value={formData.policeStation}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grama Niladhari Division *
            </label>
            <input
              type="text"
              name="gramaNiladhariDivision"
              value={formData.gramaNiladhariDivision}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Divisional Secretariat *
            </label>
            <input
              type="text"
              name="divisionalSecretariat"
              value={formData.divisionalSecretariat}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District *
            </label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Employment Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Employment Information</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Occupation *
            </label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employer Name
            </label>
            <input
              type="text"
              name="employerName"
              value={formData.employerName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employer Address
            </label>
            <textarea
              name="employerAddress"
              value={formData.employerAddress}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Purpose and References */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Purpose and References</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose of Certificate *
            </label>
            <select
              name="purposeOfCertificate"
              value={formData.purposeOfCertificate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select purpose</option>
              <option value="employment">Employment</option>
              <option value="visa_application">Visa Application</option>
              <option value="education">Education</option>
              <option value="business_registration">Business Registration</option>
              <option value="loan_application">Loan Application</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Character Reference 1 */}
          <div className="border-t pt-4">
            <h4 className="text-md font-medium mb-3 text-gray-700">Character Reference 1 *</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="characterReference1Name"
                  value={formData.characterReference1Name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="characterReference1Phone"
                  value={formData.characterReference1Phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="characterReference1Address"
                  value={formData.characterReference1Address}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  name="characterReference1Relationship"
                  value={formData.characterReference1Relationship}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Character Reference 2 */}
          <div className="border-t pt-4">
            <h4 className="text-md font-medium mb-3 text-gray-700">Character Reference 2</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="characterReference2Name"
                  value={formData.characterReference2Name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="characterReference2Phone"
                  value={formData.characterReference2Phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="characterReference2Address"
                  value={formData.characterReference2Address}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  name="characterReference2Relationship"
                  value={formData.characterReference2Relationship}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Declaration */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Legal Declaration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Do you have any criminal convictions? *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasAnyConvictions"
                  value="no"
                  checked={formData.hasAnyConvictions === 'no'}
                  onChange={handleInputChange}
                  className="mr-2"
                  required
                />
                No
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasAnyConvictions"
                  value="yes"
                  checked={formData.hasAnyConvictions === 'yes'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Yes
              </label>
            </div>
          </div>

          {formData.hasAnyConvictions === 'yes' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Please provide details of convictions
              </label>
              <textarea
                name="convictionDetails"
                value={formData.convictionDetails}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Do you have any pending court cases? *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasAnyPendingCases"
                  value="no"
                  checked={formData.hasAnyPendingCases === 'no'}
                  onChange={handleInputChange}
                  className="mr-2"
                  required
                />
                No
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasAnyPendingCases"
                  value="yes"
                  checked={formData.hasAnyPendingCases === 'yes'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Yes
              </label>
            </div>
          </div>

          {formData.hasAnyPendingCases === 'yes' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Please provide details of pending cases
              </label>
              <textarea
                name="pendingCaseDetails"
                value={formData.pendingCaseDetails}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          )}

          <div className="flex items-start">
            <input
              type="checkbox"
              name="declarationAgreement"
              checked={formData.declarationAgreement}
              onChange={handleInputChange}
              className="mt-1 mr-2"
              required
            />
            <label className="text-sm text-gray-700">
              I hereby declare that the information provided above is true and correct to the best of my knowledge. 
              I understand that providing false information may result in rejection of my application and/or legal consequences. *
            </label>
          </div>
        </div>
      </div>
    </form>
  );

  return (
    <ServiceFormBase
      title="Character Certificate Application"
      serviceName={serviceName}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    >
      {formFields}
    </ServiceFormBase>
  );
};

export default CharacterCertificateForm;