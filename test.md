


Your other chat crashed on me. 
Here are all those files, this frontend goes to netlify:

netlify.toml:
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[dev]
  command = "npm run dev"
  port = 3000
  publish = "dist"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval';"


// src/main.tsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);



// src/context/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '../components/firebaseconfig/firebaseconfig';
import {
  signInWithPopup,
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';

interface AuthContextProps {
  signup: (email: string, password: string, username: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  user: User | null;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = !!user;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string, username: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });
      setUser(userCredential.user);
    } catch (error) {
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const googleProvider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, googleProvider);
      setUser(userCredential.user);
    } catch (error) {
      throw error;
    }
  };

  const loginWithApple = async () => {
    try {
      const appleProvider = new OAuthProvider('apple.com');
      const userCredential = await signInWithPopup(auth, appleProvider);
      setUser(userCredential.user);
    } catch (error) {
      throw error;
    }
  };

  const loginWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      setUser(userCredential.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ signup, login, loginWithGoogle, loginWithApple, loginWithFacebook, logout, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};



// src/routes/index.tsx

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

// Lazy load pages
const AuthSuccess = React.lazy(() => import('../pages/AuthSuccess'));
const AuthFailure = React.lazy(() => import('../pages/AuthFailure'));
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const Financial = React.lazy(() => import('../pages/Financial'));
const Marketing = React.lazy(() => import('../pages/Marketing'));
const Insights = React.lazy(() => import('../pages/Insights'));
const Social = React.lazy(() => import('../pages/Social'));
const Settings = React.lazy(() => import('../pages/Settings'));
const Login = React.lazy(() => import('../pages/Login'));
const Signup = React.lazy(() => import('../pages/Signup'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route path="/auth-failure" element={<AuthFailure />} />
        <Route path="/" element={<Navigate to="/settings" replace />} />
        <Route path="/settings" element={<Settings />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/financial"
          element={
            <ProtectedRoute>
              <Financial />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketing"
          element={
            <ProtectedRoute>
              <Marketing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <Insights />
            </ProtectedRoute>
          }
        />
        <Route
          path="/social"
          element={
            <ProtectedRoute>
              <Social />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

Okay so:
I started the application locally.
It went to the root URL (/), and redirected to /login.
After logging in with google I was redirected to /settings.
Fixed the login credentials for facebook.

I also need help with all these errors in the Login page:

[{
	"resource": "/c:/Users/bekiw/OneDrive/Desktop/SAKUGA/PhutureSync/phuturesync-dashboard/src/pages/Login.tsx",
	"owner": "typescript",
	"code": "2339",
	"severity": 8,
	"message": "Property 'fbAsyncInit' does not exist on type 'Window & typeof globalThis'.",
	"source": "ts",
	"startLineNumber": 20,
	"startColumn": 12,
	"endLineNumber": 20,
	"endColumn": 23,
	"modelVersionId": 8
},{
	"resource": "/c:/Users/bekiw/OneDrive/Desktop/SAKUGA/PhutureSync/phuturesync-dashboard/src/pages/Login.tsx",
	"owner": "typescript",
	"code": "2339",
	"severity": 8,
	"message": "Property 'FB' does not exist on type 'Window & typeof globalThis'.",
	"source": "ts",
	"startLineNumber": 21,
	"startColumn": 14,
	"endLineNumber": 21,
	"endColumn": 16,
	"modelVersionId": 8
},{
	"resource": "/c:/Users/bekiw/OneDrive/Desktop/SAKUGA/PhutureSync/phuturesync-dashboard/src/pages/Login.tsx",
	"owner": "typescript",
	"code": "2339",
	"severity": 8,
	"message": "Property 'src' does not exist on type 'HTMLElement'.",
	"source": "ts",
	"startLineNumber": 35,
	"startColumn": 10,
	"endLineNumber": 35,
	"endColumn": 13,
	"modelVersionId": 8
},{
	"resource": "/c:/Users/bekiw/OneDrive/Desktop/SAKUGA/PhutureSync/phuturesync-dashboard/src/pages/Login.tsx",
	"owner": "typescript",
	"code": "18047",
	"severity": 8,
	"message": "'fjs.parentNode' is possibly 'null'.",
	"source": "ts",
	"startLineNumber": 36,
	"startColumn": 7,
	"endLineNumber": 36,
	"endColumn": 21,
	"modelVersionId": 8
},{
	"resource": "/c:/Users/bekiw/OneDrive/Desktop/SAKUGA/PhutureSync/phuturesync-dashboard/src/pages/Login.tsx",
	"owner": "typescript",
	"code": "2552",
	"severity": 8,
	"message": "Cannot find name 'navigate'. Did you mean 'navigator'?",
	"source": "ts",
	"startLineNumber": 160,
	"startColumn": 5,
	"endLineNumber": 160,
	"endColumn": 13,
	"relatedInformation": [
		{
			"startLineNumber": 27988,
			"startColumn": 13,
			"endLineNumber": 27988,
			"endColumn": 22,
			"message": "'navigator' is declared here.",
			"resource": "/c:/Users/bekiw/AppData/Local/Programs/cursor/resources/app/extensions/node_modules/typescript/lib/lib.dom.d.ts"
		}
	],
	"modelVersionId": 8
},{
	"resource": "/c:/Users/bekiw/OneDrive/Desktop/SAKUGA/PhutureSync/phuturesync-dashboard/src/pages/Login.tsx",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'setError'.",
	"source": "ts",
	"startLineNumber": 163,
	"startColumn": 5,
	"endLineNumber": 163,
	"endColumn": 13,
	"modelVersionId": 8
},{
	"resource": "/c:/Users/bekiw/OneDrive/Desktop/SAKUGA/PhutureSync/phuturesync-dashboard/src/pages/Login.tsx",
	"owner": "typescript",
	"code": "6133",
	"severity": 4,
	"message": "'handleAppleLogin' is declared but its value is never read.",
	"source": "ts",
	"startLineNumber": 61,
	"startColumn": 9,
	"endLineNumber": 61,
	"endColumn": 25,
	"tags": [
		1
	],
	"modelVersionId": 8
},{
	"resource": "/c:/Users/bekiw/OneDrive/Desktop/SAKUGA/PhutureSync/phuturesync-dashboard/src/pages/Login.tsx",
	"owner": "typescript",
	"code": "6133",
	"severity": 4,
	"message": "'handleInstagramLogin' is declared but its value is never read.",
	"source": "ts",
	"startLineNumber": 83,
	"startColumn": 9,
	"endLineNumber": 83,
	"endColumn": 29,
	"tags": [
		1
	],
	"modelVersionId": 8
},{
	"resource": "/c:/Users/bekiw/OneDrive/Desktop/SAKUGA/PhutureSync/phuturesync-dashboard/src/pages/Login.tsx",
	"owner": "typescript",
	"code": "6133",
	"severity": 4,
	"message": "'handleFacebookLogin' is declared but its value is never read.",
	"source": "ts",
	"startLineNumber": 149,
	"startColumn": 7,
	"endLineNumber": 149,
	"endColumn": 26,
	"tags": [
		1
	],
	"modelVersionId": 8
}]

---END ERRORS---

// src/pages/Login.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FacebookAuthProvider,signInWithPopup  } from 'firebase/auth';
import { auth } from "../components/firebaseconfig/firebaseconfig"; // Firebase config file


const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { loginWithGoogle, loginWithApple, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize the Facebook SDK
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: '1102166627980497', // Replace with your App ID
        cookie: true,
        xfbml: true,
        version: 'v14.0', // Use the latest Facebook API version
      });
    };

    // Load Facebook SDK script
    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(email, password);
      navigate('/settings');
    } catch (error: any) {
      setError('Login failed. Please check your credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/settings');
    } catch (error) {
      setError('Google login failed. Please try again.');
    }
  };

  const handleAppleLogin = async () => {
    try {
      await loginWithApple();
      navigate('/settings');
    } catch (error) {
      setError('Apple login failed. Please try again.');
    }
  };

  const handleFacebookLogin = async () => {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user; // Successfully logged-in user
      console.log("Facebook Login Success:", user);
      navigate('/settings');
    } catch (error: any) {
      console.error("Facebook Login Error:", error);
      setError('Facebook login failed. Please try again.');
    }
  };

  const handleInstagramLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/instagram'); // Backend generates the OAuth URL
      const { url } = await response.json();
      window.location.href = url; // Redirect to Instagram OAuth
    } catch (err) {
      setError('Instagram login failed. Please try again.');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">Log In</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full mb-4 p-3 border rounded-lg"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full mb-4 p-3 border rounded-lg"
        />
        <button type="submit" className="btn btn-primary w-full">
          Log In
        </button>
      </form>

      <div className="my-4 flex items-center justify-center">
        <span className="text-gray-500">or</span>
      </div>

      <button onClick={handleGoogleLogin} className="btn btn-primary w-full bg-red-500 hover:bg-red-600">
        Log In with Google
      </button>
{/* 
      <button onClick={handleAppleLogin} className="btn btn-primary w-full bg-black hover:bg-gray-800 mt-4">
        Log In with Apple
      </button> */}

      <button onClick={handleFacebookLogin} className="btn btn-primary w-full bg-blue-600 hover:bg-blue-700 mt-4">
        Log In with Facebook
      </button>

      {/* <button onClick={handleInstagramLogin} className="btn btn-primary w-full bg-pink-500 hover:bg-pink-600 mt-4">
        Log In with Instagram
      </button> */}

      <p className="mt-4 text-center">
        Don’t have an account?{' '}
        <a href="/signup" className="text-blue-500 hover:underline">
          Sign Up
        </a>
      </p>
    </div>
  );
};

