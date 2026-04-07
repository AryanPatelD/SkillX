import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Alert, AlertDescription, AlertTitle } from './ui/Alert';
import { Input } from './ui/Input';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Search,
  LogOut,
  User,
  Settings,
  Menu
} from 'lucide-react';

/**
 * Example component demonstrating shadcn/ui components with lucide-react icons
 * 
 * Usage Examples:
 * - Button with icon: <Button size="icon"><Plus size={18} /></Button>
 * - Card layout: Wrap content in Card with CardHeader, CardContent
 * - Alert notification: Use Alert with variant="success" | "destructive" | "default"
 * - Input field: <Input type="text" placeholder="Search..." />
 */
export const UIComponentsExample = () => {
  return (
    <div className="space-y-6 p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Button Examples */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Button Variants</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="default">Default Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Delete</Button>
          <Button variant="link">Link Button</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon"><Plus size={18} /></Button>
        </div>
      </div>

      {/* Card Example */}
      <Card>
        <CardHeader>
          <CardTitle>Card Component</CardTitle>
          <CardDescription>Using shadcn/ui Card component with lucide icons</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Search..." />
            <Button size="icon"><Search size={18} /></Button>
          </div>
          <p>This is a card content area with shadcn/ui styling.</p>
        </CardContent>
      </Card>

      {/* Alert Examples */}
      <div className="space-y-3">
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>Your changes have been saved successfully.</AlertDescription>
        </Alert>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong. Please try again.</AlertDescription>
        </Alert>

        <Alert variant="default">
          <Info className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>This is an informational alert message.</AlertDescription>
        </Alert>
      </div>

      {/* Icon Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Lucide Icons</CardTitle>
          <CardDescription>Common icons used in the application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            <div className="flex flex-col items-center gap-2">
              <Plus className="w-6 h-6 text-primary" />
              <span className="text-xs text-muted-foreground">Plus</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Edit2 className="w-6 h-6 text-primary" />
              <span className="text-xs text-muted-foreground">Edit</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Trash2 className="w-6 h-6 text-destructive" />
              <span className="text-xs text-muted-foreground">Delete</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Save className="w-6 h-6 text-primary" />
              <span className="text-xs text-muted-foreground">Save</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <X className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Close</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              <span className="text-xs text-muted-foreground">User</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              <span className="text-xs text-muted-foreground">Settings</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Menu className="w-6 h-6 text-primary" />
              <span className="text-xs text-muted-foreground">Menu</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UIComponentsExample;
