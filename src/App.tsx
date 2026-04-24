import React, { useState, useEffect } from 'react';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

// Use environment variable from Vercel, with fallback to empty string
const REPLICATE_API_KEY = (typeof window !== 'undefined' && (window as any).REPLICATE_API_TOKEN) || 
                          process.env.REACT_APP_REPLICATE_API_KEY || 
                          process.env.REPLICATE_API_TOKEN || 
                          '';

// Log for debugging (remove in production)
if (!REPLICATE_API_KEY) {
  console.warn('⚠️ REPLICATE_API_KEY not found. Please set REPLICATE_API_TOKEN or REACT_APP_REPLICATE_API_KEY environment variable.');
}
const ADMIN_EMAIL = 'jawadjan1t@gmail.com';
const DAILY_CREDITS = 100;
const VIDEO_COST = 10;
const STORAGE_KEY = 'jawad_studio_state';
const APP_NAME = 'Jawad Studio';

// ============================================================================
// TYPES
// ============================================================================

interface User {
  id: string;
  email: string;
  credits: number;
  lastCreditReset: string;
  isAdmin: boolean;
}

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  timestamp: string;
}

interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
}

// ============================================================================
// REVIEWS DATA
// ============================================================================

const REVIEWS: Review[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: '👩‍💼',
    rating: 5,
    text: 'Jawad Studio transformed my content creation workflow. The AI quality is absolutely stunning!',
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    avatar: '👨‍🎨',
    rating: 5,
    text: 'As a professional creator, this is the best tool I\'ve found. Fast, reliable, and intuitive.',
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    avatar: '👩‍🚀',
    rating: 5,
    text: 'The video generation is mind-blowing. I\'ve saved hours of work already.',
  },
  {
    id: '4',
    name: 'David Kim',
    avatar: '👨‍💻',
    rating: 5,
    text: 'Perfect balance of power and simplicity. Jawad Studio is a game-changer',
  },
  {
    id: '5',
    name: 'Priya Patel',
    avatar: '👩‍🎬',
    rating: 5,
    text: 'The design is sleek, the performance is excellent, and the results are incredible.'
  },
];

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export default function App() {
  // State Management
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<'login' | 'home' | 'generate' | 'gallery' | 'admin' | 'settings'>('login');
  const [generationType, setGenerationType] = useState<'image' | 'text-video' | 'image-video'>('image');
  const [textPrompt, setTextPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [generatedItem, setGeneratedItem] = useState<GalleryItem | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [apiKey, setApiKey] = useState('');

  // Initialize from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCurrentUser(data.currentUser);
        setGallery(data.gallery || []);
        setAllUsers(data.allUsers || []);
        if (data.currentUser) {
          setCurrentPage('home');
        }
      } catch (e) {
        console.error('Failed to load saved state:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentUser,
        gallery,
        allUsers,
      }));
    }
  }, [currentUser, gallery, allUsers]);

  // ============================================================================
  // AUTHENTICATION FUNCTIONS
  // ============================================================================

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      credits: DAILY_CREDITS,
      lastCreditReset: new Date().toDateString(),
      isAdmin: email === ADMIN_EMAIL,
    };

    setCurrentUser(user);
    if (!allUsers.find(u => u.email === email)) {
      setAllUsers([...allUsers, user]);
    }
    setSuccess('Login successful!');
    setEmail('');
    setPassword('');
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
  };

  // ============================================================================
  // CREDIT SYSTEM
  // ============================================================================

  const checkAndDeductCredits = (amount: number): boolean => {
    if (!currentUser) return false;

    if (currentUser.isAdmin) return true;

    const today = new Date().toDateString();
    if (currentUser.lastCreditReset !== today) {
      currentUser.credits = DAILY_CREDITS;
      currentUser.lastCreditReset = today;
    }

    if (currentUser.credits < amount) {
      setError(`Insufficient credits. You need ${amount} credits but only have ${currentUser.credits}`);
      return false;
    }

    currentUser.credits -= amount;
    setCurrentUser({ ...currentUser });
    return true;
  };

  // ============================================================================
  // REPLICATE API FUNCTIONS
  // ============================================================================

  const callReplicateAPI = async (model: string, input: any): Promise<string> => {
    try {
      setLoading(true);
      setError('');
      setGenerationProgress(0);

      const response = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${REPLICATE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `API error: ${response.statusText}`);
      }

      const data = await response.json();
      let prediction = data;

      // Poll for completion
      while (prediction.status === 'processing' || prediction.status === 'starting') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setGenerationProgress(Math.min(generationProgress + 10, 90));

        const pollResponse = await fetch(prediction.urls.get, {
          headers: { Authorization: `Token ${REPLICATE_API_KEY}` },
        });

        if (!pollResponse.ok) throw new Error('Failed to check prediction status');
        prediction = await pollResponse.json();
      }

      if (prediction.status === 'failed') {
        throw new Error(prediction.error || 'Generation failed');
      }

      setGenerationProgress(100);
      const result = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'API call failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
      setGenerationProgress(0);
    }
  };

  // ============================================================================
  // GENERATION FUNCTIONS
  // ============================================================================

  const generateImage = async () => {
    if (!textPrompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    try {
      const result = await callReplicateAPI('black-forest-labs/flux-schnell', {
        prompt: textPrompt,
      });

      if (result) {
        const item: GalleryItem = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'image',
          url: result,
          prompt: textPrompt,
          timestamp: new Date().toISOString(),
        };
        setGallery([item, ...gallery]);
        setGeneratedItem(item);
        setSuccess('Image generated successfully!');
        setTextPrompt('');
      }
    } catch (err) {
      console.error('Image generation failed:', err);
    }
  };

  const generateTextToVideo = async () => {
    if (!textPrompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (!checkAndDeductCredits(VIDEO_COST)) return;

    try {
      const result = await callReplicateAPI('luma/ray', {
        prompt: textPrompt,
      });

      if (result) {
        const item: GalleryItem = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'video',
          url: result,
          prompt: textPrompt,
          timestamp: new Date().toISOString(),
        };
        setGallery([item, ...gallery]);
        setGeneratedItem(item);
        setSuccess('Video generated successfully!');
        setTextPrompt('');
      }
    } catch (err) {
      console.error('Video generation failed:', err);
    }
  };

  const generateImageToVideo = async () => {
    if (!selectedImage) {
      setError('Please select an image');
      return;
    }

    if (!checkAndDeductCredits(VIDEO_COST)) return;

    try {
      const result = await callReplicateAPI('stability-ai/stable-video-diffusion', {
        image: selectedImage,
      });

      if (result) {
        const item: GalleryItem = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'video',
          url: result,
          prompt: 'Image to Video',
          timestamp: new Date().toISOString(),
        };
        setGallery([item, ...gallery]);
        setGeneratedItem(item);
        setSuccess('Video generated successfully!');
        setSelectedImage(null);
      }
    } catch (err) {
      console.error('Video generation failed:', err);
    }
  };

  // ============================================================================
  // GALLERY FUNCTIONS
  // ============================================================================

  const deleteFromGallery = (id: string) => {
    setGallery(gallery.filter(item => item.id !== id));
  };

  const downloadItem = (url: string, type: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `jawad-group-${type}-${Date.now()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  // Login Screen
  if (currentPage === 'login' && !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">✨</div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-blue-400 bg-clip-text text-transparent mb-2">
              {APP_NAME}
            </h1>
            <p className="text-gray-400 text-lg">AI Creative Studio</p>
          </div>

          {/* Form Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-300 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter any password"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
              >
                Sign In
              </button>
            </form>

            <p className="text-center text-gray-400 text-sm mt-6">
              Demo: Use any email/password to login
            </p>
          </div>

          {/* Features Preview */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">🖼️</div>
              <p className="text-gray-400 text-xs">Image Gen</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎬</div>
              <p className="text-gray-400 text-xs">Video Gen</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <p className="text-gray-400 text-xs">Fast & Easy</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Home Screen
  if (currentPage === 'home' && currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-3xl">✨</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-blue-400 bg-clip-text text-transparent">
                {APP_NAME}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">{currentUser.email}</p>
                <p className="text-xs text-gray-500">{currentUser.isAdmin ? 'Admin' : 'User'}</p>
              </div>
              <button
                onClick={() => setCurrentPage('settings')}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                ⚙️
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* Credit Card */}
          <div className="mb-12 bg-gradient-to-r from-amber-500/20 to-blue-500/20 border border-amber-500/30 rounded-2xl p-8 backdrop-blur-xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm mb-2">Available Credits</p>
                <p className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-blue-400 bg-clip-text text-transparent">
                  {currentUser.isAdmin ? '∞' : currentUser.credits}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm mb-2">Status</p>
                <p className="text-2xl font-semibold text-green-400">
                  {currentUser.isAdmin ? '✓ Admin' : '✓ Active'}
                </p>
              </div>
            </div>
          </div>

          {/* Generation Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Image Generation */}
            <button
              onClick={() => {
                setGenerationType('image');
                setCurrentPage('generate');
              }}
              className="group relative bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20"
            >
              <div className="text-5xl mb-4">🖼️</div>
              <h3 className="text-xl font-bold text-white mb-2">Image Generation</h3>
              <p className="text-gray-400 text-sm mb-4">Generate stunning images from text</p>
              <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
                <span>Free</span>
                <span>→</span>
              </div>
            </button>

            {/* Text to Video */}
            <button
              onClick={() => {
                setGenerationType('text-video');
                setCurrentPage('generate');
              }}
              className="group relative bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <div className="text-5xl mb-4">🎬</div>
              <h3 className="text-xl font-bold text-white mb-2">Text to Video</h3>
              <p className="text-gray-400 text-sm mb-4">Create videos from text prompts</p>
              <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold">
                <span>{VIDEO_COST} credits</span>
                <span>→</span>
              </div>
            </button>

            {/* Image to Video */}
            <button
              onClick={() => {
                setGenerationType('image-video');
                setCurrentPage('generate');
              }}
              className="group relative bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
            >
              <div className="text-5xl mb-4">🎥</div>
              <h3 className="text-xl font-bold text-white mb-2">Image to Video</h3>
              <p className="text-gray-400 text-sm mb-4">Animate images into videos</p>
              <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold">
                <span>{VIDEO_COST} credits</span>
                <span>→</span>
              </div>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setCurrentPage('gallery')}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition text-left"
            >
              <p className="text-2xl mb-2">📸</p>
              <h3 className="text-lg font-semibold text-white mb-1">My Gallery</h3>
              <p className="text-gray-400 text-sm">{gallery.length} items saved</p>
            </button>

            {currentUser.isAdmin && (
              <button
                onClick={() => setCurrentPage('admin')}
                className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition text-left"
              >
                <p className="text-2xl mb-2">📊</p>
                <h3 className="text-lg font-semibold text-white mb-1">Admin Dashboard</h3>
                <p className="text-gray-400 text-sm">Platform statistics</p>
              </button>
            )}
          </div>

          {/* Reviews Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-white mb-8">What Users Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {REVIEWS.map((review) => (
                <div
                  key={review.id}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{review.avatar}</span>
                    <div>
                      <p className="text-white font-semibold text-sm">{review.name}</p>
                      <p className="text-amber-400 text-xs">{'⭐'.repeat(review.rating)}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Generation Screen
  if (currentPage === 'generate' && currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-white">
              {generationType === 'image' && '🖼️ Image Generation'}
              {generationType === 'text-video' && '🎬 Text to Video'}
              {generationType === 'image-video' && '🎥 Image to Video'}
            </h1>
            <div className="w-20"></div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-300">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white mb-6">Create Content</h2>

              {(generationType === 'image' || generationType === 'text-video') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Prompt</label>
                  <textarea
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                    placeholder="Describe what you want to create..."
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition resize-none"
                    rows={6}
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    {generationType === 'image' ? 'Be specific and creative!' : 'Describe the video you want to create'}
                  </p>
                </div>
              )}

              {generationType === 'image-video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Select Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setSelectedImage(event.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white cursor-pointer"
                  />
                  {selectedImage && (
                    <div className="mt-4">
                      <img src={selectedImage} alt="Selected" className="w-full rounded-lg" />
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  if (generationType === 'image') generateImage();
                  else if (generationType === 'text-video') generateTextToVideo();
                  else generateImageToVideo();
                }}
                disabled={loading}
                className="w-full mt-6 py-3 bg-gradient-to-r from-amber-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? `Generating... ${generationProgress}%` : 'Generate'}
              </button>
            </div>

            {/* Preview Section */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white mb-6">Preview</h2>
              {generatedItem ? (
                <div>
                  {generatedItem.type === 'image' ? (
                    <img src={generatedItem.url} alt="Generated" className="w-full rounded-lg mb-4" />
                  ) : (
                    <video src={generatedItem.url} controls className="w-full rounded-lg mb-4" />
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadItem(generatedItem.url, generatedItem.type)}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => setGeneratedItem(null)}
                      className="flex-1 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-64 bg-slate-700/30 border border-slate-600 rounded-lg flex items-center justify-center text-gray-500">
                  Your generated content will appear here
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Gallery Screen
  if (currentPage === 'gallery' && currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-white">📸 My Gallery</h1>
            <div className="w-20"></div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          {gallery.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">📭</p>
              <p className="text-gray-400 text-lg">No items in gallery yet</p>
              <button
                onClick={() => setCurrentPage('home')}
                className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Start Creating
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600 transition group"
                >
                  <div className="relative h-48 bg-slate-700/30 overflow-hidden">
                    {item.type === 'image' ? (
                      <img src={item.url} alt={item.prompt} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <video src={item.url} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    )}
                    <div className="absolute top-2 right-2 bg-slate-900/80 px-2 py-1 rounded text-xs text-white">
                      {item.type === 'image' ? '🖼️' : '🎬'}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">{item.prompt}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadItem(item.url, item.type)}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => deleteFromGallery(item.id)}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Admin Dashboard
  if (currentPage === 'admin' && currentUser?.isAdmin) {
    const totalImages = gallery.filter(item => item.type === 'image').length;
    const totalVideos = gallery.filter(item => item.type === 'video').length;
    const totalCreditsUsed = allUsers.reduce((sum, user) => sum + (DAILY_CREDITS - user.credits), 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-white">📊 Admin Dashboard</h1>
            <div className="w-20"></div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-2">Total Users</p>
              <p className="text-4xl font-bold text-blue-400">{allUsers.length}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-2">Images Generated</p>
              <p className="text-4xl font-bold text-amber-400">{totalImages}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-2">Videos Generated</p>
              <p className="text-4xl font-bold text-purple-400">{totalVideos}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-2">Credits Consumed</p>
              <p className="text-4xl font-bold text-green-400">{totalCreditsUsed}</p>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Credits</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition">
                      <td className="py-3 px-4 text-white">{user.email}</td>
                      <td className="py-3 px-4 text-gray-300">{user.isAdmin ? '∞' : user.credits}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isAdmin ? 'bg-amber-500/20 text-amber-300' : 'bg-green-500/20 text-green-300'
                        }`}>
                          {user.isAdmin ? 'Admin' : 'User'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Settings Screen
  if (currentPage === 'settings' && currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-white">⚙️ Settings</h1>
            <div className="w-20"></div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Account Settings</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={currentUser.email}
                  disabled
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Account Type</label>
                <input
                  type="text"
                  value={currentUser.isAdmin ? 'Administrator' : 'Regular User'}
                  disabled
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Available Credits</label>
                <input
                  type="text"
                  value={currentUser.isAdmin ? 'Unlimited' : currentUser.credits}
                  disabled
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-gray-400 cursor-not-allowed"
                />
              </div>

              <div className="pt-6 border-t border-slate-700">
                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
