# Portfolio Integrations - Priority & Implementation Order

## 🎯 MVP: Ship in 1 Week

### Week 1: CSV Import Only

**Why start with CSV?**
- ✅ Universal (everyone can export CSV)
- ✅ No OAuth complexity
- ✅ No API dependencies
- ✅ Instant value
- ✅ Easy to test

**What to build**:
1. Replace 🏠 button with 🔗 button (chain link)
2. Simple modal with file upload
3. Backend CSV parser
4. Property creation from CSV
5. Download template link

**User flow**:
```
Click 🔗 → Modal opens → [Upload CSV] 
→ Select file → Preview (25 properties found) 
→ [Import] → ✅ Success
```

**Time estimate**: 2-3 days

---

## 📊 Priority Matrix

### High Priority (Build Next)

| Integration | Effort | Impact | Users | Timeline |
|-------------|--------|--------|-------|----------|
| **CSV Import** | Low | High | All users | Week 1 |
| **Excel (.xlsx)** | Low | High | Most users | Week 2 |
| **Stessa** | High | High | Serious investors | Week 3-4 |
| **PDF Extraction** | Medium | Medium | Power users | Week 5 |

### Medium Priority (Later)

| Integration | Effort | Impact | Users | Timeline |
|-------------|--------|--------|-------|----------|
| **Buildium** | High | Medium | PM companies | Month 2 |
| **REIwise** | Medium | Medium | Wholesalers | Month 2 |
| **QuickBooks** | Medium | Low | Accountants | Month 3 |

### Low Priority (Future)

| Integration | Effort | Impact | Users | Timeline |
|-------------|--------|--------|-------|----------|
| **AppFolio** | High | Low | Enterprise | Month 4+ |
| **Cozy** | Medium | Low | Small landlords | Month 4+ |
| **Google Sheets** | Low | Low | Niche | Backlog |

---

## 🚀 Implementation Roadmap

### Sprint 1 (Week 1): CSV Foundation
**Goal**: Users can upload CSV and import properties

- [ ] Create `IntegrationsModal` component
- [ ] Replace portfolio button with connectors button
- [ ] File upload UI with drag-and-drop
- [ ] CSV parser (Python backend)
- [ ] Property validation & preview
- [ ] Bulk property creation
- [ ] Success/error messaging
- [ ] Provide downloadable CSV template

**Deliverable**: Working CSV import

---

### Sprint 2 (Week 2): Polish & Excel
**Goal**: Better UX + Excel support

