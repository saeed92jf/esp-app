# Graph Report - esp-app  (2026-10-26)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 3158 nodes · 9640 edges · 170 communities (137 shown, 33 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 58 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `526fa263`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Input
- BaseNode.tsx
- react
- search-results-client.tsx
- dependencies
- cn
- package.json
- Combobox
- AdminRequests.tsx
- QuickAccessSection.tsx
- store/index.ts
- dashboard.tsx
- search/services/search.service.ts
- ProjectItem
- Button
- [locale]/layout.tsx
- sidebar.tsx
- dashboard.service.ts
- use-auth.ts
- src/services/index.ts
- Badge
- paths
- Toolbar.tsx
- ref_fs
- DiagramCanvas.tsx
- profile-page.tsx
- dictionary-page.tsx
- GeneralDataNode.tsx
- date-picker.tsx
- aparat-client.tsx
- MarketQuote
- register/page.tsx
- docs-page-container.tsx
- test-scheduler.ts
- profile.ts
- HttpClient
- TaskItem
- DiagramEditor.tsx
- SettingsPanel.tsx
- PendingRequest
- dashboard-control-hub-modal.tsx
- sitemap-client.tsx
- ProjectDataNode.tsx
- login/page.tsx
- AdminProfileStats.tsx
- projects-tasks-store.ts
- channel-video-search.tsx
- home-client.tsx
- attachments.schema.ts
- components.json
- next
- base.schema.ts
- aparat.service.ts
- stats-section.tsx
- FakeProjectsService
- devDependencies
- VideoListItem
- مشخصات و مستندات API سرور (Backend API Specification)
- refactor_admin.js
- EngineeringObject.tsx
- AdminUserConfig.tsx
- src/types/index.ts
- Link
- tasks-management-page.tsx
- scratch/package.json
- task-detail-view.tsx
- multi-button.tsx
- User
- FakeAdminService
- mistEliminator.schema.ts
- FakeTasksService
- scripts
- FakeAuthService
- task-timeline-bar.tsx
- carousel.tsx
- alert-dialog.tsx
- IAuthService
- projects.types.ts
- tasks.types.ts
- chart.tsx
- EditorSettingsDialog.tsx
- toggle-group.tsx
- fetch_events.js
- app/layout.tsx
- slide-settings-drawer.tsx
- support.schema.ts
- stats.service.ts
- personnel-form.tsx
- myFunc.ps1
- drawer.tsx
- use-aparat-channel.ts
- RealAuthService
- preferences.service.ts
- AdminDashboard.tsx
- UserRole
- commodities.service.ts
- floatingEdge.ts
- fetch_bahesab.js
- AdminTasksTime.tsx
- navigation-menu.tsx
- admin.types.ts
- scraper.js
- inject_fairs.js
- dashboard-menu-sidebar.tsx
- pagination.tsx
- BaseNodeDataSchema
- head.schema.ts
- tasks/[id]/route.ts
- input-group.tsx
- flowStorage.ts
- exchange-rates.service.ts
- Getting Started
- parse_excel.js
- internals.schema.ts
- shell.schema.ts
- update-remove-birthday.js
- eslint.config.mjs
- parse-pdf.js
- input-otp.tsx
- parse_pdf_to_js.js
- UserModuleAccess
- ProjectTaskItem
- task-board.tsx
- update-admin-translations.js
- update-admin-translations2.js
- update-admin-translations3.js
- update-admin-translations4.js
- update-translations.js
- fix_types.js
- resizable.tsx
- replace.js
- scratch_translations.js
- remove-icons.js
- channelstats.tsx
- fix_en_json.js
- parse.js
- hover-card.tsx
- constants/layout.ts
- flangeWeightTable.ts
- pipeDimensions.ts
- update-admin-translations-fix.js
- update-departments.js
- update-tabs-motion.js
- browserslist
- repository
- fix_titles.js
- search/page.tsx
- modal-shell.tsx
- dateParser.ts
- update-calendar-badges.js
- update-checklist.js
- update-profile.js
- update-time-tabs.js
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `cn()` - 518 edges
2. `react` - 266 edges
3. `Button()` - 202 edges
4. `lucide-react` - 182 edges
5. `next-intl` - 171 edges
6. `Input` - 126 edges
7. `Combobox()` - 76 edges
8. `useDiagramStore` - 74 edges
9. `Link` - 62 edges
10. `TooltipContent()` - 52 edges

## Surprising Connections (you probably didn't know these)
- `۵. ماژول مدیریت پروژه‌ها، اسناد VDIS و نامه‌های ترانسمیتال (Projects)` --references--> `VdisDocumentItem`  [INFERRED]
  API_SPECIFICATION.md → src/modules/projects/types/projects.types.ts
- `۵. ماژول مدیریت پروژه‌ها، اسناد VDIS و نامه‌های ترانسمیتال (Projects)` --references--> `TransmittalLetter`  [INFERRED]
  API_SPECIFICATION.md → src/modules/projects/types/projects.types.ts
