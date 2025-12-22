# Property Management Features

## 🔖 Bookmarks

Save and organize your favorite properties for later review.

### Features:
- ✅ Persistent storage (survives browser refresh)
- ✅ Add/remove bookmarks
- ✅ Optional notes per property
- ✅ Timestamp tracking
- ✅ Quick access

### Usage:
```tsx
import { useBookmarksStore, BookmarkedProperty } from '@/stores/bookmarksStore';

function PropertyCard({ property }) {
  const { addBookmark, removeBookmark, isBookmarked } =use BookmarksStore();
  
  const bookmarked = isBookmarked(property.id);
  
  const handleToggle = () => {
    if (bookmarked) {
      removeBookmark(property.id);
    } else {
      addBookmark({
        id: property.id,
        address: property.address,
        price: property.price,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        sqft: property.sqft,
        thumbnail: property.photos?.[0],
      });
    }
  };
  
  return (
    <button onClick={handleToggle}>
      {bookmarked ? '★' : '☆'}
    </button>
  );
}
```

## 📊 Property Comparison

Compare up to 3 properties side-by-side with automatic best-value highlighting.

### Features:
- ✅ Side-by-side table comparison
- ✅ Best value highlighting (teal indicators)
- ✅ Export to PDF
- ✅ Remove individual properties
- ✅ Clear all
- ✅ Responsive design

### Metrics Compared:
- Price
- Bedrooms / Bathrooms
- Square Footage
- Year Built
- Monthly Rent (estimated)
- Cash Flow (monthly)
- CoC Return %
- Cap Rate %

### Usage:
```tsx
import { useComparisonStore } from '@/stores/comparisonStore';
import { PropertyComparisonModal } from '@/components/comparison/PropertyComparisonModal';

function PropertyList() {
  const { selectedProperties, addToComparison } = useComparisonStore();
  const [showComparison, setShowComparison] = useState(false);
  
  return (
    <>
      {selectedProperties.length > 0 && (
        <button onClick={() => setShowComparison(true)}>
          Compare ({selectedProperties.length})
        </button>
      )}
      
      <PropertyComparisonModal 
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
      />
    </>
  );
}
```

## 📄 PDF Export

Export property comparisons as professional PDF reports.

### Features:
- ✅ Automatic formatting
- ✅ Page breaks
- ✅ Summary statistics
- ✅ Branded footer
- ✅ Timestamp
- ✅ All comparison metrics

### Usage:
```tsx
import { exportComparisonToPDF } from '@/utils/pdfExport';

async function handleExport() {
  try {
    await exportComparisonToPDF(selectedProperties);
    // PDF downloads automatically
  } catch (error) {
    console.error('Export failed:', error);
  }
}
```

### PDF Contents:
1. **Header**: Title, date, property count
2. **Property Details**: Full metrics for each property
3. **Summary**: Best/worst values, averages
4. **Footer**: Civitas AI branding

### Sample Output:
```
Property Comparison Report
Generated: 12/21/2025
Comparing 3 properties

Property 1: 123 Main St, Austin, TX
  Price: $450,000
  Bedrooms: 3
  Bathrooms: 2
  Square Feet: 1,800
  Monthly Rent: $2,200
  Cash Flow: +$450
  CoC Return: 8.5%
  
Property 2: 456 Oak Ave, Dallas, TX
  ...
  
Comparison Summary:
  Lowest Price: $425,000
  Highest Price: $475,000
  Best Cash Flow: $520/mo
```

## 🎨 UI Components

### Comparison Button
```tsx
// Automatically appears when properties selected
<button className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20...">
  <GitCompare /> Compare (2)
</button>
```

### Bookmark Button
```tsx
<button className={bookmarked ? 'text-yellow-400' : 'text-white/40'}>
  {bookmarked ? <Star fill="currentColor" /> : <Star />}
</button>
```

## 🔧 Installation

### Required Dependencies:
```bash
npm install jspdf zustand
```

### Optional (if using persistence):
```bash
npm install zustand/middleware
```

## 📱 Mobile Considerations

- Comparison modal scrolls horizontally
- PDF export works on mobile browsers
- Bookmarks stored locally per device
- Touch-friendly buttons and checkboxes

## 🎯 Best Practices

1. **Limit Comparisons**: Max 3 properties for readability
2. **Clear Filters**: Provide clear visual feedback
3. **Export Naming**: Use timestamps in filenames
4. **Error Handling**: Graceful failures for PDF export
5. **Performance**: Use dynamic imports for jsPDF

## 🐛 Troubleshooting

### PDF Export Not Working:
```bash
# Ensure jsPDF is installed
npm install jspdf

# Check browser console for errors
# Try clearing browser cache
```

### Bookmarks Not Persisting:
```javascript
// Check localStorage availability
if (typeof window !== 'undefined' && window.localStorage) {
  // Bookmarks will work
}
```

### Comparison Not Showing:
- Ensure properties have `listing_id`
- Check `selectedProperties` in store
- Verify comparison modal is rendered

## 🚀 Future Enhancements

- [ ] Email PDF reports
- [ ] Share comparison links
- [ ] Bookmark folders/tags
- [ ] Export to Excel/CSV
- [ ] Comparison charts/graphs
- [ ] Saved comparison templates
- [ ] Print-optimized layouts
- [ ] Property alerts
- [ ] Collaborative comparisons

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-21  
**Maintainer**: Civitas AI Team
