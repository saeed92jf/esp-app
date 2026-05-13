"use client"

import { useState } from "react"
import { Button } from "@/components/ui/shadcn.components/button.shadcn"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/shadcn.components/card.shadcn"
import { Input } from "@/components/ui/shadcn.components/input.shadcn"
import { Label } from "@/components/ui/shadcn.components/label.shadcn"
import { Checkbox } from "@/components/ui/shadcn.components/checkbox.shadcn"
import { Switch } from "@/components/ui/shadcn.components/switch.shadcn"
import { Textarea } from "@/components/ui/shadcn.components/textarea.shadcn"
import { Badge } from "@/components/ui/shadcn.components/badge.shadcn"
import { Separator } from "@/components/ui/shadcn.components/separator.shadcn"
import { Skeleton } from "@/components/ui/shadcn.components/skeleton.shadcn"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/shadcn.components/tabs.shadcn"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn.components/select.shadcn"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/shadcn.components/dialog.shadcn"

export default function TestComponentsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCity, setSelectedCity] = useState("")

  return (
    <div className="container mx-auto py-10 space-y-10">
      <h1 className="text-3xl font-bold text-center">shadcn/ui Components Test</h1>
      <p className="text-center text-muted-foreground">
        All components are using your custom color system
      </p>

      {/* Button Section */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Different button variants and sizes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button disabled>Disabled</Button>
            <Button isLoading>Loading</Button>
          </div>
        </CardContent>
      </Card>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Form Inputs</CardTitle>
          <CardDescription>Various input types and form elements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="textarea">Message</Label>
            <Textarea id="textarea" placeholder="Enter your message here..." />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms">Accept terms and conditions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="notifications" />
              <Label htmlFor="notifications">Enable notifications</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Select Dropdown */}
      <Card>
        <CardHeader>
          <CardTitle>Select Dropdown</CardTitle>
          <CardDescription>Native select component with options</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-full md:w-70">
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Iran Cities</SelectLabel>
                <SelectItem value="tehran">Tehran</SelectItem>
                <SelectItem value="isfahan">Isfahan</SelectItem>
                <SelectItem value="shiraz">Shiraz</SelectItem>
                <SelectItem value="mashhad">Mashhad</SelectItem>
                <SelectItem value="tabriz">Tabriz</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {selectedCity && (
            <p className="mt-4 text-sm text-muted-foreground">
              Selected city: <span className="font-medium">{selectedCity}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Status indicators and labels</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge className="bg-green-500 hover:bg-green-600">Success</Badge>
          <Badge className="bg-yellow-500 hover:bg-yellow-600">Warning</Badge>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tabs</CardTitle>
          <CardDescription>Switch between different content panels</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tab1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tab1">Profile</TabsTrigger>
              <TabsTrigger value="tab2">Settings</TabsTrigger>
              <TabsTrigger value="tab3">Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="p-4 border rounded-lg mt-4">
              <p>Profile content goes here. You can edit your personal information.</p>
            </TabsContent>
            <TabsContent value="tab2" className="p-4 border rounded-lg mt-4">
              <p>Settings content goes here. Configure your application preferences.</p>
            </TabsContent>
            <TabsContent value="tab3" className="p-4 border rounded-lg mt-4">
              <p>Notifications content goes here. Manage your alert settings.</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog Modal */}
      <Card>
        <CardHeader>
          <CardTitle>Dialog Modal</CardTitle>
          <CardDescription>Pop up modal for important actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogDescription>
                  Are you sure you want to perform this action? This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Skeleton Loading */}
      <Card>
        <CardHeader>
          <CardTitle>Skeleton Loading</CardTitle>
          <CardDescription>Loading placeholders for content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-62.5" />
                <Skeleton className="h-4 w-50" />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Separator */}
      <Separator />

      {/* Footer Buttons */}
      <div className="flex justify-center gap-4 pb-10">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  )
}