import { Button } from "@/components/ui/shadcn.components/button.shadcn"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/shadcn.components/card.shadcn"
import { Input } from "@/components/ui/shadcn.components/input.shadcn"
import { Label } from "@/components/ui/shadcn.components/label.shadcn"

export default function TestShadcnPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>تست shadcn/ui</CardTitle>
          <CardDescription>کامپوننت‌ها با موفقیت نصب شدن</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <Input id="email" type="email" placeholder="example@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">رمز عبور</Label>
            <Input id="password" type="password" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">انصراف</Button>
          <Button>ورود</Button>
        </CardFooter>
      </Card>
    </div>
  )
}