- `۵. ماژول مدیریت پروژه‌ها، اسناد VDIS و نامه‌های ترانسمیتال (Projects)` --references--> `ProjectPhase`  [INFERRED]
  API_SPECIFICATION.md → src/modules/projects/types/projects.types.ts
- `۵. ماژول مدیریت پروژه‌ها، اسناد VDIS و نامه‌های ترانسمیتال (Projects)` --references--> `ProjectRiskItem`  [INFERRED]
  API_SPECIFICATION.md → src/modules/projects/types/projects.types.ts
- `۴. ماژول مدیریت وظایف و تسک‌ها (Tasks Management)` --references--> `TaskItem`  [INFERRED]
  API_SPECIFICATION.md → src/modules/tasks/types/tasks.types.ts

## Import Cycles
- None detected.

## Communities (170 total, 33 thin omitted)

### Community 0 - "Input"
Cohesion: 0.05
Nodes (98): Checkbox(), Input, GeneralDataNode, createDefaultHead(), DiagramNode, HEAD_TYPES, HeadNode, MATERIALS (+90 more)

### Community 1 - "BaseNode.tsx"
Cohesion: 0.05
Nodes (91): BEAM_SHAPE_LABELS, BeamCalcNode(), ChartNode(), CircleNode(), CloudNode(), ConstantNode(), CORNER_OFFSET_STYLE, CornerResizer() (+83 more)

### Community 2 - "react"
Cohesion: 0.06
Nodes (34): leaflet, lucide-react, next-intl, react, Props, SearchPopup(), SearchPopupProps, ColorPickerProps (+26 more)

### Community 3 - "search-results-client.tsx"
Cohesion: 0.11
Nodes (49): AppHeaderProps, AppsPopover(), Header(), HelpPopover(), SideMenuContent(), SideMenu(), AnimatedHamburger(), AnimatedHamburgerProps (+41 more)

### Community 4 - "dependencies"
Cohesion: 0.03
Nodes (79): dependencies, @auth/core, axios, @base-ui/react, bcryptjs, class-variance-authority, clsx, cmdk (+71 more)

### Community 5 - "cn"
Cohesion: 0.05
Nodes (50): Container(), ContainerProps, ContainerSize, containerSizeClasses, FullWidth(), FullWidthProps, Breadcrumb(), BreadcrumbEllipsis() (+42 more)

### Community 6 - "package.json"
Cohesion: 0.03
Nodes (65): author, keywords, license, name, private, version, @auth/core, @base-ui/react (+57 more)

### Community 7 - "Combobox"
Cohesion: 0.07
Nodes (53): Combobox(), COMBOBOX_SEARCH_THRESHOLD, ComboboxProps, sizeClasses, Command(), CommandEmpty(), CommandGroup(), CommandInput() (+45 more)

### Community 8 - "AdminRequests.tsx"
Cohesion: 0.10
Nodes (44): @phosphor-icons/react, CommandDialog(), Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay() (+36 more)

### Community 9 - "QuickAccessSection.tsx"
Cohesion: 0.08
Nodes (38): GoogleAddShortcutTile(), GoogleAddShortcutTileProps, GoogleShortcutModal(), GoogleShortcutModalProps, GoogleShortcutTile(), GoogleShortcutTileProps, QuickAccessCustomizer(), QuickAccessCustomizerProps (+30 more)

### Community 10 - "store/index.ts"
Cohesion: 0.09
Nodes (45): CustomEdge(), JacketNodeData, DEFAULT_SETTINGS, DiagramStore, ArithmeticOperation, DiagramEdgeData, DiagramEdgeType, DiagramNodeData (+37 more)

### Community 11 - "dashboard.tsx"
Cohesion: 0.09
Nodes (40): ActivityFeed(), BourseWidget(), ChecklistWidget(), CATEGORIES, CommoditiesWidget(), formatLargeIrr(), formatPrice(), UNITS (+32 more)

### Community 12 - "search/services/search.service.ts"
Cohesion: 0.08
Nodes (31): normalizeSearchText(), CustomCardInput, THEME_PRESETS, getDidYouKnowCards(), seededShuffle(), DID_YOU_KNOW_CARDS_EN, DID_YOU_KNOW_CARDS_FA, DidYouKnowCardItem (+23 more)

### Community 13 - "ProjectItem"
Cohesion: 0.08
Nodes (17): ProjectCreateViewProps, ProjectMiroRoadmapTabProps, ProjectOverviewTabProps, ProjectPhasesWbsTabProps, ProjectReportsAnalyticsTabProps, ProjectRisksTabProps, ProjectStrategicOkrsTabProps, ProjectVdisTransmittalTabProps (+9 more)

### Community 14 - "Button"
Cohesion: 0.08
Nodes (41): react-day-picker, PrivacyPage(), TermsPage(), ThemeToggle(), Button(), buttonVariants, Calendar(), CalendarDayButton() (+33 more)

### Community 15 - "[locale]/layout.tsx"
Cohesion: 0.07
Nodes (32): LocaleLayout(), generateMetadata(), viewport, ConditionalFooter(), ConditionalHeader(), HIDDEN_PREFIXES, Footer(), FooterLinkItem (+24 more)

