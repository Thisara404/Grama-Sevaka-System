import { useState, useEffect } from 'react';
import ServiceFormBase from './ServiceFormBase';

const AddressVerificationForm = ({ serviceName, onFormDataChange, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    applicantFullName: '',
    applicantNIC: '',
    applicantPhone: '',
    applicantEmail: '',
    currentAddress: '',
    houseNumber: '',
    streetName: '',
    city: '',
    district: '',
    province: '',
    postalCode: '',
    gramaNiladhari: '',
    divisionalSecretariat: '',
    policeStation: '',
    residenceType: '',
    ownershipType: '',
    landlordName: '',
    landlordContact: '',
    residenceDuration: '',
    residenceFromDate: '',
    previousAddress: '',
    familyMembers: [
      { name: '', relationship: '', nic: '', age: '' }
    ],
    verificationPurpose: '',
    employerName: '',
    employerAddress: '',
    monthlyIncome: '',
    occupation: '',
    hasUtilityBills: '',
    electricityAccountNumber: '',
    waterAccountNumber: '',
    telephoneNumber: '',
    reference1Name: '',
    reference1Contact: '',
    reference1Address: '',
    reference2Name: '',
    reference2Contact: '',
    reference2Address: ''  });

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

  const handleFamilyMemberChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const addFamilyMember = () => {
    setFormData(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, { name: '', relationship: '', nic: '', age: '' }]
    }));
  };

  const removeFamilyMember = (index) => {
    if (formData.familyMembers.length > 1) {
      setFormData(prev => ({
        ...prev,
        familyMembers: prev.familyMembers.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedService) {
      setError('Please select a service');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Create form data object
      const requestFormData = new FormData();
      requestFormData.append('serviceId', selectedService._id);
      requestFormData.append('additionalInfo', formData.additionalInfo);
      
      // Add files if any
      if (formData.documents && formData.documents.length > 0) {
        formData.documents.forEach(file => {
          requestFormData.append('documents', file);
        });
      }
      
      // Send the request
      const response = await fetch('http://localhost:5000/api/services/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: requestFormData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit service request');
      }
      
      const data = await response.json();
      setSuccess(true);
      setRequestNumber(data.requestNumber);
      
      // Reset form data
      setFormData({
        additionalInfo: '',
        documents: []
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formFields = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Applicant Information */}
      <div className="md:col-span-2">
        <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">Applicant Information</h4>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="applicantFullName"
          value={formData.applicantFullName}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Your full name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          NIC Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="applicantNIC"
          value={formData.applicantNIC}
          onChange={handleInputChange}
          required
          pattern="[0-9]{9}[vVxX]|[0-9]{12}"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Your NIC number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="applicantPhone"
          value={formData.applicantPhone}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Your contact number"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Your email address"
        />
      </div>

      {/* Address Information */}
      <div className="md:col-span-2">
        <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2 mt-6">Current Address Information</h4>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Complete Current Address <span className="text-red-500">*</span>
        </label>
        <textarea
          name="currentAddress"
          value={formData.currentAddress}
          onChange={handleInputChange}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Full address including house number, street, area"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          House/Apartment Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="houseNumber"
          value={formData.houseNumber}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="House number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Street Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="streetName"
          value={formData.streetName}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Street/Road name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          City/Town <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="City or town name"
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
          Province <span className="text-red-500">*</span>
        </label>
        <select
          name="province"
          value={formData.province}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">Select Province</option>
          <option value="Western">Western Province</option>
          <option value="Central">Central Province</option>
          <option value="Southern">Southern Province</option>
          <option value="Northern">Northern Province</option>
          <option value="Eastern">Eastern Province</option>
          <option value="North Western">North Western Province</option>
          <option value="North Central">North Central Province</option>
          <option value="Uva">Uva Province</option>
          <option value="Sabaragamuwa">Sabaragamuwa Province</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Postal Code
        </label>
        <input
          type="text"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleInputChange}
          pattern="[0-9]{5}"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Postal code"
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
          Nearest Police Station
        </label>
        <input
          type="text"
          name="policeStation"
          value={formData.policeStation}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Police station name"
        />
      </div>

      {/* Residence Details */}
      <div className="md:col-span-2">
        <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2 mt-6">Residence Details</h4>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type of Residence <span className="text-red-500">*</span>
        </label>
        <select
          name="residenceType"
          value={formData.residenceType}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">Select residence type</option>
          <option value="house">Independent House</option>
          <option value="apartment">Apartment</option>
          <option value="flat">Flat</option>
          <option value="annexe">Annexe</option>
          <option value="boarding_house">Boarding House</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ownership Type <span className="text-red-500">*</span>
        </label>
        <select
          name="ownershipType"
          value={formData.ownershipType}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">Select ownership type</option>
          <option value="owned">Own Property</option>
          <option value="rental">Rental Property</option>
          <option value="family_property">Family Property</option>
          <option value="company_provided">Company Provided</option>
          <option value="government_quarters">Government Quarters</option>
          <option value="other">Other</option>
        </select>
      </div>

      {formData.ownershipType === 'rental' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Landlord Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="landlordName"
              value={formData.landlordName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Property owner's name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Landlord Contact <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="landlordContact"
              value={formData.landlordContact}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Landlord phone number"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Duration of Residence <span className="text-red-500">*</span>
        </label>
        <select
          name="residenceDuration"
          value={formData.residenceDuration}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">Select duration</option>
          <option value="less_than_6_months">Less than 6 months</option>
          <option value="6_months_to_1_year">6 months to 1 year</option>
          <option value="1_to_2_years">1 to 2 years</option>
          <option value="2_to_5_years">2 to 5 years</option>
          <option value="more_than_5_years">More than 5 years</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Residing From Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="residenceFromDate"
          value={formData.residenceFromDate}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Previous Address (if resided less than 2 years)
        </label>
        <textarea
          name="previousAddress"
          value={formData.previousAddress}
          onChange={handleInputChange}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Previous address details"
        />
      </div>

      {/* Family Members */}
      <div className="md:col-span-2">
        <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2 mt-6">
          Family Members Living at This Address
        </h4>
      </div>

      {formData.familyMembers.map((member, index) => (
        <div key={index} className="md:col-span-2 border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h5 className="text-sm font-medium text-gray-800">Family Member {index + 1}</h5>
            {formData.familyMembers.length > 1 && (
              <button
                type="button"
                onClick={() => removeFamilyMember(index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={member.name}
                onChange={(e) => handleFamilyMemberChange(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Family member name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship
              </label>
              <select
                value={member.relationship}
                onChange={(e) => handleFamilyMemberChange(index, 'relationship', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Select</option>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="grandparent">Grandparent</option>
                <option value="grandchild">Grandchild</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIC/Birth Certificate No.
              </label>
              <input
                type="text"
                value={member.nic}
                onChange={(e) => handleFamilyMemberChange(index, 'nic', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="ID number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                value={member.age}
                onChange={(e) => handleFamilyMemberChange(index, 'age', e.target.value)}
                min="0"
                max="120"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Age"
              />
            </div>
          </div>
        </div>
      ))}

      <div className="md:col-span-2">
        <button
          type="button"
          onClick={addFamilyMember}
          className="text-primary hover:text-secondary text-sm font-medium"
        >
          + Add Another Family Member
        </button>
      </div>

      {/* Purpose and Employment */}
      <div className="md:col-span-2">
        <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2 mt-6">Purpose and Employment Details</h4>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Purpose of Address Verification <span className="text-red-500">*</span>
        </label>
        <select
          name="verificationPurpose"
          value={formData.verificationPurpose}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">Select purpose</option>
          <option value="bank_account">Bank Account Opening</option>
          <option value="job_application">Job Application</option>
          <option value="loan_application">Loan Application</option>
          <option value="passport_application">Passport Application</option>
          <option value="visa_application">Visa Application</option>
          <option value="school_admission">School Admission</option>
          <option value="utility_connection">Utility Connection</option>
          <option value="insurance">Insurance</option>
          <option value="legal_proceedings">Legal Proceedings</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Occupation <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="occupation"
          value={formData.occupation}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Your occupation"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Company/Organization name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Monthly Income (LKR)
        </label>
        <input
          type="number"
          name="monthlyIncome"
          value={formData.monthlyIncome}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Approximate monthly income"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Employer Address
        </label>
        <textarea
          name="employerAddress"
          value={formData.employerAddress}
          onChange={handleInputChange}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Complete employer address"
        />
      </div>

      {/* Utility Information */}
      <div className="md:col-span-2">
        <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2 mt-6">Utility Information</h4>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Do you have utility bills at this address? <span className="text-red-500">*</span>
        </label>
        <select
          name="hasUtilityBills"
          value={formData.hasUtilityBills}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      {formData.hasUtilityBills === 'yes' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Electricity Account Number
            </label>
            <input
              type="text"
              name="electricityAccountNumber"
              value={formData.electricityAccountNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Electricity bill account number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Water Account Number
            </label>
            <input
              type="text"
              name="waterAccountNumber"
              value={formData.waterAccountNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Water bill account number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telephone Number (Landline)
            </label>
            <input
              type="tel"
              name="telephoneNumber"
              value={formData.telephoneNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Fixed telephone number"
            />
          </div>
        </>
      )}

      {/* References */}
      <div className="md:col-span-2">
        <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2 mt-6">
          References (Two neighbors or local residents)
        </h4>
      </div>

      <div className="md:col-span-2">
        <h5 className="text-sm font-medium text-gray-800 mb-3">Reference 1</h5>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="reference1Name"
          value={formData.reference1Name}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Reference person's name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="reference1Contact"
          value={formData.reference1Contact}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Reference person's phone"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="reference1Address"
          value={formData.reference1Address}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Reference person's address"
        />
      </div>

      <div className="md:col-span-2">
        <h5 className="text-sm font-medium text-gray-800 mb-3 mt-4">Reference 2</h5>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="reference2Name"
          value={formData.reference2Name}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Second reference person's name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="reference2Contact"
          value={formData.reference2Contact}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Second reference person's phone"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="reference2Address"
          value={formData.reference2Address}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Second reference person's address"        />
      </div>
    </div>
    </form>
  );

  return (
    <ServiceFormBase
      title="Address Verification Application"
      serviceName={serviceName}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    >
      {formFields}
    </ServiceFormBase>
  );
};

export default AddressVerificationForm;