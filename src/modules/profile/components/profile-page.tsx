"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useProfile } from "../hooks/use-profile";
import { UserProfile } from "../types/profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function ProfilePage() {
  const t = useTranslations("Profile");
  const { profile, isLoading, isError, updateProfile, isUpdating } = useProfile();
  const [formData, setFormData] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !formData) {
    return (
      <div className="text-center text-destructive p-8">
        {t("errorLoading", { defaultValue: "خطا در دریافت اطلاعات" })}
      </div>
    );
  }

  const handleChange = (section: keyof UserProfile, field: string, value: any) => {
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };
    });
  };

  const handleSave = () => {
    if (formData) {
      updateProfile(formData);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title", { defaultValue: "اطلاعات کاربری" })}</h1>
        <p className="text-muted-foreground mt-2">
          {t("subtitle", { defaultValue: "مدیریت اطلاعات حساب کاربری و تنظیمات شخصی" })}
        </p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
          <TabsTrigger value="personal">{t("tabs.personal", { defaultValue: "اطلاعات شخصی" })}</TabsTrigger>
          <TabsTrigger value="organizational">{t("tabs.organizational", { defaultValue: "اطلاعات سازمانی" })}</TabsTrigger>
          <TabsTrigger value="skills">{t("tabs.skills", { defaultValue: "مهارت‌ها" })}</TabsTrigger>
          <TabsTrigger value="insurance">{t("tabs.insurance", { defaultValue: "اطلاعات بیمه" })}</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>{t("tabs.personal", { defaultValue: "اطلاعات شخصی" })}</CardTitle>
              <CardDescription>
                {t("descriptions.personal", { defaultValue: "اطلاعات هویتی و راه‌های ارتباطی خود را در این بخش مدیریت کنید." })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("fields.firstName", { defaultValue: "نام" })}</Label>
                  <Input 
                    id="firstName" 
                    value={formData.personal.firstName} 
                    onChange={(e) => handleChange("personal", "firstName", e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("fields.lastName", { defaultValue: "نام خانوادگی" })}</Label>
                  <Input 
                    id="lastName" 
                    value={formData.personal.lastName} 
                    onChange={(e) => handleChange("personal", "lastName", e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationalId">{t("fields.nationalId", { defaultValue: "کد ملی" })}</Label>
                  <Input 
                    id="nationalId" 
                    value={formData.personal.nationalId} 
                    onChange={(e) => handleChange("personal", "nationalId", e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">{t("fields.birthDate", { defaultValue: "تاریخ تولد" })}</Label>
                  <Input 
                    id="birthDate" 
                    value={formData.personal.birthDate} 
                    onChange={(e) => handleChange("personal", "birthDate", e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("fields.phone", { defaultValue: "شماره موبایل" })}</Label>
                  <Input 
                    id="phone" 
                    value={formData.personal.phone} 
                    onChange={(e) => handleChange("personal", "phone", e.target.value)} 
                    className="ltr text-left font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("fields.email", { defaultValue: "پست الکترونیک" })}</Label>
                  <Input 
                    id="email" 
                    value={formData.personal.email} 
                    onChange={(e) => handleChange("personal", "email", e.target.value)} 
                    className="ltr text-left font-mono"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">{t("fields.address", { defaultValue: "آدرس" })}</Label>
                  <Input 
                    id="address" 
                    value={formData.personal.address} 
                    onChange={(e) => handleChange("personal", "address", e.target.value)} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizational">
          <Card>
            <CardHeader>
              <CardTitle>{t("tabs.organizational", { defaultValue: "اطلاعات سازمانی" })}</CardTitle>
              <CardDescription>
                {t("descriptions.organizational", { defaultValue: "موقعیت شغلی و اطلاعات شما در ساختار شرکت." })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">{t("fields.department", { defaultValue: "دپارتمان / واحد" })}</Label>
                  <Input 
                    id="department" 
                    value={formData.organizational.department} 
                    onChange={(e) => handleChange("organizational", "department", e.target.value)} 
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">{t("fields.role", { defaultValue: "سمت شغلی" })}</Label>
                  <Input 
                    id="role" 
                    value={formData.organizational.role} 
                    onChange={(e) => handleChange("organizational", "role", e.target.value)} 
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId">{t("fields.employeeId", { defaultValue: "شماره پرسنلی" })}</Label>
                  <Input 
                    id="employeeId" 
                    value={formData.organizational.employeeId} 
                    onChange={(e) => handleChange("organizational", "employeeId", e.target.value)} 
                    disabled
                    className="ltr text-left font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joinDate">{t("fields.joinDate", { defaultValue: "تاریخ شروع به کار" })}</Label>
                  <Input 
                    id="joinDate" 
                    value={formData.organizational.joinDate} 
                    onChange={(e) => handleChange("organizational", "joinDate", e.target.value)} 
                    disabled
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="manager">{t("fields.manager", { defaultValue: "مدیر مستقیم" })}</Label>
                  <Input 
                    id="manager" 
                    value={formData.organizational.manager} 
                    onChange={(e) => handleChange("organizational", "manager", e.target.value)} 
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>{t("tabs.skills", { defaultValue: "مهارت‌ها" })}</CardTitle>
              <CardDescription>
                {t("descriptions.skills", { defaultValue: "مهارت‌های فنی و نرم خود را اینجا ثبت کنید." })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.skills.map((skill, index) => (
                  <div key={skill.id} className="flex items-center gap-4">
                    <Input 
                      value={skill.name} 
                      readOnly
                      className="flex-1"
                    />
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div 
                          key={level} 
                          className={`size-4 rounded-full ${level <= skill.level ? 'bg-primary' : 'bg-muted'}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4" disabled>
                  {t("actions.addSkill", { defaultValue: "افزودن مهارت جدید" })}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insurance">
          <Card>
            <CardHeader>
              <CardTitle>{t("tabs.insurance", { defaultValue: "اطلاعات بیمه" })}</CardTitle>
              <CardDescription>
                {t("descriptions.insurance", { defaultValue: "سوابق و اطلاعات بیمه درمانی و تامین اجتماعی." })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">{t("fields.provider", { defaultValue: "شرکت بیمه‌گر" })}</Label>
                  <Input 
                    id="provider" 
                    value={formData.insurance.provider} 
                    onChange={(e) => handleChange("insurance", "provider", e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">{t("fields.type", { defaultValue: "نوع بیمه" })}</Label>
                  <Input 
                    id="type" 
                    value={formData.insurance.type} 
                    onChange={(e) => handleChange("insurance", "type", e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceCode">{t("fields.insuranceCode", { defaultValue: "شماره بیمه" })}</Label>
                  <Input 
                    id="insuranceCode" 
                    value={formData.insurance.insuranceCode} 
                    onChange={(e) => handleChange("insurance", "insuranceCode", e.target.value)} 
                    className="ltr text-left font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">{t("fields.validUntil", { defaultValue: "تاریخ اعتبار" })}</Label>
                  <Input 
                    id="validUntil" 
                    value={formData.insurance.validUntil} 
                    onChange={(e) => handleChange("insurance", "validUntil", e.target.value)} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={isUpdating} className="w-full sm:w-auto px-8">
          {isUpdating && <Loader2 className="mr-2 size-4 animate-spin" />}
          {t("actions.save", { defaultValue: "ذخیره تغییرات" })}
        </Button>
      </div>
    </div>
  );
}