### Community 16 - "sidebar.tsx"
Cohesion: 0.07
Nodes (37): Separator(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetPortal(), SheetTitle() (+29 more)

### Community 17 - "dashboard.service.ts"
Cohesion: 0.08
Nodes (32): motion, react-dom, STATUS_CONFIG, TYPE_COLORS, TYPE_DOT_COLORS, TYPE_ICONS, DashboardHeaderProps, CustomLinksWidgetProps (+24 more)

### Community 18 - "use-auth.ts"
Cohesion: 0.08
Nodes (21): companyEmailRe, AuthState, useAuthStore, AccountRequestPayload, AccountRequestRecord, AccountRequestResult, AccountStatusResult, DEMO_USERS (+13 more)

### Community 19 - "src/services/index.ts"
Cohesion: 0.08
Nodes (25): useSiteSearchItems(), getBilingualKeywords(), NAV_SEARCH_SOURCE, universalSearchService, ApiErrorResponse, ApiResponse, ApiResult, DateRangeParams (+17 more)

### Community 20 - "Badge"
Cohesion: 0.13
Nodes (24): radix-ui, AppHeader(), Badge(), badgeVariants, Progress(), DefaultPhaseItem, INITIAL_PHASES, ProjectCreateView() (+16 more)

### Community 21 - "paths"
Cohesion: 0.05
Nodes (36): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+28 more)

