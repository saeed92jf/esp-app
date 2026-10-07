import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { User } from "../types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Combobox } from "@/components/ui/combobox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ShieldCheck, KeyRound, UserPlus, RefreshCw, Trash2, Mail, Phone, UserCircle2, Edit2, X, Users } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";

interface AdminUserConfigProps {
  selectedUser: User | null;
  users: User[];
  setUsers: (u: User[]) => void;
  setSelectedUser: (u: User) => void;
  availableModules?: any[];
  tMenu?: any;
  handleToggleModuleAccess?: (moduleId: string, checked: boolean) => void;
  handleToggleAllModulesAccess?: (checked: boolean) => void;
}

export function AdminUserConfig({ 
  selectedUser, users, setUsers, setSelectedUser,
  availableModules = [], tMenu, handleToggleModuleAccess, handleToggleAllModulesAccess 
}: AdminUserConfigProps) {
  const t = useTranslations("Admin");
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { confirm } = useConfirm();

  // State for Add User
  const [newUser, setNewUser] = useState<Partial<User>>({ 
    name: "", email: "", phone: "", department: "", role: "user",
    age: 25, maritalStatus: "single", childrenCount: 0,
    insuranceType: "none", educationDegree: "", educationField: ""
  });

  // State for Password Reset
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (isEditMode && selectedUser) {
      setNewUser({
        name: selectedUser.name || '',
        email: selectedUser.email || '',
        phone: selectedUser.phone || '',
        department: selectedUser.department || '',
        role: selectedUser.role || 'user',
        age: selectedUser.age || 25,
        maritalStatus: selectedUser.maritalStatus || 'single',
        childrenCount: selectedUser.childrenCount || 0,
        insuranceType: selectedUser.insuranceType || 'none',
        educationDegree: selectedUser.educationDegree || '',
        educationField: selectedUser.educationField || ''
      });
    }
  }, [selectedUser, isEditMode]);

  const handleToggleEditMode = () => {
    if (!isEditMode) {
      if (selectedUser) {
        setNewUser({
          name: selectedUser.name || '',
          email: selectedUser.email || '',
          phone: selectedUser.phone || '',
          department: selectedUser.department || '',
          role: selectedUser.role || 'user',
          age: selectedUser.age || 25,
          maritalStatus: selectedUser.maritalStatus || 'single',
          childrenCount: selectedUser.childrenCount || 0,
          insuranceType: selectedUser.insuranceType || 'none',
          educationDegree: selectedUser.educationDegree || '',
          educationField: selectedUser.educationField || ''
        });
      }
      setIsEditMode(true);
    } else {
      setNewUser({ 
        name: "", email: "", phone: "", department: "", role: "user",
        age: 25, maritalStatus: "single", childrenCount: 0,
        insuranceType: "none", educationDegree: "", educationField: ""
      });
      setIsEditMode(false);
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      toast.error(t("fillRequiredFields"));
      return;
    }

    if (isEditMode && selectedUser) {
      const updatedUser: User = {
        ...selectedUser,
        name: newUser.name || '',
        email: newUser.email || '',
        phone: newUser.phone,
        department: newUser.department,
        role: newUser.role as 'admin' | 'user',
        age: newUser.age,
        maritalStatus: newUser.maritalStatus,
        childrenCount: newUser.childrenCount,
        insuranceType: newUser.insuranceType,
        educationDegree: newUser.educationDegree,
        educationField: newUser.educationField
      };
      const newUsers = users.map(u => u.id === selectedUser.id ? updatedUser : u);
      setUsers(newUsers);
      setSelectedUser(updatedUser);
      setIsEditMode(false);
      setNewUser({ 
        name: "", email: "", phone: "", department: "", role: "user",
        age: 25, maritalStatus: "single", childrenCount: 0,
        insuranceType: "none", educationDegree: "", educationField: ""
      });
      toast.success(t("userUpdatedSuccess"));
      return;
    }

    const createdUser: User = {
      id: `u_${Date.now()}`,
      name: newUser.name || '',
      email: newUser.email || '',
      phone: newUser.phone,
      department: newUser.department,
      role: newUser.role as 'admin' | 'user',
      age: newUser.age,
      maritalStatus: newUser.maritalStatus,
      childrenCount: newUser.childrenCount,
      insuranceType: newUser.insuranceType,
      educationDegree: newUser.educationDegree,
      educationField: newUser.educationField,
      status: 'offline',
      avatar: '',
      daysInCompany: 0,
      doneProjects: 0,
      salary: 10000,
      modulesAccess: [],
      recentActivities: [],
      checklists: []
    };
    const newUsers = [createdUser, ...users];
    setUsers(newUsers);
    setSelectedUser(createdUser);
    setNewUser({ 
      name: "", email: "", phone: "", department: "", role: "user",
      age: 25, maritalStatus: "single", childrenCount: 0,
      insuranceType: "none", educationDegree: "", educationField: ""
    });
    toast.success(t("userAddedSuccess"));
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error(t("enterNewPassword"));
      return;
    }
    toast.success(t("passwordResetSuccess", { user: selectedUser?.name ?? "" }));
    setNewPassword("");
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    confirm({
      title: t("deleteUserAccount"),
      description: `${t("confirmDeleteUser")} ${selectedUser.name}`,
      confirmText: t("deleteUserAccount"),
      cancelText: t("cancel"),
      variant: 'destructive',
      onConfirm: () => {
        const newUsers = users.filter(u => u.id !== selectedUser.id);
        setUsers(newUsers);
        if (newUsers.length > 0) {
          setSelectedUser(newUsers[0]);
        }
        toast.success(t("userDeletedSuccess"));
      }
    });
  };

  const handleChangeRole = (val: string) => {
    if (!selectedUser) return;
    const updatedUser: User = { ...selectedUser, role: val as User["role"] };
    const newUsers = users.map(u => u.id === selectedUser.id ? updatedUser : u);
    setUsers(newUsers);
    setSelectedUser(updatedUser);
    toast.success(t("roleUpdatedSuccess"));
  };

  const departmentOptions = [
    { value: 'Engineering', label: t("departments.Engineering") },
    { value: 'Design', label: t("departments.Design") },
    { value: 'Marketing', label: t("departments.Marketing") },
    { value: 'Sales', label: t("departments.Sales") }
  ];

  const roleOptions = [
    { value: 'admin', label: t("adminRole") },
    { value: 'user', label: t("userRole") }
  ];

  const maritalOptions = [
    { value: 'single', label: t("maritalStatusOptions.single") },
    { value: 'married', label: t("maritalStatusOptions.married") }
  ];

  const insuranceOptions = [
    { value: 'none', label: t("insuranceOptions.none") },
    { value: 'socialSecurity', label: t("insuranceOptions.socialSecurity") },
    { value: 'complementary', label: t("insuranceOptions.complementary") }
  ];

  const degreeOptions = [
    { value: 'diploma', label: t("degreesOptions.diploma") },
    { value: 'bachelors', label: t("degreesOptions.bachelors") },
    { value: 'master', label: t("degreesOptions.master") },
    { value: 'phd', label: t("degreesOptions.phd") }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full w-full max-w-[1440px] mx-auto min-h-0 overflow-y-auto pr-2 pb-10 scrollbar-hide fade-in-0 animate-in zoom-in-95 duration-500 items-start">
      
      {/* MANAGE SELECTED USER SECTION */}
      <div className="flex flex-col gap-6">
        
        {/* Profile Card & Settings */}
        <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[2rem] p-8 flex flex-col gap-6 relative overflow-hidden">
          
          {/* User Profile Card */}
          <div className="flex items-center gap-4 border-b border-border/50 pb-6 relative z-10">
            <Avatar className="size-16 border-[2px] border-card shadow-sm shrink-0">
              <AvatarImage src={selectedUser?.avatar} className="object-cover object-top" />
              <AvatarFallback className="bg-muted text-foreground text-xl font-bold">{selectedUser?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1">
              <h2 className="text-xl font-bold text-foreground truncate max-w-[200px]">{selectedUser?.name}</h2>
              <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-[200px]">
                {selectedUser?.role === 'admin' ? t("adminRole") : t("userRole")} 
                {selectedUser?.department && ` • ${t(`departments.${selectedUser.department}`)}`}
              </p>
            </div>
            <Button 
              variant="outline" 
              className={`h-9 px-3 rounded-lg font-medium gap-1.5 transition-colors ${isEditMode ? 'border-amber-500/30 text-amber-600 hover:bg-amber-500/10' : 'border-primary/30 text-primary hover:bg-primary/10'}`}
              onClick={handleToggleEditMode}
            >
              {isEditMode ? (
                <><X size={14} /> {t("cancelEdit")}</>
              ) : (
                <><Edit2 size={14} /> {t("editThisUser")}</>
              )}
            </Button>
          </div>

          <div className="flex flex-col gap-4 relative z-10">
            {/* Change Role / Access */}
            <div className="flex items-center justify-between bg-background/40 p-3 rounded-2xl border border-border/40">
              <Label className="text-foreground font-medium flex items-center gap-2 text-sm">
                <ShieldCheck size={16} className="text-primary" />
                {t("changeUserAccess")}
              </Label>
              <Combobox 
                options={roleOptions} 
                value={selectedUser?.role || 'user'} 
                onChange={handleChangeRole} 
                placeholder={t("selectRole")}
                emptyText={t("noResults")}
                className="w-[140px] h-10 bg-background border-border/50 rounded-xl rtl:text-right text-xs shadow-sm"
              />
            </div>

            {/* Compact Reset Password */}
            <div className="flex flex-col gap-3 bg-background/40 p-3.5 rounded-2xl border border-border/40">
              <Label className="text-foreground font-medium flex items-center gap-2 text-sm">
                <KeyRound size={16} className="text-amber-500" />
                {t("resetPasswordTitle")}
              </Label>
              <form onSubmit={handleResetPassword} className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <PasswordInput id="newPass" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="********" className="h-10 bg-background focus:bg-background border-border/50 rounded-xl transition-colors text-sm shadow-sm" dir="ltr" />
                </div>
                <Button type="submit" className="h-10 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/20 font-semibold shadow-sm transition-all shrink-0 text-xs">
                  <RefreshCw size={14} className="rtl:ml-1.5 ltr:mr-1.5" /> 
                  {t("submitResetPassword")}
                </Button>
              </form>
            </div>

            <div className="h-[1px] w-full bg-border/50 my-1"></div>

            {/* Modules Access */}
            {handleToggleModuleAccess && handleToggleAllModulesAccess && tMenu && (
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground font-bold">{t("accesses")}</Label>
                  <label className="text-[11px] font-medium text-muted-foreground cursor-pointer select-none flex items-center gap-1.5" 
                    onClick={() => {
                      const allActivated = availableModules.every(module => selectedUser?.modulesAccess?.find(m => m.moduleId === module.id)?.hasAccess);
                      handleToggleAllModulesAccess(!allActivated);
                    }}
                  >
                    {t("selectAll")}
                    <Checkbox 
                      checked={availableModules.length > 0 && availableModules.every(module => selectedUser?.modulesAccess?.find(m => m.moduleId === module.id)?.hasAccess)} 
                      onCheckedChange={(c) => handleToggleAllModulesAccess(!!c)} 
                      className="rounded-[4px] data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </label>
                </div>
                
                <div className="flex flex-col max-h-[250px] overflow-y-auto pr-2 scrollbar-thin border border-border/30 rounded-xl p-2 bg-background/50">
                  {availableModules.map(module => {
                    const access = selectedUser?.modulesAccess?.find(m => m.moduleId === module.id);
                    const hasAccess = access?.hasAccess ?? false;
                    const isExpanded = expandedGroup === module.id;
                    
                    return (
                      <Collapsible key={module.id} open={isExpanded} onOpenChange={(open) => setExpandedGroup(open ? module.id : null)} className="flex flex-col gap-1 mb-1">
                        <div className={`relative flex items-center justify-between py-1.5 px-2 rounded-lg group select-none overflow-hidden ${hasAccess ? 'bg-primary/5' : 'opacity-60'}`}>
                          <div className="flex items-center gap-3 flex-1 min-w-0 relative z-10">
                            <Checkbox 
                              checked={hasAccess} 
                              onCheckedChange={(c) => handleToggleModuleAccess(module.id, !!c)} 
                              className="rounded-[4px] shrink-0 border-2 border-primary/40 data-[state=unchecked]:bg-background"
                            />
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer">
                                {module.icon && <module.icon size={16} weight="duotone" className="text-muted-foreground" />}
                                <p className="font-semibold text-[13px] text-foreground truncate">{tMenu(`sections.${module.labelKey}` as any) || module.id}</p>
                              </div>
                            </CollapsibleTrigger>
                          </div>
                        </div>
                        
                        {module.items && module.items.length > 0 && (
                          <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
                            <div className="flex flex-col pr-2 pl-8 space-y-1 rtl:pl-2 rtl:pr-8 border-s border-muted/50 ms-3 rtl:ms-0 rtl:me-3 py-1">
                              {module.items.map((item: any) => {
                                const itemAccess = selectedUser?.modulesAccess?.find(m => m.moduleId === item.href);
                                const itemHasAccess = itemAccess?.hasAccess ?? false;
                                return (
                                  <div key={item.href} onClick={() => handleToggleModuleAccess(item.href, !itemHasAccess)} className={`relative flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${itemHasAccess ? '' : 'opacity-60 grayscale'}`}>
                                    <Checkbox checked={itemHasAccess} onCheckedChange={(c) => handleToggleModuleAccess(item.href, !!c)} className="rounded-[4px] shrink-0 border-2 border-primary/40" />
                                    {item.icon && <item.icon size={14} className="text-muted-foreground shrink-0" />}
                                    <span className="text-[12px] text-foreground font-medium truncate">{tMenu(`items.${item.labelKey}` as any) || item.labelKey}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    )
                  })}
                </div>
              </div>
            )}
            <div className="h-[1px] w-full bg-border/50 my-2"></div>

            {/* Delete Account */}
            <div className="flex justify-between items-center bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl mt-2">
              <div className="flex flex-col">
                <span className="text-rose-500 font-bold text-[14px]">{t("dangerZone")}</span>
                <span className="text-[11px] text-muted-foreground">{t("dangerZoneDesc")}</span>
              </div>
              <Button variant="ghost" className="h-9 px-4 rounded-lg font-semibold text-[13px] text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 transition-colors shrink-0" onClick={handleDeleteUser}>
                <Trash2 size={16} className="rtl:ml-1.5 ltr:mr-1.5" /> {t("deleteUserAccount")}
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: ADD NEW USER & RECENT USERS */}
      <div className="flex flex-col gap-6">
        
        {/* ADD NEW USER / EDIT USER SECTION */}
        <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[2rem] p-8 flex flex-col gap-6 shrink-0 relative overflow-hidden">
          
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${isEditMode ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'}`}>
              {isEditMode ? <Edit2 size={26} /> : <UserPlus size={28} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{isEditMode ? t("editUserTitle") : t("addNewUserTitle")}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{isEditMode ? t("editUserDesc") : t("addNewUserDesc")}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleAddUser} className="flex flex-col gap-5 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="name" className="text-muted-foreground ml-1">{t("fullName")}</Label>
              <div className="relative">
                <UserCircle2 size={18} className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <Input id="name" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} placeholder={t("fullNamePlaceholder")} className="ltr:pl-10 rtl:pr-10 h-12 bg-background border-border/50 rounded-xl" />
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="email" className="text-muted-foreground ml-1">{t("email")}</Label>
              <div className="relative">
                <Mail size={18} className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <Input id="email" type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} placeholder="user@company.com" className="ltr:pl-10 rtl:pr-10 h-12 bg-background border-border/50 rounded-xl" dir="ltr" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="phone" className="text-muted-foreground ml-1">{t("phone")}</Label>
              <div className="relative">
                <Phone size={18} className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <Input id="phone" value={newUser.phone} onChange={(e) => setNewUser({...newUser, phone: e.target.value})} placeholder="0912..." className="ltr:pl-10 rtl:pr-10 h-12 bg-background border-border/50 rounded-xl fa-num" dir="ltr" />
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <Label className="text-muted-foreground ml-1">{t("department")}</Label>
              <Combobox 
                options={departmentOptions} 
                value={newUser.department} 
                onChange={(val) => setNewUser({...newUser, department: val})} 
                placeholder={t("selectDepartment")}
                emptyText={t("noResults")}
                className="w-full h-12 bg-background border-border/50 rounded-xl rtl:text-right"
              />
            </div>
            <div className="flex flex-col gap-2.5">
              <Label className="text-muted-foreground ml-1">{t("role")}</Label>
              <Combobox 
                options={roleOptions} 
                value={newUser.role || ''} 
                onChange={(val) => setNewUser({...newUser, role: val as User["role"]})} 
                placeholder={t("selectRole")}
                emptyText={t("noResults")}
                className="w-full h-12 bg-background border-border/50 rounded-xl rtl:text-right"
              />
            </div>
          </div>

          <div className="h-[1px] w-full bg-border/50 my-1"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div className="flex flex-col gap-2.5">
              <Label className="text-muted-foreground ml-1">{t("userAge")}</Label>
              <Input type="number" min={18} max={99} value={newUser.age} onChange={(e) => setNewUser({...newUser, age: parseInt(e.target.value) || 0})} className="h-12 bg-background border-border/50 rounded-xl fa-num" dir="ltr" />
            </div>
            <div className="flex flex-col gap-2.5">
              <Label className="text-muted-foreground ml-1">{t("maritalStatusLabel")}</Label>
              <Combobox 
                options={maritalOptions} 
                value={newUser.maritalStatus || ''} 
                onChange={(val) => setNewUser({...newUser, maritalStatus: val as any})} 
                placeholder={t("selectMaritalStatus")}
                emptyText={t("noResults")}
                className="w-full h-12 bg-background border-border/50 rounded-xl rtl:text-right"
              />
            </div>
            <div className="flex flex-col gap-2.5">
              <Label className="text-muted-foreground ml-1">{t("childrenCountLabel")}</Label>
              <Input type="number" min={0} max={20} value={newUser.childrenCount} onChange={(e) => setNewUser({...newUser, childrenCount: parseInt(e.target.value) || 0})} className="h-12 bg-background border-border/50 rounded-xl fa-num" dir="ltr" disabled={newUser.maritalStatus === 'single'} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="flex flex-col gap-2.5">
              <Label className="text-muted-foreground ml-1">{t("insuranceTypeLabel")}</Label>
              <Combobox 
                options={insuranceOptions} 
                value={newUser.insuranceType || ''} 
                onChange={(val) => setNewUser({...newUser, insuranceType: val as any})} 
                placeholder={t("selectInsurance")}
                emptyText={t("noResults")}
                className="w-full h-12 bg-background border-border/50 rounded-xl rtl:text-right"
              />
            </div>
            <div className="flex flex-col gap-2.5">
              <Label className="text-muted-foreground ml-1">{t("educationDegreeLabel")}</Label>
              <Combobox 
                options={degreeOptions} 
                value={newUser.educationDegree || ''} 
                onChange={(val) => setNewUser({...newUser, educationDegree: val})} 
                placeholder={t("selectDegree")}
                emptyText={t("noResults")}
                className="w-full h-12 bg-background border-border/50 rounded-xl rtl:text-right"
              />
            </div>
            <div className="flex flex-col gap-2.5">
              <Label className="text-muted-foreground ml-1">{t("educationFieldLabel")}</Label>
              <Input value={newUser.educationField} onChange={(e) => setNewUser({...newUser, educationField: e.target.value})} placeholder={t("educationFieldLabel")} className="h-12 bg-background border-border/50 rounded-xl" />
            </div>
          </div>

          <Button type="submit" className={`w-full h-12 rounded-xl mt-4 font-semibold text-[15px] shadow-sm ${isEditMode ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}>
            {isEditMode ? t("submitEditUser") : t("submitAddUser")}
          </Button>
        </form>
      </div>

      {/* RECENT USERS LIST */}
      <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[2rem] p-6 flex flex-col gap-4 flex-1">
        
        <div className="flex items-center justify-between z-10 mb-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner bg-emerald-500/10 text-emerald-500">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{t("recentUsers")}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t("recentActivities")}</p>
            </div>
          </div>
          <span className="bg-muted text-muted-foreground text-[11px] font-bold px-2.5 py-0.5 rounded-full">{users.length}</span>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-1 scrollbar-thin">
          {users.slice(0, 5).map((u, i) => (
            <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/40 hover:border-primary/20 transition-colors group">
              <div className="flex items-center gap-3">
                <Avatar className="size-10 border border-border/50">
                  <AvatarImage src={u.avatar} />
                  <AvatarFallback className="bg-primary/5 text-primary text-sm font-bold">{u.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-foreground leading-tight">{u.name}</span>
                  <span className="text-[11px] text-muted-foreground">{u.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 rtl:mr-auto ltr:ml-auto">
                {i % 2 === 0 ? (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm uppercase">Create</span>
                ) : (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-sm uppercase">Update</span>
                )}

                <Button 
                  variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-all" 
                onClick={() => {
                  confirm({
                    title: t("deleteUserAccount"),
                    description: `${t("confirmDeleteUser")} ${u.name}`,
                    confirmText: t("deleteUserAccount"),
                    cancelText: t("cancel"),
                    variant: 'destructive',
                    onConfirm: () => {
                      const newUsers = users.filter(usr => usr.id !== u.id);
                      setUsers(newUsers);
                      if(selectedUser?.id === u.id && newUsers.length > 0) setSelectedUser(newUsers[0]);
                      toast.success(t("userDeletedSuccess"));
                    }
                  });
                }}
              >
                <Trash2 size={14} />
              </Button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground italic opacity-60">
              {t("noResults")}
            </div>
          )}
        </div>
      </div>

    </div>
    </div>
  );
}
