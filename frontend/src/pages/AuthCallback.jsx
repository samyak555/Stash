import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Logo from '../components/Logo';

/**
 * Auth Callback Page
 * Handles OAuth callback from backend
 * Receives JWT token and user data from backend redirect
 */
const AuthCallback = ({ setUser }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token and status from URL query params
        const token = searchParams.get('token');
        const status = searchParams.get('status'); // 'new_user' or 'existing_user'
        const needsOnboarding = searchParams.get('needsOnboarding') === 'true';
        const error = searchParams.get('error');
        const emailVerified = searchParams.get('emailVerified');

        // Handle errors
        if (error) {
          let errorMessage = 'Authentication failed';
          
          switch (error) {
            case 'no_code':
              errorMessage = 'No authorization code received from Google. Please try again.';
              break;
            case 'token_exchange_failed':
              errorMessage = 'Failed to exchange authorization code. Please try signing in again.';
              break;
            case 'no_id_token':
              errorMessage = 'No ID token received from Google. Please try again.';
              break;
            case 'token_verification_failed':
              errorMessage = 'Failed to verify Google token. Please try again.';
              break;
            case 'no_email':
              errorMessage = 'Email not provided by Google. Please ensure your Google account has an email.';
              break;
            case 'email_not_verified':
              errorMessage = 'Your Google email is not verified. Please verify your email with Google first.';
              break;
            case 'oauth_init_failed':
              errorMessage = 'Failed to initiate Google OAuth. Please try again.';
              break;
            case 'server_config_error':
              errorMessage = 'Server configuration error. Please contact support.';
              break;
            case 'network_error':
              errorMessage = 'Network error. Please check your connection and try again.';
              break;
            case 'timeout_error':
              errorMessage = 'Request timed out. Please try again.';
              break;
            case 'dns_error':
              errorMessage = 'Connection error. Please check your internet connection.';
              break;
            case 'url_construction_failed':
              errorMessage = 'Redirect error. Please try signing in again.';
              break;
            case 'user_update_failed':
              errorMessage = 'Failed to update your profile. Please contact support if this persists.';
              break;
            case 'user_save_failed':
              errorMessage = 'Failed to save your data. Please try again.';
              break;
            case 'user_creation_failed':
              errorMessage = 'Failed to create your account. Please try again.';
              break;
            case 'duplicate_google_id':
              errorMessage = 'This Google account is already linked to another user.';
              break;
            case 'user_repair_failed':
              errorMessage = 'Account needs repair. Please contact support.';
              break;
            case 'oauth_failed':
            default:
              // Check if there's a custom message in URL
              const message = searchParams.get('message');
              errorMessage = message ? decodeURIComponent(message) : `Authentication failed: ${error}. Please try again.`;
          }

          // Clear guest mode on error
          localStorage.removeItem('isGuest');
          localStorage.removeItem('guestTimestamp');
          
          toast.error(errorMessage, { duration: 7000 });
          navigate('/login');
          return;
        }

        // Check if token is present
        if (!token) {
          toast.error('No authentication token received');
          navigate('/login');
          return;
        }

        // Clear guest mode data when signing in
        localStorage.removeItem('isGuest');
        localStorage.removeItem('guestTimestamp');
        
        // Store token in localStorage
        localStorage.setItem('token', token);

        // Get user data from URL params (backend includes all data in redirect)
        const name = searchParams.get('name');
        const email = searchParams.get('email');
        const role = searchParams.get('role') || 'user';
        // Safely parse onboardingCompleted - default to false if not present
        const onboardingCompletedParam = searchParams.get('onboardingCompleted');
        const onboardingCompleted = onboardingCompletedParam === 'true';
        const userId = searchParams.get('_id');
        const message = searchParams.get('message');
        const age = searchParams.get('age');
        const profession = searchParams.get('profession');

        // Construct user data from URL params - ensure all fields have defaults
        const userData = {
          _id: userId,
          name: name ? decodeURIComponent(name) : '',
          email: email ? decodeURIComponent(email) : '',
          emailVerified: emailVerified === 'true',
          role: role,
          onboardingCompleted: onboardingCompleted || false, // Always default to false
          age: age ? parseInt(age) : undefined,
          profession: profession ? decodeURIComponent(profession) : undefined,
        };

        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Sync onboardingCompleted to localStorage
        if (onboardingCompleted) {
          localStorage.setItem('onboardingCompleted', 'true');
        } else {
          localStorage.removeItem('onboardingCompleted');
        }
        
        setUser(userData);

        // Show success message
        toast.success(message || 'Signed in successfully!');
        
        // Redirect based on status and needsOnboarding flag
        if (status === 'new_user' || needsOnboarding) {
          // New user or user needing onboarding - redirect to onboarding
          console.log('🆕 User needs onboarding, redirecting to onboarding');
          navigate('/onboarding');
        } else {
          // Existing user with completed onboarding - redirect to dashboard
          console.log('✅ User onboarding complete, redirecting to dashboard');
          navigate('/');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Failed to complete authentication');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen flex flex-col bg-black relative overflow-hidden">
      <Logo fullPage={true} />
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-lg">Completing authentication...</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;