### Community 22 - "Toolbar.tsx"
Cohesion: 0.11
Nodes (27): dagre, elkjs, html-to-image, AvatarBadge(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup() (+19 more)

### Community 23 - "ref_fs"
Cohesion: 0.06
Nodes (20): code, fs, fs, fs, content, fs, content, fs (+12 more)

### Community 24 - "DiagramCanvas.tsx"
Cohesion: 0.11
Nodes (30): @xyflow/react, clampPosition(), ContextMenu(), ContextMenuState, QuickAddItem, safeT(), absolutePosition(), BG_VARIANT_MAP (+22 more)

### Community 25 - "profile-page.tsx"
Cohesion: 0.09
Nodes (24): Page(), Props, ColorPicker(), ComboboxOption, AVATAR_COLOR_PRESETS, formatDateToString(), getSkillBadgeStyle(), LocationPickerMap (+16 more)

### Community 26 - "dictionary-page.tsx"
Cohesion: 0.13
Nodes (22): buildBilingualPattern(), escapeRegExp(), HighlightMatch(), HighlightMatchProps, DICE_FACES, NAV_ITEMS, CustomDictionaryTermInput, useDictionary() (+14 more)

### Community 27 - "GeneralDataNode.tsx"
Cohesion: 0.08
Nodes (25): BaseNodeShell(), BaseNodeShellProps, DefaultNode(), FONT_WEIGHT_MAP, getNodeStyle(), DiagramNode, GeneralData, GeneralDataNodeData (+17 more)

### Community 28 - "date-picker.tsx"
Cohesion: 0.12
Nodes (25): date-fns-jalali, CalendarContent(), CalendarContentProps, DatePicker(), DatePickerProps, getGregorianDaysInMonth(), getJalaliDate(), getJalaliDaysInMonth() (+17 more)

### Community 29 - "aparat-client.tsx"
Cohesion: 0.13
Nodes (16): @tanstack/react-virtual, AparatClient(), AparatClientProps, AparatPage(), ChannelInfoBar(), Playlist(), VideoCard(), VideoPlayer() (+8 more)

### Community 30 - "MarketQuote"
Cohesion: 0.16
Nodes (14): dynamic, fetchCache, GET(), MARKET_SYMBOLS, MarketController, MarketHistory, MarketQuote, MarketSymbol (+6 more)

### Community 31 - "register/page.tsx"
Cohesion: 0.19
Nodes (20): LoginPage(), RegisterPage(), ResetPasswordContent(), ResetPasswordPage(), VerifyEmailContent(), VerifyEmailPage(), BrandWord(), Logo() (+12 more)

### Community 32 - "docs-page-container.tsx"
Cohesion: 0.16
Nodes (18): HelpDocsPage(), Props, DocsDirectPage(), Props, DocsContentView(), DocsContentViewProps, DocsPageContainer(), DocsSidebar() (+10 more)

### Community 33 - "test-scheduler.ts"
Cohesion: 0.11
Nodes (17): @playwright/test, args, intervalArg, isQuick, isSchedule, isWatch, main(), printHeader() (+9 more)

### Community 34 - "profile.ts"
Cohesion: 0.10
Nodes (19): @tanstack/react-query, PersonnelFormProps, useProfile(), FakeProfileService, MOCK_PROFILE, profileService, ProfileService, ContractType (+11 more)

### Community 35 - "HttpClient"
Cohesion: 0.12
Nodes (9): RealProfileService, ApiError, ErrorCode, toApiError(), getToken(), HttpClient, isRetryable(), sleep() (+1 more)

### Community 36 - "TaskItem"
Cohesion: 0.12
Nodes (3): RealTasksService, TasksService, TaskItem

### Community 37 - "DiagramEditor.tsx"
Cohesion: 0.12
Nodes (21): FlowPage(), metadata, DiagramEditor(), DiagramEditorProps, EditorShell(), safeT(), Toast(), DiagramLibraryDialog() (+13 more)

### Community 38 - "SettingsPanel.tsx"
Cohesion: 0.12
Nodes (21): Slider(), ToggleGroup(), DEL_BTN, DUPE_BTN, EDGE_TYPE_OPTIONS, EdgeColorTokenRow(), Field(), LABEL_SYMBOLS (+13 more)

### Community 39 - "PendingRequest"
Cohesion: 0.14
Nodes (5): AdminRequestsProps, RealAdminService, IAdminService, PendingRequest, RequestQueryParams

### Community 40 - "dashboard-control-hub-modal.tsx"
Cohesion: 0.15
Nodes (21): DashboardControlHubModal(), DashboardControlHubModalProps, DashboardToolbar(), DashboardToolbarProps, DashboardSchematicStudioModalProps, DashboardSettingsPopoverProps, HiddenWidgetBadge(), DASHBOARD_TABS (+13 more)

### Community 41 - "sitemap-client.tsx"
Cohesion: 0.13
Nodes (20): SitemapPage(), AccessFilter, SitemapClient(), ViewMode, API_ARCHITECTURE_OVERVIEW, ApiDomain, ApiEndpointContract, ApiErrorScenario (+12 more)

### Community 42 - "ProjectDataNode.tsx"
Cohesion: 0.17
Nodes (22): PhoneInput(), PhoneInputProps, applyMask(), cleanRawPhone(), COUNTRIES, Country, getCountryByCode(), toEnglishDigits() (+14 more)

### Community 43 - "login/page.tsx"
Cohesion: 0.19
Nodes (18): @hookform/resolvers, react-hook-form, AccountRequestPage(), FormControl(), FormDescription(), FormField(), FormFieldContext, FormFieldContextValue (+10 more)

### Community 44 - "AdminProfileStats.tsx"
Cohesion: 0.13
Nodes (16): next-themes, sonner, MODE_OPTIONS, SettingsSection(), THEME_OPTIONS, DEFAULT_PRIMARY_COLOR, PRIMARY_COLORS, PrimaryColorId (+8 more)

### Community 45 - "projects-tasks-store.ts"
Cohesion: 0.15
Nodes (19): Context, DELETE(), GET(), PUT(), GET(), POST(), GET(), POST() (+11 more)

### Community 46 - "channel-video-search.tsx"
Cohesion: 0.19
Nodes (16): @radix-ui/react-tabs, ChannelHeader(), ChannelHeaderProps, ChannelVideoSearch(), ChannelVideoSearchProps, SlidingTabItem, SlidingTabs(), SlidingTabsProps (+8 more)

### Community 47 - "home-client.tsx"
Cohesion: 0.16
Nodes (16): HomePage(), GoogleSearchBox(), GoogleSearchBoxProps, SiteSearch(), MultiButtonGroup, DidYouKnowSection(), FeaturedModulesCard(), fadeUp (+8 more)

### Community 48 - "attachments.schema.ts"
Cohesion: 0.14
Nodes (21): calcAttachmentWeight(), calcInsulationSupportWeight(), calcLiftingLugWeight(), calcNamePlateWeight(), calcTurningLugWeight(), getDensity(), AttachmentItem, AttachmentItemSchema (+13 more)

### Community 49 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 50 - "next"
Cohesion: 0.10
Nodes (10): nextConfig, withNextIntl, next, GET(), revalidateSeconds(), CRYPTO_SYMBOL, SYMBOL_MAP, YH_HEADERS (+2 more)

### Community 51 - "base.schema.ts"
Cohesion: 0.12
Nodes (17): zod, AggregateInput, Material, MATERIAL_DENSITY, MaterialSchema, NodePositionSchema, UnitSystem, UnitSystemSchema (+9 more)

### Community 52 - "aparat.service.ts"
Cohesion: 0.21
Nodes (13): AparatService, decodeEntities(), endpointFromAparatUrl(), isAbortError(), isTransient(), normalizeVideo(), pickKey(), pickNextPageUrl() (+5 more)

### Community 53 - "stats-section.tsx"
Cohesion: 0.16
Nodes (14): StatCard(), StatsSection(), StatsSectionProps, STATS, useCountUp(), UseCountUpOptions, useInView(), UseInViewOptions (+6 more)

### Community 55 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, eslint, eslint-config-next, eslint-config-prettier, eslint-plugin-react, eslint-plugin-react-hooks, @playwright/test, prettier (+12 more)

### Community 56 - "VideoListItem"
Cohesion: 0.15
Nodes (8): TaggedVideo, VideoCardProps, IAparatService, RealAparatService, Category, CategoryWithVideos, VideoItem, VideoListItem

### Community 57 - "مشخصات و مستندات API سرور (Backend API Specification)"
Cohesion: 0.11
Nodes (18): ساختار مدل داده پرونده پرسنلی (UserProfile Data Model):, سامانه جامع پورتال سازمانی یورو اسلات پارس (Euroslot Pars), مشخصات و مستندات API سرور (Backend API Specification), ۱. اصول عمومی و استانداردهای ارتباطی (General Conventions), ۱. ورود به سامانه (Login):, ۱.۱. آدرس‌پایه (Base URL), ۱.۲. احراز هویت (Authentication Header), ۱.۳. فرمت استاندارد پاسخ خطاها (Error Response Schema) (+10 more)

### Community 58 - "refactor_admin.js"
Cohesion: 0.11
Nodes (12): adminDashboardPath, adminDir, content, fs, path, fs, path, srcDir (+4 more)

### Community 59 - "EngineeringObject.tsx"
Cohesion: 0.15
Nodes (15): @react-three/drei, @react-three/fiber, three, OutputNode, OutputNodeData, ShapeNode, ShapeNodeData, ShapeOption (+7 more)

### Community 60 - "AdminUserConfig.tsx"
Cohesion: 0.15
Nodes (16): zustand, ConfirmOptions, ConfirmStore, useConfirm, AdminModuleAccessStep(), AdminUserConfig(), AdminUserConfigProps, INITIAL_FORM (+8 more)

### Community 61 - "src/types/index.ts"
Cohesion: 0.11
Nodes (18): CategoryTabsProps, ChannelHeaderProps, ChannelInfo, ChannelProfile, ChannelResponse, ChannelStatsProps, LiveStream, PlaylistProps (+10 more)

### Community 62 - "Link"
Cohesion: 0.20
Nodes (12): AccountPendingPage(), ForgotPasswordPage(), LocaleNotFound(), QuickAccessCard(), QuickAccessCardProps, NotFoundPage(), getPathname, Link (+4 more)

### Community 63 - "tasks-management-page.tsx"
Cohesion: 0.16
Nodes (14): Props, TaskDetailPage(), Page(), Props, Page(), Props, TaskBoard(), TaskCreateView() (+6 more)

### Community 64 - "scratch/package.json"
Cohesion: 0.12
Nodes (16): author, dependencies, axios, cheerio, xlsx, description, axios, xlsx (+8 more)

### Community 65 - "task-detail-view.tsx"
Cohesion: 0.24
Nodes (12): Avatar(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), TaskAttachmentsSection(), TaskAttachmentsSectionProps, TaskCommentThread(), TaskCommentThreadProps (+4 more)

### Community 66 - "multi-button.tsx"
Cohesion: 0.16
Nodes (14): CompactMultiButton, CompactMultiButtonProps, actionDefinitions, MultiButtonDemo(), MultiButton, MultiButtonGroupContext, MultiButtonGroupContextValue, MultiButtonGroupProps (+6 more)

### Community 67 - "User"
Cohesion: 0.17
Nodes (8): AdminActivitiesProps, AdminHeaderProps, AdminHeatmapModulesProps, AdminTasksTimeProps, AdminUsersTableProps, normalizeText(), User, UserQueryParams

### Community 69 - "mistEliminator.schema.ts"
Cohesion: 0.15
Nodes (15): calcDemisterWeight(), calculateCircularSegments(), circleHalfArea(), getDensity(), YORK_DENSITIES, BeamProfileSchema, DemisterData, DemisterSchema (+7 more)

### Community 71 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, clean, dev, dev:local, dev:network, dev:network:hmr, lint (+8 more)

### Community 73 - "task-timeline-bar.tsx"
Cohesion: 0.21
Nodes (14): getDaysDifference(), TaskRoadmapAnalytics(), TaskRoadmapAnalyticsProps, TaskTimelineBar, TaskTimelineBarProps, TimelineHorizon, CompanyName, buildMultiQueryRegex() (+6 more)

### Community 74 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext() (+6 more)

### Community 75 - "alert-dialog.tsx"
Cohesion: 0.30
Nodes (12): GlobalConfirmModal(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader() (+4 more)

### Community 77 - "projects.types.ts"
Cohesion: 0.20
Nodes (12): ProjectsListPageProps, ProjectsListTab, DEFAULT_FILTERS, useProjects(), ProjectFilterState, ProjectStatus, ProjectType, RiskProbability (+4 more)

### Community 78 - "tasks.types.ts"
Cohesion: 0.24
Nodes (9): DEFAULT_FILTERS, matchesUserIdentity(), useTasks(), SubTask, TaskActivity, TaskAssignee, TaskComment, TaskCommentReply (+1 more)

### Community 79 - "chart.tsx"
Cohesion: 0.20
Nodes (13): recharts, ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartStyle(), ChartTooltipContent() (+5 more)

### Community 80 - "EditorSettingsDialog.tsx"
Cohesion: 0.31
Nodes (11): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), EditorSettingsDialog(), Row(), safeT() (+3 more)

### Community 81 - "toggle-group.tsx"
Cohesion: 0.22
Nodes (10): class-variance-authority, Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants, ToggleGroupContext, ToggleGroupItem() (+2 more)

### Community 82 - "fetch_events.js"
Cohesion: 0.18
Nodes (9): fs, https, postRequest(), run(), fs, https, get(), https (+1 more)

### Community 83 - "app/layout.tsx"
Cohesion: 0.26
Nodes (7): RootLayout(), useRelativeTime(), QueryProvider(), ThemeProvider(), TimeContext, TimeProvider(), useNow()

### Community 84 - "slide-settings-drawer.tsx"
Cohesion: 0.22
Nodes (11): ALL_SLIDE_ITEMS, DEFAULT_SLIDE_ITEMS, SlideMenuCustomizerModal(), SlideMenuCustomizerModalProps, SlideMenuItemDef, itemKeySafe(), SlideSettingsDrawer(), SlideSettingsDrawerProps (+3 more)

### Community 85 - "support.schema.ts"
Cohesion: 0.15
Nodes (12): LegData, LegSchema, LugData, LugSchema, SaddleData, SaddleSchema, SkirtData, SkirtSchema (+4 more)

### Community 86 - "stats.service.ts"
Cohesion: 0.18
Nodes (6): FALLBACK, FAKE_STATS, FakeStatsService, IStatsService, RealStatsService, StatItem

### Community 87 - "personnel-form.tsx"
Cohesion: 0.32
Nodes (11): AVATAR_COLOR_PRESETS, LocationPickerMap, PersonnelForm(), getDegreeOptions(), getStudyFieldOptions(), getUniversityOptions(), formatSheba(), getShebaDigits() (+3 more)

### Community 88 - "myFunc.ps1"
Cohesion: 0.26
Nodes (10): engines, node, npm, Get-DevServerUrl(), gp(), op(), run(), runall() (+2 more)

### Community 89 - "drawer.tsx"
Cohesion: 0.20
Nodes (8): vaul, DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerPortal(), DrawerTitle()

### Community 90 - "use-aparat-channel.ts"
Cohesion: 0.24
Nodes (7): AparatContext, AparatProvider(), AparatProviderProps, sample(), useAparatChannel(), UseAparatChannelResult, Profile

### Community 92 - "preferences.service.ts"
Cohesion: 0.21
Nodes (5): DEFAULT_PREFS, FakePreferencesService, IPreferencesService, RealPreferencesService, UserPreferences

### Community 93 - "AdminDashboard.tsx"
Cohesion: 0.31
Nodes (6): AdminPage(), HomePage(), AdminDashboard(), tabMotionVariants, AdminProfileStats(), AuthGate()

### Community 94 - "UserRole"
Cohesion: 0.22
Nodes (6): ROLE_HOME, RegisterPayload, FakeDashboardService, IDashboardService, RealDashboardService, UserRole

### Community 95 - "commodities.service.ts"
Cohesion: 0.24
Nodes (6): CommodityItem, FAKE_COMMODITIES, FakeCommoditiesService, ICommoditiesService, RealCommoditiesService, wait()

### Community 96 - "floatingEdge.ts"
Cohesion: 0.31
Nodes (10): ellipsePoints(), getEdgePosition(), getFloatingEdgeParams(), getNodeIntersection(), nodePolygon(), Point, polygonRayIntersection(), raySegmentIntersection() (+2 more)

### Community 97 - "fetch_bahesab.js"
Cohesion: 0.22
Nodes (7): cheerio, cheerio, fs, persianToEnglishDigits(), scrapeHolidays(), cheerio, fs

### Community 98 - "AdminTasksTime.tsx"
Cohesion: 0.31
Nodes (7): AvatarFallback(), AdminActivities(), AdminHeader(), AdminHeatmapModules(), AdminTasksTime(), AnimatedNumber(), tasksService

### Community 99 - "navigation-menu.tsx"
Cohesion: 0.24
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger(), navigationMenuTriggerStyle (+1 more)

### Community 100 - "admin.types.ts"
Cohesion: 0.22
Nodes (8): AdminFakeService, generateWorkActivity(), INITIAL_REQUESTS, INITIAL_USERS, AccountStatus, Activity, ChecklistItem, RequestStatus

### Community 101 - "scraper.js"
Cohesion: 0.28
Nodes (8): axios, axios, cheerio, fs, getHolidays(), monthMap, parseIranfair(), run()

### Community 102 - "inject_fairs.js"
Cohesion: 0.22
Nodes (8): arrayStart, enObj, faObj, fs, newEvents, parsed, path, serviceContent

### Community 103 - "dashboard-menu-sidebar.tsx"
Cohesion: 0.67
Nodes (5): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), DashboardMenuSidebar()

