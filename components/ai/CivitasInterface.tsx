'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface CivitasInterfaceProps {
  isCollapsed?: boolean;
}

function CivitasInterface({ isCollapsed = false }: CivitasInterfaceProps) {
  const { data: session } = useSession()
  const [inputValue, setInputValue] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [isReturningUser, setIsReturningUser] = useState(false)

  useEffect(() => {
    if (session?.user) {
      // Check for returning user based on session
      const lastVisit = localStorage.getItem('civitas-last-visit')
      setIsReturningUser(!!lastVisit)
      localStorage.setItem('civitas-last-visit', new Date().toISOString())
    }
  }, [session])

  const userName = session?.user?.name || 'Investor'

  const handleSubmit = async () => {
    if (!inputValue.trim() || loading) return

    setLoading(true)
    setShowWelcome(false)

    // Simulate API call with more realistic property scouting response
    setTimeout(() => {
      const isPropertyQuery = inputValue.toLowerCase().includes('scout') || inputValue.toLowerCase().includes('property') || inputValue.toLowerCase().includes('analyze')

      if (isPropertyQuery) {
        setResponse(`I've completed a comprehensive analysis of your property request: "${inputValue}"

📊 **PROPERTY ANALYSIS COMPLETE**

**Investment Summary:**
• Property Value: $450,000 - $475,000
• Estimated Monthly Rent: $2,800 - $3,200
• Cash Flow: +$450/month (after expenses)
• Cap Rate: 7.2%
• Expected Annual ROI: 14.8%

**Market Insights:**
• Neighborhood appreciation: +12% year-over-year
• Rental demand: High (vacancy rate: 2.1%)
• Investment grade: A- (Strong fundamentals)

**Key Metrics:**
• Purchase price analysis vs. market comps
• Rental income projections
• Operating expense breakdown
• Tax implications and benefits

**Risk Assessment:**
• Market volatility: Low-Medium
• Liquidity: Good (30-45 days avg. sale time)
• Future development impact: Positive

---

**Would you like me to prepare a detailed report?**

I can export this analysis as:
• PDF Investment Report
• Excel Financial Model
• Market Comparison Spreadsheet
• Executive Summary

Just let me know which format you prefer, or ask me to dive deeper into any specific aspect of this analysis.`)
      } else {
        setResponse(`I've analyzed your query: "${inputValue}"

Based on current market data and trends, here's what I found:

• **Market Analysis**: Current conditions show strong fundamentals in your target area
• **Investment Opportunities**: Multiple properties meet your criteria with strong ROI potential
• **Risk Assessment**: Market indicators suggest stable to positive growth trajectory
• **Financial Projections**: Expected returns align with your investment goals

**Detailed findings include:**
- Comparable property analysis
- Cash flow projections
- Market trend analysis
- Investment recommendations

Would you like me to export this analysis as a detailed report? I can provide:
• PDF Market Report
• Investment Summary
• Financial Projections
• Property Recommendations

Just let me know what format works best for you!`)
      }
      setLoading(false)
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
    if (showWelcome) {
      setShowWelcome(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    if (showWelcome && e.target.value.length > 0) {
      setShowWelcome(false)
    }
  }

  const newConversation = () => {
    setInputValue('')
    setResponse('')
    setShowWelcome(true)
  }

  const exampleQueries = [
    "Scout this property: 123 Main St, Austin TX - provide full investment analysis",
    "What are the best neighborhoods in Miami for rental properties under $500k?",
    "Analyze cash flow potential for a duplex in Denver with 4% down payment",
    "Compare investment returns: Austin vs Nashville for multifamily properties"
  ]

  return (
    <div
      className="fixed top-0 bottom-0 right-0 bg-[#0f0f0f] text-white flex overflow-hidden z-50 transition-all duration-300"
      style={{
        left: isCollapsed ? '64px' : '256px'
      }}
    >
      {/* Sidebar */}
      <div className="w-72 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] border-r border-purple-500/20 flex flex-col relative overflow-hidden flex-shrink-0">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-2xl"></div>

        {/* Header */}
        <div className="relative z-10 p-6 border-b border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Civitas AI
              </h1>
              <p className="text-xs text-purple-200/80">Real Estate Intelligence</p>
            </div>
          </div>

          <button
            onClick={newConversation}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border border-purple-400/30 rounded-xl py-3 px-4 text-sm font-medium transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-purple-500/25 hover:scale-105"
          >
            <span className="text-xl">✨</span>
            <span>New Analysis</span>
            <div className="ml-auto w-2 h-2 bg-white/30 rounded-full"></div>
          </button>
        </div>

        {/* Recent Conversations */}
        <div className="relative z-10 flex-1 p-4">
          <div className="text-xs font-semibold text-purple-200/80 mb-3 uppercase tracking-wider">Recent Chats</div>
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all duration-200 hover:scale-105 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">Scout: 123 Oak St, Austin</div>
                  <div className="text-xs text-gray-300/70 mt-1">ROI: 14.8% • Report ready</div>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all duration-200 hover:scale-105 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">Miami rental market analysis</div>
                  <div className="text-xs text-gray-300/70 mt-1">2 hours ago • Exported to PDF</div>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all duration-200 hover:scale-105 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">Denver duplex comparison</div>
                  <div className="text-xs text-gray-300/70 mt-1">Yesterday • Excel exported</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Section */}
        <div className="relative z-10 p-4 border-t border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">{userName}</div>
              <div className="text-xs text-purple-200/70">{session ? 'Free Plan' : 'Guest'}</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-400/20 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-xs text-purple-200/80 mb-1">
              {session ? 'Chats remaining today' : 'Sign in for full access'}
            </div>
            <div className="flex items-center gap-2">
              {session ? (
                <>
                  <div className="flex-1 bg-white/10 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full w-3/4"></div>
                  </div>
                  <span className="text-xs font-semibold text-white">15</span>
                </>
              ) : (
                <span className="text-xs text-blue-300 underline cursor-pointer">Get started →</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 border-b border-[#2a2a2a] flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Civitas AI</h2>
          </div>
          <div className="text-sm text-gray-400">
            Powered by Advanced AI Agents
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full px-8 py-8">

            {/* Welcome Section */}
            {showWelcome && (
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🏠</span>
                </div>

                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  {isReturningUser ? `Welcome back, ${userName}` : `Hello, ${userName}`}
                </h1>
                {!isReturningUser && (
                  <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Welcome to Civitas AI for Real Estate
                  </h2>
                )}

                <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                  Your intelligent real estate investment assistant. Simply ask questions like "scout this property"
                  or "analyze the market" and I'll provide comprehensive insights with export options.
                </p>

                {/* Example Queries */}
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-lg font-semibold text-gray-300 mb-4">Try asking me something like:</h3>
                  </div>
                  <div className="space-y-3">
                    {exampleQueries.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => setInputValue(query)}
                        className="w-full p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:border-[#3a3a3a] transition-all duration-300 hover:bg-[#2a2a2a]/50 text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-400 rounded-full group-hover:bg-purple-400 transition-colors"></div>
                          <span className="text-gray-300 group-hover:text-white transition-colors">{query}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Query Display */}
            {inputValue && !showWelcome && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">👤</span>
                    </div>
                    <div>
                      <div className="text-white/80 text-sm font-medium mb-2">Your Query</div>
                      <div className="text-white leading-relaxed">{inputValue}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="mb-8">
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse">
                      <span className="text-sm font-bold">C</span>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm font-medium mb-2">Civitas AI is analyzing...</div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <span className="text-gray-400 text-sm ml-2">Processing real estate data...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Response Display */}
            {response && (
              <div className="mb-8">
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">C</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-400 text-sm font-medium mb-3">Civitas AI Response</div>
                      <div className="text-gray-100 leading-relaxed whitespace-pre-wrap">
                        {response}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-[#2a2a2a] p-6">
          <div className="w-full px-4">
            <div className="relative">
              <div className="flex items-end gap-4">
                <div className="flex-1 relative">
                  <textarea
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Scout this property: [address] or ask me to analyze markets, calculate ROI, find opportunities..."
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-6 py-4 pr-16 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[#3a3a3a] transition-all duration-200 min-h-[60px] max-h-[200px]"
                    rows={1}
                    disabled={loading}
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none'
                    }}
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !inputValue.trim()}
                    className="absolute right-3 bottom-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>Free plan: 15 chats remaining today</span>
                  <button className="text-blue-400 hover:text-blue-300 transition-colors">
                    Upgrade for unlimited access
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span>Press Enter to send</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CivitasInterface
