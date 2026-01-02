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
        // Get token from URL query params
        const token = searchParams.get('token');
        const error = searchParams.get('error');
        const emailVerified = searchParams.get('emailVerified');

        // Handle errors
        if (error) {
          let errorMessage = 'Authentication failed';
          
          switch (error) {
            case 'no_code':
              errorMessage = 'No authorization code received from Google';
              break;
            case 'token_exchange_failed':
              errorMessage = 'Failed to exchange authorization code for tokens';
              break;
            case 'no_id_token':
              errorMessage = 'No ID token received from Google';
              break;
            case 'token_verification_failed':
              errorMessage = 'Failed to verify Google token';
              break;
            case 'no_email':
              errorMessage = 'Email not provided by Google';
              break;
            case 'email_not_verified':
              errorMessage = 'Google email is not verified. Please verify your email with Google first.';
              break;
            case 'oauth_init_failed':
              errorMessage = 'Failed to initiate Google OAuth';
              break;
            default:
              errorMessage = `Authentication error: ${error}`;
          }

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

        // Store token in localStorage
        localStorage.setItem('token', token);

        // Get user data from URL params (backend includes all data in redirect)
        const name = searchParams.get('name');
        const email = searchParams.get('email');
        const role = searchParams.get('role') || 'user';
        const onboardingCompleted = searchParams.get('onboardingCompleted') === 'true';
        const userId = searchParams.get('_id');
        const message = searchParams.get('message');

        // Construct user data from URL params
        const userData = {
          _id: userId,
          name: name ? decodeURIComponent(name) : '',
          email: email ? decodeURIComponent(email) : '',
          emailVerified: emailVerified === 'true',
          role: role,
          onboardingCompleted: onboardingCompleted,
        };

        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Sync onboardingCompleted to localStorage
        if (onboardingCompleted) {
          localStorage.setItem('onboardingCompleted', 'true');
        }
        
        setUser(userData);

        // Show success message (from backend or default)
        toast.success(message || 'Signed in successfully!');
        navigate('/');
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