### Community 104 - "pagination.tsx"
Cohesion: 0.28
Nodes (7): Pagination(), PaginationContent(), PaginationEllipsis(), PaginationLink(), PaginationLinkProps, PaginationNext(), PaginationPrevious()

### Community 105 - "BaseNodeDataSchema"
Cohesion: 0.28
Nodes (7): calcNozzleWeight(), getDensity(), BaseNodeDataSchema, Nozzle, NozzleNodeData, NozzleNodeDataSchema, NozzleSchema

### Community 106 - "head.schema.ts"
Cohesion: 0.22
Nodes (8): Head, HeadNodeData, HeadNodeDataSchema, HeadPosition, HeadPositionSchema, HeadSchema, HeadType, HeadTypeSchema

### Community 107 - "tasks/[id]/route.ts"
Cohesion: 0.36
Nodes (7): Context, DELETE(), GET(), PUT(), deleteServerTask(), getServerTaskById(), updateServerTask()

### Community 108 - "input-group.tsx"
Cohesion: 0.32
Nodes (7): InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea()

### Community 109 - "flowStorage.ts"
Cohesion: 0.29
Nodes (3): FlowState, saveFlowState(), setupAutoSave()

### Community 110 - "exchange-rates.service.ts"
Cohesion: 0.32
Nodes (4): ExchangeRates, FakeExchangeRatesService, IExchangeRatesService, RealExchangeRatesService

