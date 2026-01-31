# Portfolio Chat Integration - Complete Guide

## ✅ What's Been Built

### 1. Frontend: Portfolio Context Button in Composer

**Location**: `src/components/chat/Composer.tsx`

Added a 🏠 Portfolio button next to the attachment button that:
- Shows tooltip "Portfolio Context" on hover
- Triggers `onPortfolioContext` callback
- Disabled while loading

**Visual**: Clean icon button that matches the paperclip style.

### 2. Frontend: Chat Handler in ChatTabView

**Location**: `src/components/desktop-shell/ChatTabView.tsx`

```typescript
const handlePortfolioContext = () => {
  // Check if user has portfolio
  const hasPortfolio = false; // TODO: Fetch from API
  
  if (hasPortfolio) {
    // Existing user: inject portfolio summary
    composerRef.current?.setInput("Help me manage my portfolio. ");
  } else {
    // New user: guide to add first property
    composerRef.current?.setInput("I want to add my first property to start tracking my portfolio. ");
  }
  
  composerRef.current?.focus();
};
```

### 3. Portfolio Empty State Redirect

**Location**: `src/components/portfolio/PortfolioDashboard.tsx`

Empty state now:
- Shows examples of what to say in chat
- Single "Go to Chat" button
- Hints about the portfolio button in composer

### 4. Backend API Fixed

**Location**: `DataLayer/app/api/routes_portfolio.py`

Fixed 422 error by adding proper authentication:
```python
async def list_portfolios(user_info: Dict = Depends(get_current_user)):
    user_id = user_info.get("uid") or user_info.get("user_id")
    ...
```

---

## 🚧 What Needs to be Done

### Next Step 1: Backend Portfolio Tool

**Create**: `DataLayer/app/services/tools/add_property_tool.py`

```python
from langchain.tools import tool
from app.services.portfolio_service import get_portfolio_service
from typing import Optional

@tool
def add_property_to_portfolio(
    address: str,
    purchase_price: float,
    purchase_date: str,
    city: Optional[str] = None,
    state: Optional[str] = None,
    monthly_rent: Optional[float] = None,
    **kwargs
) -> str:
    """
    Add a property to user's portfolio. Creates portfolio automatically if needed.
    
    Args:
        address: Property street address
        purchase_price: Purchase price in dollars
        purchase_date: Date purchased (YYYY-MM-DD format)
        city: City name (optional)
        state: State abbreviation (optional)
        monthly_rent: Monthly rental income (optional)
        
    Returns:
        Confirmation message with property details
    """
    service = get_portfolio_service()
    user_id = "current-user-id"  # Get from context
    
    # Check if user has any portfolios
    portfolios = service.get_portfolios(user_id)
    
    if not portfolios:
        # Auto-create default portfolio
        portfolio_id = service.create_portfolio(
            user_id=user_id,
            name="My Properties",
            description="Auto-created portfolio"
        )
    else:
        portfolio_id = portfolios[0]["id"]
    
    # Add property
    property_data = {
        "address": address,
        "purchase_price": purchase_price,
        "purchase_date": purchase_date,
        "city": city,
        "state": state,
        "monthly_rent": monthly_rent,
        **kwargs
    }
    
    result = service.add_property(portfolio_id, property_data)
    
    return f"✅ Added {address} to your portfolio! Purchase price: ${purchase_price:,.0f}"
```

**Register in**: `DataLayer/app/services/tool_router.py`

### Next Step 2: Inject Portfolio Context into Agent

**Location**: `DataLayer/app/services/agent/graph.py` or similar

When user clicks portfolio button, fetch portfolio summary and add to agent state:

```python
async def get_portfolio_context(user_id: str) -> str:
    """Get portfolio summary for agent context"""
    service = get_portfolio_service()
    portfolios = service.get_portfolios(user_id)
    
    if not portfolios:
        return "User has no properties yet. Help them add their first property."
    
    # Get first portfolio summary
    summary = service.get_portfolio_summary(portfolios[0]["id"])
    
    context = f"""
User's Portfolio:
- {len(summary['properties'])} properties
- Total value: ${summary['metrics']['total_value']:,.0f}
- Monthly cash flow: ${summary['metrics']['net_cash_flow']:,.0f}

Properties:
{[f"- {p['address']} (${p['purchase_price']:,.0f})" for p in summary['properties']]}

Use this context when answering questions about investments, comparisons, or recommendations.
"""
    return context
```

### Next Step 3: Update Frontend to Fetch Portfolio Status

**Location**: `src/components/desktop-shell/ChatTabView.tsx`

```typescript
const [hasPortfolio, setHasPortfolio] = useState<boolean | null>(null);

useEffect(() => {
  // Check if user has portfolio
  getPortfolios()
    .then(res => setHasPortfolio(res.portfolios.length > 0))
    .catch(() => setHasPortfolio(false));
}, []);

const handlePortfolioContext = () => {
  if (hasPortfolio) {
    // Fetch and inject portfolio context
    getPortfolios().then(res => {
      const portfolio = res.portfolios[0];
      getPortfolioSummary(portfolio.id).then(summary => {
        const contextMsg = `Review my portfolio (${summary.properties.length} properties). `;
        composerRef.current?.setInput(contextMsg);
      });
    });
  } else {
    // Guide new user
    composerRef.current?.setInput("I want to add my first property to start tracking my portfolio. ");
  }
  composerRef.current?.focus();
};
```

---

## 💡 User Experience Flow

### New User (No Portfolio):
1. User lands on Portfolio tab → sees empty state
2. Clicks "Go to Chat"
3. Sees 🏠 Portfolio button in composer
4. Clicks button → Input pre-fills: "I want to add my first property..."
5. User continues: "...at 123 Main St, Austin"
6. Agent calls `add_property_to_portfolio` tool
7. Auto-creates portfolio + adds property
8. Returns: "✅ Added 123 Main St to your portfolio!"

### Existing User (Has Portfolio):
1. User in chat, clicks 🏠 Portfolio button
2. Input pre-fills: "Help me manage my portfolio (3 properties)"
3. Agent loads portfolio context into memory
4. User asks: "Should I sell my Austin property?"
5. Agent responds with context: "Based on your Austin property at 123 Main St (purchased for $450k, currently worth $520k)..."

### Context Injection (Key Feature):
- Once portfolio is loaded, agent remembers it for the session
- User asks unrelated question: "Find me a new property in Dallas"
- Agent compares to portfolio: "Dallas has higher cash flow than your Austin property..."
- Personalized recommendations based on existing investments

---

## 🎯 Why This Is Better

1. **AI-First**: Chat is the primary interface, not forms
2. **Context-Aware**: LLM knows about portfolio across all conversations
3. **Progressive**: New users aren't overwhelmed with forms
4. **Flexible**: Power users can still use forms if needed
5. **Smart**: Agent compares new opportunities to existing portfolio

---

## 📝 Implementation Checklist

- [x] Portfolio button in Composer UI
- [x] Portfolio context handler in ChatTabView
- [x] Empty state redirects to chat
- [x] Backend API authentication fixed
- [ ] Create `add_property_to_portfolio` tool
- [ ] Register tool in agent
- [ ] Implement portfolio context injection
- [ ] Fetch user portfolio status on mount
- [ ] Test full new user flow
- [ ] Test existing user flow
- [ ] Test context injection across conversations