const handleFacebookLogin = async () => {
  const provider = new FacebookAuthProvider();
  provider.addScope('pages_manage_posts'); // Manage posts
  provider.addScope('pages_read_engagement'); // Read page engagement
  provider.addScope('ads_management'); // Manage ads
  provider.addScope('business_management'); // Manage business accounts

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user; // Successfully logged-in user
    console.log("Facebook Login Success:", user);
    navigate('/settings');
  } catch (error: any) {
    console.error("Facebook Login Error:", error);
    setError('Facebook login failed. Please try again.');
  }
};

export default Login;

Directory trees:

├── phuturesync-api/
    ├── .env
    ├── .gitignore
    ├── package-lock.json
    ├── package.json
    ├── server.js
    ├── serviceAccountKey.json
    ├── vercel.json
    ├── .vercel/
        ├── project.json
        ├── README.txt
    ├── routes/
        ├── adCampaigns.js
        ├── auth.js
        ├── insights.js
        ├── uploads.js
    ├── utils/
        ├── firebase.js
        ├── apiClients/
            ├── facebook.js
            ├── googleAdsense.js
            ├── instagram.js
            ├── linkedin.js
            ├── meta.js
            ├── tiktok.js
            ├── twitter.js

            ├── phuturesync-dashboard/
    ├── .env
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── jest.config.js
    ├── netlify.toml
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.js
    ├── README.md
    ├── tailwind.config.js
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vercel.json
    ├── vite.config.ts
    ├── vitest.config.ts
    ├── public/
        ├── robots.txt
        ├── sitemap.xml
    ├── src/
        ├── App.tsx
        ├── index.css
        ├── main.tsx
        ├── setupTests.ts
        ├── test-utils.tsx
        ├── vite-env.d.ts
        ├── components/
            ├── DashboardCard.tsx
            ├── ExpensesPieChart.tsx
            ├── FeatureOverlay.tsx
            ├── FinancialChart.tsx
            ├── LoadingSpinner.tsx
            ├── LoginForm.tsx
            ├── Sidebar.tsx
            ├── SocialLoginPanel.tsx
            ├── TimeframeFilter.tsx
            ├── dashboard/
                ├── ActiveCampaigns.tsx
                ├── DailyMetrics.tsx
                ├── PerformanceChart.tsx
                ├── RecommendationsPanel.tsx
                ├── TopPerformers.tsx
            ├── firebaseconfig/
                ├── firebaseconfig.ts
            ├── insights/
                ├── InsightCard.tsx
                ├── PerformanceChart.tsx
            ├── marketing/
                ├── CampaignList.tsx
                ├── MarketingFilters.tsx
                ├── PerformanceChart.tsx
                ├── TopPerformers.tsx
            ├── settings/
                ├── IntegrationsSection.tsx
                ├── ProfileSection.tsx
            ├── social/
                ├── AudienceInsights.tsx
                ├── CompetitorAnalysis.tsx
                ├── ContentCalendar.tsx
                ├── DemographicsChart.tsx
                ├── EngagementHub.tsx
                ├── LocationMap.tsx
                ├── SocialMetrics.tsx
        ├── context/
            ├── AuthContext.tsx
        ├── mocks/
            ├── handlers.ts
            ├── server.ts
        ├── pages/
            ├── AuthFailure.tsx
            ├── AuthSuccess.tsx
            ├── Dashboard.tsx
            ├── Financial.tsx
            ├── Insights.tsx
            ├── Login.tsx
            ├── Marketing.tsx
            ├── Security.tsx
            ├── Settings.tsx
            ├── Signup.tsx
            ├── Social.tsx
            ├── Verify.tsx
        ├── routes/
            ├── index.tsx
        ├── server/
            ├── models/
                ├── Analytics.ts
                ├── Campaign.ts
                ├── User.ts
            ├── services/
                ├── AIService.ts
                ├── SocialMediaService.ts
        ├── services/
            ├── api.ts
            ├── auth.ts
            ├── firebaseConfig.ts
        ├── types/
            ├── msw.d.ts