### Community 111 - "Getting Started"
Cohesion: 0.29
Nodes (6): ESP App, Features, Getting Started, Manual Setup, One-Liner Setup (PowerShell), Prerequisites

### Community 112 - "parse_excel.js"
Cohesion: 0.29
Nodes (6): xlsx, data, events, fs, workbook, xlsx

### Community 113 - "internals.schema.ts"
Cohesion: 0.29
Nodes (5): DemisterPadSchema, InternalsNodeData, InternalsNodeDataSchema, TraySchema, TrayTypeSchema

### Community 114 - "shell.schema.ts"
Cohesion: 0.29
Nodes (6): ShellCourse, ShellCourseSchema, ShellNodeData, ShellNodeDataSchema, ShellType, ShellTypeSchema

### Community 115 - "update-remove-birthday.js"
Cohesion: 0.29
Nodes (6): enContent, faContent, fs, path, serviceContent, widgetContent

### Community 116 - "eslint.config.mjs"
Cohesion: 0.33
Nodes (3): eslintConfig, eslint-config-prettier, eslint-plugin-react-hooks

### Community 117 - "parse-pdf.js"
Cohesion: 0.33
Nodes (5): events, fs, lines, monthMap, ocr

### Community 118 - "input-otp.tsx"
Cohesion: 0.33
Nodes (4): input-otp, InputOTP(), InputOTPGroup(), InputOTPSlot()

