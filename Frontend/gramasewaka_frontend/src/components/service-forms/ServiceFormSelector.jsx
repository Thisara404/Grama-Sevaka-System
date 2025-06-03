import BirthCertificateForm from './BirthCertificateForm';
import DeathCertificateForm from './DeathCertificateForm';
import MarriageCertificateForm from './MarriageCertificateForm';
import CharacterCertificateForm from './CharacterCertificateForm';
import AddressVerificationForm from './AddressVerificationForm';
import LandRegistrationForm from './LandRegistrationForm';

const ServiceFormSelector = ({ serviceName, onFormDataChange, onSubmit, onCancel, isSubmitting }) => {
  // Map service names to their corresponding form components
  const getFormComponent = () => {
    const normalizedServiceName = serviceName?.toLowerCase();
    
    if (!normalizedServiceName) return null;    // Birth Certificate variations
    if (normalizedServiceName.includes('birth certificate') || normalizedServiceName.includes('birth cert')) {
      return (
        <BirthCertificateForm
          serviceName={serviceName}
          onFormDataChange={onFormDataChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
        />
      );
    }

    // Death Certificate variations
    if (normalizedServiceName.includes('death certificate') || normalizedServiceName.includes('death cert')) {
      return (
        <DeathCertificateForm
          serviceName={serviceName}
          onFormDataChange={onFormDataChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
        />
      );
    }

    // Marriage Certificate variations
    if (normalizedServiceName.includes('marriage certificate') || normalizedServiceName.includes('marriage cert')) {
      return (
        <MarriageCertificateForm
          serviceName={serviceName}
          onFormDataChange={onFormDataChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
        />
      );    }
    
    // Character Certificate variations
    if (normalizedServiceName.includes('character certificate') || normalizedServiceName.includes('character cert') || normalizedServiceName.includes('good conduct')) {
      return (
        <CharacterCertificateForm
          serviceName={serviceName}
          onFormDataChange={onFormDataChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
        />
      );
    }

    // Address Verification variations
    if (normalizedServiceName.includes('address verification') || normalizedServiceName.includes('address cert') || normalizedServiceName.includes('residence cert')) {
      return (
        <AddressVerificationForm
          serviceName={serviceName}
          onFormDataChange={onFormDataChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
        />
      );
    }

    // Land Registration variations
    if (normalizedServiceName.includes('land registration') || normalizedServiceName.includes('land transfer') || normalizedServiceName.includes('property registration')) {
      return (
        <LandRegistrationForm
          serviceName={serviceName}
          onFormDataChange={onFormDataChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
        />
      );
    }

    // Return fallback generic form if no specific form is found
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Service-specific form not available. Please use the generic application form below.
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Information
          </label>
          <textarea
            rows={4}
            placeholder="Provide any additional information relevant to your application"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            onChange={(e) => {
              // Check if onFormDataChange is a function before calling it
              if (typeof onFormDataChange === 'function') {
                onFormDataChange({ additionalInfo: e.target.value });
              }
            }}
          />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-secondary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </div>
    );
  };

  return getFormComponent();
};

export default ServiceFormSelector;