- [ ] Excel parser (same as CSV logic)
- [ ] Column mapping UI (if headers don't match)
- [ ] Field validation (address, price, date formats)
- [ ] Error handling (skip invalid rows)
- [ ] Progress indicator for large files
- [ ] Duplicate detection

**Deliverable**: Production-ready file import

---

### Sprint 3 (Week 3-4): Stessa Integration
**Goal**: First API integration

- [ ] OAuth manager service
- [ ] Stessa API client
- [ ] OAuth flow (redirect → callback)
- [ ] Property sync logic
- [ ] Token refresh handling
- [ ] Background sync scheduler
- [ ] Connected accounts UI
- [ ] Disconnect flow

**Deliverable**: Stessa integration live

---

### Sprint 4 (Week 5): PDF Extraction (AI)
**Goal**: Parse PDFs with Vision API

- [ ] PDF upload handling
- [ ] Vision API integration
- [ ] LLM-based data extraction
- [ ] Preview extracted data
- [ ] Manual correction UI
- [ ] Save to portfolio

**Deliverable**: PDF import working

---

## 📋 CSV Template Design

### Standard CSV Format

```csv
address,city,state,zip,purchase_price,purchase_date,monthly_rent,property_type,bedrooms,bathrooms,square_feet,notes
123 Main St,Austin,TX,78701,450000,2024-01-15,2500,Single Family,3,2,1800,Great location
456 Oak Ave,Dallas,TX,75201,380000,2023-12-01,2200,Condo,2,2,1200,Downtown condo
```

### Optional Fields

User can include any of these (we'll ignore unknown columns):
- `loan_amount`
- `interest_rate`
- `property_tax`
- `insurance`
- `hoa_fees`
- `management_fee`
- `current_value`

### Flexible Parsing

If headers don't match exactly, we'll use fuzzy matching:
- "Address" → `address`
- "Purchase Price" → `purchase_price`
- "Rent" → `monthly_rent`

---

## 🎨 UI Mockup: Connectors Modal (MVP)

```
┌────────────────────────────────────────────────┐
│  Import Your Portfolio                   [✕]   │
├────────────────────────────────────────────────┤
│                                                 │
│  Get started by uploading a spreadsheet        │
│                                                 │
│  ┌──────────────────────────────────────────┐ │
│  │                                           │ │
│  │        📄 Drag & drop CSV or Excel       │ │
│  │              or click to browse          │ │
│  │                                           │ │
│  │          [ Choose File ]                 │ │
│  │                                           │ │
│  └──────────────────────────────────────────┘ │
│                                                 │
│  Need help? [Download CSV Template]            │
│                                                 │
│  ────────────── or ──────────────              │
│                                                 │
│  💬 Tell me about your properties in chat      │
│      [ Start Conversation → ]                  │
│                                                 │
└────────────────────────────────────────────────┘
```

**After file selected**:

```
┌────────────────────────────────────────────────┐
│  Import Your Portfolio                   [✕]   │
├────────────────────────────────────────────────┤
│                                                 │
│  ✅ portfolio.csv                               │
│                                                 │
│  Preview:                                      │
│  ┌──────────────────────────────────────────┐ │
│  │  Found 25 properties                     │ │
│  │                                           │ │
│  │  ✓ 123 Main St, Austin TX - $450,000    │ │
│  │  ✓ 456 Oak Ave, Dallas TX - $380,000    │ │
│  │  ✓ 789 Pine Rd, Houston TX - $525,000   │ │
│  │  ... and 22 more                         │ │
│  │                                           │ │
│  │  ⚠ 2 properties have missing dates      │ │
│  └──────────────────────────────────────────┘ │
│                                                 │
│  [ Cancel ]              [ Import 25 → ]       │
│                                                 │
└────────────────────────────────────────────────┘
```

---

## 🔧 Technical Specs: CSV Parser

### Backend Endpoint

```python
# POST /api/integrations/import/csv

from fastapi import UploadFile
import pandas as pd
from app.services.portfolio_service import get_portfolio_service

@router.post("/import/csv")
async def import_csv(
    file: UploadFile,
    user_info: Dict = Depends(get_current_user)
):
    """Import properties from CSV file"""
    
    # Read CSV
    df = pd.read_csv(file.file)
    
    # Normalize column names (lowercase, underscore)
    df.columns = df.columns.str.lower().str.replace(' ', '_')
    
    # Validate required columns
    required = ['address', 'purchase_price', 'purchase_date']
    missing = [col for col in required if col not in df.columns]
    if missing:
        raise HTTPException(400, f"Missing columns: {missing}")
    
    # Parse and validate
    properties = []
    errors = []
    
    for idx, row in df.iterrows():
        try:
            prop = {
                'address': row['address'],
                'purchase_price': float(row['purchase_price']),
                'purchase_date': row['purchase_date'],
                # Optional fields
                'city': row.get('city'),
                'state': row.get('state'),
                'monthly_rent': float(row.get('monthly_rent', 0)),
                # ... more fields
            }
            properties.append(prop)
        except Exception as e:
            errors.append(f"Row {idx + 2}: {str(e)}")
    
    # Create portfolio if needed
    service = get_portfolio_service()
    user_id = user_info.get('uid')
    portfolios = service.get_portfolios(user_id)
    
    if not portfolios:
        portfolio_id = service.create_portfolio(
            user_id=user_id,
            name="Imported Portfolio",
            description=f"Imported from CSV on {datetime.now()}"
        )
    else:
        portfolio_id = portfolios[0]['portfolio_id']
    
    # Bulk add properties
    added = []
    for prop in properties:
        try:
            result = service.add_property(portfolio_id, prop)
            added.append(result)
        except Exception as e:
            errors.append(f"{prop['address']}: {str(e)}")
    
    return {
        'success': True,
        'imported': len(added),
        'errors': errors,
        'portfolio_id': portfolio_id
    }
```

---

## 📱 Frontend Component

```tsx
// src/components/integrations/IntegrationsModal.tsx

import { useState } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';

export const IntegrationsModal = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      // Parse locally for preview
      parseCSVPreview(selected).then(setPreview);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/integrations/import/csv', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success toast
        alert(`✅ Imported ${result.imported} properties!`);
        onClose();
      }
    } catch (error) {
      alert('Import failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal">
      {!file ? (
        // File picker UI
        <div className="dropzone">
          <FileSpreadsheet />
          <p>Drag & drop CSV or Excel</p>
          <input type="file" accept=".csv,.xlsx" onChange={handleFileSelect} />
        </div>
      ) : (
        // Preview UI
        <div className="preview">
          <h3>Found {preview.count} properties</h3>
          <ul>
            {preview.sample.map(prop => (
              <li key={prop.address}>
                {prop.address} - ${prop.purchase_price.toLocaleString()}
              </li>
            ))}
          </ul>
          <button onClick={handleImport} disabled={uploading}>
            {uploading ? 'Importing...' : `Import ${preview.count} →`}
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## 🎯 Success Criteria

### Week 1 (MVP):
- [ ] CSV import works end-to-end
- [ ] Template downloadable
- [ ] Preview shows properties
- [ ] Errors handled gracefully
- [ ] Tested with 100+ property CSV

### Week 2:
- [ ] Excel support added
- [ ] Column mapping works
- [ ] Duplicate detection
- [ ] 90%+ import success rate

---

## 💬 Marketing Copy

**Empty State CTA**:
> "Import your portfolio in seconds. Upload a spreadsheet or connect your property management tool."

**Button Tooltip**:
> "Connect Data - Import from CSV, Excel, or your property management software"

**Success Message**:
> "🎉 Success! Imported 25 properties. View your portfolio dashboard →"

---

Ready to start with CSV import? It's the fastest path to value! 🚀