### Community 119 - "parse_pdf_to_js.js"
Cohesion: 0.33
Nodes (5): events, fs, lines, monthMap, ocr

### Community 120 - "UserModuleAccess"
Cohesion: 0.33
Nodes (3): AdminModuleAccessStepProps, FormState, UserModuleAccess

### Community 122 - "task-board.tsx"
Cohesion: 0.47
Nodes (5): TaskBoardProps, ColumnFilters, TaskTableProps, TaskPriority, TaskStatus

### Community 123 - "update-admin-translations.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 124 - "update-admin-translations2.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 125 - "update-admin-translations3.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 126 - "update-admin-translations4.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 127 - "update-translations.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, en, fa, fs

### Community 128 - "fix_types.js"
Cohesion: 0.40
Nodes (4): code, fs, matchFair, matchHol

### Community 129 - "resizable.tsx"
Cohesion: 0.40
Nodes (3): react-resizable-panels, ResizableHandle(), ResizablePanelGroup()

### Community 130 - "replace.js"
Cohesion: 0.40
Nodes (3): code, events, fs

### Community 131 - "scratch_translations.js"
Cohesion: 0.40
Nodes (3): enProfile, faProfile, fs

### Community 132 - "remove-icons.js"
Cohesion: 0.40
Nodes (4): endIdx, fs, lines, startIdx

### Community 133 - "channelstats.tsx"
Cohesion: 0.50
Nodes (4): ChannelStats(), ExtendedChannelStatsProps, StatItem, ChannelStatsProps

### Community 134 - "fix_en_json.js"
Cohesion: 0.50
Nodes (3): enData, faData, fs

### Community 135 - "parse.js"
Cohesion: 0.50
Nodes (3): fs, html, urls

### Community 137 - "constants/layout.ts"
Cohesion: 0.50
Nodes (3): HEADER_HEIGHT, MAX_CONTENT_WIDTH, SIDEBAR_WIDTH

### Community 138 - "flangeWeightTable.ts"
Cohesion: 0.50
Nodes (3): FLANGE_WEIGHTS, FlangeClass, FlangeType

### Community 139 - "pipeDimensions.ts"
Cohesion: 0.50
Nodes (3): PIPE_DIMENSIONS, PipeNPS, PipeSchedule

### Community 140 - "update-admin-translations-fix.js"
Cohesion: 0.50
Nodes (3): enData, faData, fs

### Community 141 - "update-departments.js"
Cohesion: 0.50
Nodes (3): en, fa, fs

### Community 142 - "update-tabs-motion.js"
Cohesion: 0.50
Nodes (3): calContent, checkContent, fs

### Community 143 - "browserslist"
Cohesion: 0.67
Nodes (3): browserslist, development, production

