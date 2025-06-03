import { useState } from 'react';
import { DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ServiceFormBase = ({ 
  onSubmit, 
  onCancel, 
  isSubmitting,
  submitApplication,
  children,
  title = "Service Application"
}) => {
  const [documents, setDocuments] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [formData, setFormData] = useState({});

  const handleFileChange = (e) => {
    setDocuments(Array.from(e.target.files));
  };

  const handleFormDataChange = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Combine all form data
    const serviceSpecificData = {
      ...formData,
      additionalInfo
    };
    
    // Call onSubmit with the service-specific data and documents
    onSubmit(serviceSpecificData, documents);
    
    // Then trigger the actual application submission
    if (submitApplication) {
      submitApplication();
    }
  };
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service-specific form fields */}
        {children && (
          <div>
            {typeof children === 'function' ? children(handleFormDataChange, formData) : children}
          </div>
        )}

        {/* Additional Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Information
          </label>
          <textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            rows={4}
            placeholder="Provide any additional information relevant to your application"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Document Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Supporting Documents
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <p className="text-xs text-gray-500 mt-1">
            Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
          </p>
          {documents.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">Selected files:</p>
              <ul className="text-sm text-gray-600">
                {documents.map((file, index) => (
                  <li key={index} className="flex items-center">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceFormBase;
