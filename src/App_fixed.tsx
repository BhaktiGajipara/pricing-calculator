import React, { useState } from 'react';
import { Calculator, DollarSign, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface FormData {
  callsPerDay: number;
  avgCallDuration: number;
  estimatedUsers: number;
  llmProvider: string;
  customLlmProvider?: string;
  sttProvider: string;
  customSttProvider?: string;
  ttsProvider: string;
  customTtsProvider?: string;
  knowledgeBaseSize: string;
  selfHosted: boolean;
  gpuInstanceType?: string;
}

interface CostEstimate {
  costSummary: {
    totalMonthlyCostRange: {
      min: number;
      max: number;
      avg: number;
    };
    llmCostRange: {
      min: number;
      max: number;
      avg: number;
    };
    knowledgeBaseTokenCostRange: {
      min: number;
      max: number;
      avg: number;
    };
    sttCostRange: {
      min: number;
      max: number;
      avg: number;
    };
    ttsCostRange: {
      min: number;
      max: number;
      avg: number;
    };
    twilioCostRange: {
      min: number;
      max: number;
      avg: number;
    };
    serverCostRange: {
      min: number;
      max: number;
      avg: number;
    };
    costPerUserRange: {
      min: number;
      max: number;
      avg: number;
    };
    costPerCallRange: {
      min: number;
      max: number;
      avg: number;
    };
  };
  serviceDetails: {
    llm: {
      provider: string;
      model: string;
      description: string;
      costRange: {
        min: number;
        max: number;
        avg: number;
      };
    };
    stt: {
      provider: string;
      model: string;
      description: string;
      costRange: {
        min: number;
        max: number;
        avg: number;
      };
    };
    tts: {
      provider: string;
      model: string;
      description: string;
      costRange: {
        min: number;
        max: number;
        avg: number;
      };
    };
    twilio: {
      provider: string;
      description: string;
      costRange: {
        min: number;
        max: number;
        avg: number;
      };
    };
    server: {
      provider: string;
      instanceType: string;
      description: string;
      costRange: {
        min: number;
        max: number;
        avg: number;
      };
    };
  };
  recommendations?: {
    bestValueLLM: string;
    bestQualityLLM: string;
    bestBalanceLLM: string;
    bestSTT: string;
    bestTTS: string;
  };
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    callsPerDay: 50,
    avgCallDuration: 5,
    estimatedUsers: 10,
    llmProvider: '',
    customLlmProvider: '',
    sttProvider: '',
    customSttProvider: '',
    ttsProvider: '',
    customTtsProvider: '',
    knowledgeBaseSize: '',
    selfHosted: false,
    gpuInstanceType: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Handle known providers only
      const requestData = {
        callsPerDay: formData.callsPerDay,
        avgCallDuration: formData.avgCallDuration,
        estimatedUsers: formData.estimatedUsers,
        llmProvider: formData.llmProvider,
        sttProvider: formData.sttProvider,
        ttsProvider: formData.ttsProvider,
        knowledgeBaseSize: formData.knowledgeBaseSize,
        selfHosted: false, // Always false since we're commenting out self-hosting
        gpuInstanceType: '', // Empty since no GPU selection
      };

      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to get cost estimate');
      }

      const data = await response.json();
      // Handle array response - take the first element
      const estimateData = Array.isArray(data) ? data[0] : data;
      setEstimate(estimateData);
    } catch (err) {
      setError('Failed to calculate cost estimate. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.callsPerDay > 0 &&
      formData.avgCallDuration > 0 &&
      formData.estimatedUsers > 0 &&
      formData.llmProvider &&
      formData.sttProvider &&
      formData.ttsProvider &&
      formData.knowledgeBaseSize
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Calculator className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">AI Agent Pricing Assistant</h1>
          </div>
          <p className="text-xl text-gray-600">Estimate your monthly costs for running an AI agent with APIs and EC2 infrastructure</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">📊 Usage Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📞 Number of calls per day *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.callsPerDay}
                        onChange={(e) => handleInputChange('callsPerDay', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🕐 Average call duration (minutes) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.avgCallDuration}
                        onChange={(e) => handleInputChange('avgCallDuration', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        👥 Estimated users *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.estimatedUsers}
                        onChange={(e) => handleInputChange('estimatedUsers', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📚 Knowledge base size *
                      </label>
                      <select
                        required
                        value={formData.knowledgeBaseSize}
                        onChange={(e) => handleInputChange('knowledgeBaseSize', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select size</option>
                        <option value="Small (< 1MB)">Small (&lt; 1MB)</option>
                        <option value="Medium (1-10MB)">Medium (1-10MB)</option>
                        <option value="Large (10-100MB)">Large (10-100MB)</option>
                        <option value="Very Large (> 100MB)">Very Large (&gt; 100MB)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* AI Services */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">🤖 AI Services</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🧠 LLM Provider *
                      </label>
                      <select
                        required
                        value={formData.llmProvider}
                        onChange={(e) => handleInputChange('llmProvider', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select provider</option>
                        <option value="OpenAI">OpenAI</option>
                        <option value="Claude">Claude</option>
                        <option value="Google Gemini">Google Gemini</option>
                        <option value="Mistral">Mistral</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🧏 STT Provider *
                      </label>
                      <select
                        required
                        value={formData.sttProvider}
                        onChange={(e) => handleInputChange('sttProvider', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select provider</option>
                        <option value="OpenAI">OpenAI</option>
                        <option value="Deepgram">Deepgram</option>
                        <option value="Google STT">Google STT</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🗣️ TTS Provider *
                      </label>
                      <select
                        required
                        value={formData.ttsProvider}
                        onChange={(e) => handleInputChange('ttsProvider', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select provider</option>
                        <option value="OpenAI">OpenAI</option>
                        <option value="ElevenLabs">ElevenLabs</option>
                        <option value="Cartesia">Cartesia</option>
                        <option value="Google TTS">Google TTS</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isFormValid() || isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-5 w-5 mr-2" />
                      Calculate Cost Estimate
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center mb-4">
                <DollarSign className="h-6 w-6 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Cost Estimate</h3>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {estimate ? (
                <div className="space-y-6">
                  {/* Main Cost Display */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center mb-3">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                      <span className="text-green-700 font-semibold text-lg">Monthly Cost Estimate</span>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-800 mb-2">
                        ${estimate.costSummary.totalMonthlyCostRange.min.toFixed(0)} - ${estimate.costSummary.totalMonthlyCostRange.max.toFixed(0)}
                      </div>
                      <div className="text-lg text-green-600 mb-2">per month</div>
                      <div className="inline-block bg-green-100 px-4 py-2 rounded-full">
                        <span className="text-sm font-medium text-green-700">
                          Average: ${estimate.costSummary.totalMonthlyCostRange.avg.toFixed(2)}/month
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 text-lg mb-4 flex items-center">
                      <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                      Cost Breakdown
                    </h4>
                    
                    <div className="space-y-4">
                      {/* AI Services Group */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-medium text-blue-900 mb-3 text-sm uppercase tracking-wide">AI Services</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 flex items-center">
                              <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 text-sm">🧠</span>
                              LLM Processing
                            </span>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">${estimate.costSummary.llmCostRange.min.toFixed(2)} - ${estimate.costSummary.llmCostRange.max.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">avg ${estimate.costSummary.llmCostRange.avg.toFixed(2)}</div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 flex items-center">
                              <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-sm">🧏</span>
                              Speech-to-Text
                            </span>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">${estimate.costSummary.sttCostRange.min.toFixed(2)} - ${estimate.costSummary.sttCostRange.max.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">avg ${estimate.costSummary.sttCostRange.avg.toFixed(2)}</div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 flex items-center">
                              <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 text-sm">🗣️</span>
                              Text-to-Speech
                            </span>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">${estimate.costSummary.ttsCostRange.min.toFixed(2)} - ${estimate.costSummary.ttsCostRange.max.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">avg ${estimate.costSummary.ttsCostRange.avg.toFixed(2)}</div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 flex items-center">
                              <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 text-sm">📚</span>
                              Knowledge Base
                            </span>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">${estimate.costSummary.knowledgeBaseTokenCostRange.min.toFixed(2)} - ${estimate.costSummary.knowledgeBaseTokenCostRange.max.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">avg ${estimate.costSummary.knowledgeBaseTokenCostRange.avg.toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Infrastructure Group */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-3 text-sm uppercase tracking-wide">Infrastructure</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 flex items-center">
                              <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 text-sm">📞</span>
                              Voice Services (Twilio)
                            </span>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">${estimate.costSummary.twilioCostRange.min.toFixed(2)} - ${estimate.costSummary.twilioCostRange.max.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">avg ${estimate.costSummary.twilioCostRange.avg.toFixed(2)}</div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 flex items-center">
                              <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 text-sm">🖥️</span>
                              Server Hosting (AWS)
                            </span>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">${estimate.costSummary.serverCostRange.min.toFixed(2)} - ${estimate.costSummary.serverCostRange.max.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">avg ${estimate.costSummary.serverCostRange.avg.toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Per-Unit Costs */}
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border-l-4 border-indigo-400">
                        <h5 className="font-medium text-indigo-900 mb-3 text-sm uppercase tracking-wide">Unit Economics</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-800">${estimate.costSummary.costPerUserRange.avg.toFixed(2)}</div>
                            <div className="text-xs text-indigo-600">Cost per User</div>
                            <div className="text-xs text-gray-500">${estimate.costSummary.costPerUserRange.min.toFixed(2)} - ${estimate.costSummary.costPerUserRange.max.toFixed(2)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-800">${estimate.costSummary.costPerCallRange.avg.toFixed(2)}</div>
                            <div className="text-xs text-indigo-600">Cost per Call</div>
                            <div className="text-xs text-gray-500">${estimate.costSummary.costPerCallRange.min.toFixed(2)} - ${estimate.costSummary.costPerCallRange.max.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service Details */}
                  {estimate.serviceDetails && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                        <span className="text-blue-700 font-semibold text-lg">Selected Services</span>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">LLM:</span>
                          <span className="text-gray-900">{estimate.serviceDetails.llm.model} ({estimate.serviceDetails.llm.provider})</span>
                        </div>
                        <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">STT:</span>
                          <span className="text-gray-900">{estimate.serviceDetails.stt.model} ({estimate.serviceDetails.stt.provider})</span>
                        </div>
                        <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">TTS:</span>
                          <span className="text-gray-900">{estimate.serviceDetails.tts.model} ({estimate.serviceDetails.tts.provider})</span>
                        </div>
                        <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">Voice:</span>
                          <span className="text-gray-900">{estimate.serviceDetails.twilio.provider}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">Server:</span>
                          <span className="text-gray-900">{estimate.serviceDetails.server.instanceType} ({estimate.serviceDetails.server.provider})</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {estimate.recommendations && (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <CheckCircle className="h-5 w-5 text-yellow-600 mr-3" />
                        <span className="text-yellow-800 font-semibold text-lg">AI Recommendations</span>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white bg-opacity-70 rounded-lg p-3">
                          <div className="font-medium text-yellow-800 text-sm">Best Value:</div>
                          <div className="text-yellow-700">{estimate.recommendations.bestValueLLM}</div>
                        </div>
                        <div className="bg-white bg-opacity-70 rounded-lg p-3">
                          <div className="font-medium text-yellow-800 text-sm">Best Quality:</div>
                          <div className="text-yellow-700">{estimate.recommendations.bestQualityLLM}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">Ready to Calculate</h3>
                  <p className="text-gray-400">Fill out the form to get your detailed cost estimate</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
