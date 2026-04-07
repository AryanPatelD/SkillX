# shadcn/ui Integration Guide

## ✅ Installation Complete

Your frontend now has full shadcn/ui integration with Tailwind CSS and lucide-react icons.

### What's Installed:
- ✅ Tailwind CSS (v3)
- ✅ shadcn/ui components (custom implementation)
- ✅ class-variance-authority (for component variants)
- ✅ clsx (for class composition)
- ✅ lucide-react icons (already present)

### New Components Available:

#### 1. **Button Component**
```jsx
import { Button } from '@/components/ui';
import { Plus, Save, Trash2 } from 'lucide-react';

// Basic button
<Button>Click me</Button>

// With variants
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Plus size={18} /></Button>

// Full example
<Button 
  onClick={handleClick}
  className="gap-2"
>
  <Save size={16} />
  Save Changes
</Button>
```

#### 2. **Card Component**
```jsx
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>My Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Your content here */}
  </CardContent>
  <CardFooter>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

#### 3. **Alert Component**
```jsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui';
import { AlertCircle, CheckCircle } from 'lucide-react';

// Success alert
<Alert variant="success">
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Operation completed successfully</AlertDescription>
</Alert>

// Error alert
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong</AlertDescription>
</Alert>
```

#### 4. **Input Component**
```jsx
import { Input } from '@/components/ui';

<Input 
  type="text"
  placeholder="Enter text..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

#### 5. **Dialog Component**
```jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent onClose={() => setIsOpen(false)}>
    <DialogHeader>
      <DialogTitle>Edit Request</DialogTitle>
      <DialogDescription>Make changes to your request</DialogDescription>
    </DialogHeader>
    {/* Form content */}
  </DialogContent>
</Dialog>
```

### Common Lucide Icons (Already Available):

```jsx
import {
  Plus,           // Add new item
  Edit2,          // Edit
  Trash2,         // Delete
  Save,           // Save changes
  X,              // Close
  CheckCircle,    // Success
  AlertCircle,    // Warning/Error
  Info,           // Information
  Search,         // Search
  LogOut,         // Logout
  User,           // Profile
  Settings,       // Settings
  Menu,           // Menu
  BookOpen,       // Lessons/Books
  Calendar,       // Dates/Schedule
  Clock,          // Time
  MessageCircle,  // Messages
  Heart,          // Favorites
  Star,           // Rating
  Users,          // People/Groups
  TrendingUp,     // Analytics/Progress
} from 'lucide-react';
```

---

## 🔄 Migration Steps for Existing Pages

### Before (Old Style):
```jsx
// Using inline styles and hardcoded classes
<div style={{
  padding: '1rem 1.5rem',
  borderRadius: '0.5rem',
  background: '#dcfce7',
  border: '2px solid #86efac',
}}>
  <button style={{...}}>Save</button>
</div>
```

### After (shadcn/ui):
```jsx
// Clean, reusable components
<Card>
  <CardContent>
    <Button variant="default">Save</Button>
  </CardContent>
</Card>
```

---

## 📝 Example: Update Dashboard Page

### Step 1: Import components
```jsx
import { Button, Card, CardContent, Alert, AlertTitle, AlertDescription } from '@/components/ui';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
```

### Step 2: Replace inline styled buttons
```jsx
// Old
<button className="btn btn-primary">Save</button>

// New
<Button variant="default">Save</Button>
```

### Step 3: Replace custom cards with UI Cards
```jsx
// Old
<div className="card glass-panel">...</div>

// New
<Card>
  <CardContent>...</CardContent>
</Card>
```

### Step 4: Use Button with icons
```jsx
// Replace inline SVG/icons
<button className="btn btn-secondary btn-sm" style={...}>
  <Edit2 size={14} />
</button>

// With
<Button variant="secondary" size="sm">
  <Edit2 size={16} />
</Button>
```

---

## 🎨 Tailwind CSS Classes

### Utility Classes Now Available:

```jsx
// Spacing
<div className="p-4 m-2 gap-3">

// Text
<h1 className="text-2xl font-bold">

// Colors
<div className="bg-primary text-primary-foreground">
<div className="text-muted-foreground">
<div className="border border-input">

// Responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Flexbox
<div className="flex items-center justify-between gap-2">

// Gradients
<div className="bg-gradient-to-r from-primary to-secondary">
```

---

## 📂 File Structure

```
frontend/src/
├── components/
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Alert.jsx
│   │   ├── Dialog.jsx
│   │   ├── Input.jsx
│   │   └── index.js
│   ├── UIComponentsExample.jsx
│   ├── Navbar.jsx
│   └── ...
├── lib/
│   └── utils.js
├── App.jsx
├── index.css
└── main.jsx
```

---

## 🚀 Next Steps

1. **View Example**: Check `UIComponentsExample.jsx` to see all components in action
2. **Start Migrating**: Update your pages one at a time
3. **Use Tailwind**: Replace inline styles with Tailwind classes where possible
4. **Consistency**: Use the same component variants across pages

---

## 💡 Tips

- Always use `size="icon"` for icon-only buttons
- Use `variant="destructive"` for delete actions
- Combine `gap-2` with Flexbox for icon + text spacing
- Use `className="gap-3"` instead of `style={{ gap: '...' }}`
- Add `flex items-center` to keep icons vertically centered with text

---

## 📚 Resources

- [Tailwind CSS Docs](https://tailwindcss.com)
- [lucide-react Icons](https://lucide.dev)
- [shadcn/ui Original](https://ui.shadcn.com)
- [class-variance-authority](https://cva.style)

---

Enjoy your new shadcn/ui components! 🎉