### Community 144 - "repository"
Cohesion: 0.67
Nodes (3): repository, type, url

## Knowledge Gaps
- **928 isolated node(s):** `DiagramNode`, `Props`, `DiagramNode`, `JacketData`, `Props` (+923 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1130 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `Input`, `BaseNode.tsx`, `search-results-client.tsx`, `cn`, `package.json`, `Combobox`, `AdminRequests.tsx`, `QuickAccessSection.tsx`, `hover-card.tsx`, `dashboard.tsx`, `search/services/search.service.ts`, `store/index.ts`, `Button`, `[locale]/layout.tsx`, `sidebar.tsx`, `dashboard.service.ts`, `search/page.tsx`, `src/services/index.ts`, `Badge`, `use-auth.ts`, `Toolbar.tsx`, `modal-shell.tsx`, `DiagramCanvas.tsx`, `profile-page.tsx`, `dictionary-page.tsx`, `GeneralDataNode.tsx`, `date-picker.tsx`, `aparat-client.tsx`, `register/page.tsx`, `docs-page-container.tsx`, `DiagramEditor.tsx`, `SettingsPanel.tsx`, `dashboard-control-hub-modal.tsx`, `sitemap-client.tsx`, `ProjectDataNode.tsx`, `login/page.tsx`, `AdminProfileStats.tsx`, `channel-video-search.tsx`, `home-client.tsx`, `stats-section.tsx`, `VideoListItem`, `EngineeringObject.tsx`, `AdminUserConfig.tsx`, `src/types/index.ts`, `Link`, `tasks-management-page.tsx`, `task-detail-view.tsx`, `multi-button.tsx`, `User`, `ProjectItem`, `task-timeline-bar.tsx`, `carousel.tsx`, `alert-dialog.tsx`, `projects.types.ts`, `tasks.types.ts`, `chart.tsx`, `EditorSettingsDialog.tsx`, `toggle-group.tsx`, `app/layout.tsx`, `slide-settings-drawer.tsx`, `stats.service.ts`, `personnel-form.tsx`, `drawer.tsx`, `use-aparat-channel.ts`, `AdminDashboard.tsx`, `AdminTasksTime.tsx`, `navigation-menu.tsx`, `dashboard-menu-sidebar.tsx`, `pagination.tsx`, `input-group.tsx`, `input-otp.tsx`, `task-board.tsx`?**
  _High betweenness centrality (0.192) - this node is a cross-community bridge._
- **What connects `DiagramNode`, `Props`, `DiagramNode` to the rest of the system?**
  _928 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.0502679994205418 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `Input`, `resizable.tsx`, `react`, `search-results-client.tsx`, `BaseNode.tsx`, `channelstats.tsx`, `Combobox`, `AdminRequests.tsx`, `QuickAccessSection.tsx`, `hover-card.tsx`, `dashboard.tsx`, `store/index.ts`, `Button`, `[locale]/layout.tsx`, `sidebar.tsx`, `dashboard.service.ts`, `Badge`, `Toolbar.tsx`, `DiagramCanvas.tsx`, `profile-page.tsx`, `dictionary-page.tsx`, `GeneralDataNode.tsx`, `date-picker.tsx`, `aparat-client.tsx`, `register/page.tsx`, `docs-page-container.tsx`, `DiagramEditor.tsx`, `SettingsPanel.tsx`, `dashboard-control-hub-modal.tsx`, `sitemap-client.tsx`, `login/page.tsx`, `AdminProfileStats.tsx`, `channel-video-search.tsx`, `home-client.tsx`, `VideoListItem`, `AdminUserConfig.tsx`, `Link`, `tasks-management-page.tsx`, `task-detail-view.tsx`, `multi-button.tsx`, `task-timeline-bar.tsx`, `carousel.tsx`, `alert-dialog.tsx`, `projects.types.ts`, `chart.tsx`, `EditorSettingsDialog.tsx`, `toggle-group.tsx`, `slide-settings-drawer.tsx`, `personnel-form.tsx`, `drawer.tsx`, `AdminDashboard.tsx`, `AdminTasksTime.tsx`, `navigation-menu.tsx`, `dashboard-menu-sidebar.tsx`, `pagination.tsx`, `input-group.tsx`, `input-otp.tsx`, `task-board.tsx`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **Should `BaseNode.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.049062049062049064 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `react`, `search-results-client.tsx`, `package.json`, `AdminRequests.tsx`, `[locale]/layout.tsx`, `Badge`, `profile-page.tsx`, `dictionary-page.tsx`, `aparat-client.tsx`, `MarketQuote`, `register/page.tsx`, `docs-page-container.tsx`, `DiagramEditor.tsx`, `login/page.tsx`, `projects-tasks-store.ts`, `VideoListItem`, `refactor_admin.js`, `tasks-management-page.tsx`, `task-detail-view.tsx`, `personnel-form.tsx`, `tasks/[id]/route.ts`?**
  _High betweenness centrality (0.144) - this node is a cross-community bridge._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.06234567901234568 - nodes in this community are weakly interconnected._