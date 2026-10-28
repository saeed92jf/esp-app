# Graph Report - esp-app  (2026-10-27)

## Corpus Check
- 537 files · ~815,543 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 117 file(s) not represented in the graph (top: .woff2 69, .css 16, .woff 13)

## Summary
- 3202 nodes · 9939 edges · 164 communities (132 shown, 32 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 58 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d3d73452`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- sidebar.tsx
- tasks-management-page.tsx
- VesselNodeBase.tsx
- DiagramEditor.tsx
- Link
- lucide-react
- dashboard-avatar.tsx
- dependencies
- profile-page.tsx
- AdminDashboard.tsx
- i18n/navigation.ts
- ProjectItem
- package.json
- BaseNode.tsx
- Input
- mini-chart.tsx
- settings-section.tsx
- store/index.ts
- HeroFlow.tsx
- Combobox
- TooltipContent
- side-menu.tsx
- paths
- dictionary-page.tsx
- src/services/index.ts
- profile.ts
- ref_fs
- projects-tasks-store.ts
- DiagramCanvas.tsx
- AdminRequests.tsx
- TaskItem
- EngineeringObject.tsx
- MarketQuote
- docs-page-container.tsx
- test-scheduler.ts
- channel-video-search.tsx
- VideoListItem
- dashboard.service.ts
- ProjectDataNode.tsx
- sitemap-client.tsx
- src/types/index.ts
- HttpClient
- attachments.schema.ts
- components.json
- search/services/search.service.ts
- User
- did-you-know-page.tsx
- Toolbar.tsx
- stats-section.tsx
- dashboard-control-hub-modal.tsx
- search-results-client.tsx
- aparat.service.ts
- devDependencies
- مشخصات و مستندات API سرور (Backend API Specification)
- refactor_admin.js
- ShellNode.tsx
- Badge
- ShapeNodes.tsx
- next-intl
- scratch/package.json
- config/navigation.ts
- navigation-search.ts
- menubar.tsx
- fakeProjectsService
- base.schema.ts
- mistEliminator.schema.ts
- useAuth
- scripts
- aparat-client.tsx
- auth.service.ts
- FakeAuthService
- HeadNode.tsx
- context-menu.tsx
- radix-ui
- Button
- IAuthService
- carousel.tsx
- project-create-view.tsx
- date-picker.tsx
- fetch_events.js
- alert-dialog.tsx
- RealAuthService
- slide-settings-drawer.tsx
- support.schema.ts
- myFunc.ps1
- drawer.tsx
- zod
- alert.tsx
- commodities.service.ts
- floatingEdge.ts
- fetch_bahesab.js
- TransmittalLetter
- scraper.js
- inject_fairs.js
- preferences.service.ts
- head.schema.ts
- flowStorage.ts
- Getting Started
- parse_excel.js
- src/services/search.service.ts
- task-detail-view.tsx
- internals.schema.ts
- AdminUserConfig.tsx
- update-remove-birthday.js
- eslint.config.mjs
- parse-pdf.js
- parse_pdf_to_js.js
- time-provider.tsx
- update-admin-translations.js
- update-admin-translations2.js
- update-admin-translations3.js
- update-admin-translations4.js
- update-translations.js
- fix_types.js
- replace.js
- scratch_translations.js
- remove-icons.js
- next
- NozzleNode.tsx
- fix_en_json.js
- parse.js
- chart.tsx
- EditorSettingsDialog.tsx
- constants/layout.ts
- flangeWeightTable.ts
- pipeDimensions.ts
- update-admin-translations-fix.js
- update-departments.js
- update-tabs-motion.js
- browserslist
- repository
- fix_titles.js
- modal-shell.tsx
- cn
- react
- dateParser.ts
- update-calendar-badges.js
- update-checklist.js
- update-profile.js
- update-time-tabs.js
- postcss.config.mjs
- SettingsPanel.tsx
- profile-search.ts
- channelstats.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 533 edges
2. `react` - 270 edges
3. `Button()` - 211 edges
4. `lucide-react` - 184 edges
5. `next-intl` - 172 edges
6. `Input` - 133 edges
7. `Combobox()` - 79 edges
8. `useDiagramStore` - 74 edges
9. `Link` - 68 edges
10. `TooltipContent()` - 53 edges

## Surprising Connections (you probably didn't know these)
- `۵. ماژول مدیریت پروژه‌ها، اسناد VDIS و نامه‌های ترانسمیتال (Projects)` --references--> `ProjectPhase`  [INFERRED]
  API_SPECIFICATION.md → src/modules/projects/types/projects.types.ts
- `۵. ماژول مدیریت پروژه‌ها، اسناد VDIS و نامه‌های ترانسمیتال (Projects)` --references--> `ProjectRiskItem`  [INFERRED]
  API_SPECIFICATION.md → src/modules/projects/types/projects.types.ts
- `۵. ماژول مدیریت پروژه‌ها، اسناد VDIS و نامه‌های ترانسمیتال (Projects)` --references--> `VdisDocumentItem`  [INFERRED]
  API_SPECIFICATION.md → src/modules/projects/types/projects.types.ts
- `۵. ماژول مدیریت پروژه‌ها، اسناد VDIS و نامه‌های ترانسمیتال (Projects)` --references--> `TransmittalLetter`  [INFERRED]
  API_SPECIFICATION.md → src/modules/projects/types/projects.types.ts
- `۴. ماژول مدیریت وظایف و تسک‌ها (Tasks Management)` --references--> `TaskCommentReply`  [INFERRED]
  API_SPECIFICATION.md → src/modules/tasks/types/tasks.types.ts

## Import Cycles
- None detected.

## Communities (164 total, 32 thin omitted)

### Community 0 - "sidebar.tsx"
Cohesion: 0.08
Nodes (29): Separator(), SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter(), SidebarGroup(), SidebarGroupAction(), SidebarGroupContent() (+21 more)

### Community 1 - "tasks-management-page.tsx"
Cohesion: 0.18
Nodes (12): Props, TaskDetailPage(), Page(), Props, Page(), Props, NAV_ITEMS, NavItem (+4 more)

### Community 2 - "VesselNodeBase.tsx"
Cohesion: 0.06
Nodes (87): @xyflow/react, Checkbox(), AttachmentsNode, createNewAttachment(), DiagramNode, Props, DiagramNode, GeneralDataNode (+79 more)

### Community 3 - "DiagramEditor.tsx"
Cohesion: 0.12
Nodes (21): FlowPage(), metadata, DiagramEditor(), DiagramEditorProps, EditorShell(), safeT(), Toast(), DiagramLibraryDialog() (+13 more)

### Community 4 - "Link"
Cohesion: 0.13
Nodes (39): @hookform/resolvers, react-hook-form, AccountPendingPage(), AccountRequestPage(), ForgotPasswordPage(), LoginPage(), RegisterPage(), ResetPasswordContent() (+31 more)

### Community 5 - "lucide-react"
Cohesion: 0.15
Nodes (18): lucide-react, GoogleAddShortcutTile(), GoogleAddShortcutTileProps, GoogleShortcutModal(), GoogleShortcutModalProps, QuickAccessCustomizer(), QuickAccessCustomizerProps, QuickAccessCard() (+10 more)

### Community 6 - "dashboard-avatar.tsx"
Cohesion: 0.16
Nodes (21): HelpPopover(), Popover(), PopoverAnchor(), PopoverContent(), PopoverTrigger(), ScrollArea(), ScrollBar(), getSegmentedAccordionHeaderClass() (+13 more)

### Community 7 - "dependencies"
Cohesion: 0.03
Nodes (79): dependencies, @auth/core, axios, @base-ui/react, bcryptjs, class-variance-authority, clsx, cmdk (+71 more)

### Community 8 - "profile-page.tsx"
Cohesion: 0.08
Nodes (35): Page(), Props, ColorPicker(), ComboboxOption, AVATAR_COLOR_PRESETS, LocationPickerMap, PersonnelForm(), AVATAR_COLOR_PRESETS (+27 more)

### Community 9 - "AdminDashboard.tsx"
Cohesion: 0.05
Nodes (39): AdminPage(), HomePage(), ServerConnectionError(), ServerConnectionErrorInfo, AdminActivities(), AdminActivitiesProps, AdminDashboard(), tabMotionVariants (+31 more)

### Community 10 - "i18n/navigation.ts"
Cohesion: 0.14
Nodes (23): AppShell(), AppShellProps, ConditionalFooter(), ConditionalHeader(), HIDDEN_PREFIXES, Footer(), FooterLinkItem, FooterProps (+15 more)

### Community 11 - "ProjectItem"
Cohesion: 0.08
Nodes (15): ProjectBoardsTabProps, ProjectPhasesWbsTabProps, ProjectReportsAnalyticsTabProps, ProjectRisksTabProps, ProjectStrategicOkrsTabProps, DEFAULT_PROJECT_PHASES, INITIAL_PROJECTS, projectsService (+7 more)

### Community 12 - "package.json"
Cohesion: 0.03
Nodes (70): author, axios, xlsx, keywords, license, name, private, version (+62 more)

### Community 13 - "BaseNode.tsx"
Cohesion: 0.06
Nodes (80): BEAM_SHAPE_LABELS, BeamCalcNode(), ChartNode(), CircleNode(), CloudNode(), ConstantNode(), CORNER_OFFSET_STYLE, CornerResizer() (+72 more)

### Community 14 - "Input"
Cohesion: 0.09
Nodes (45): motion, InputGroupInput(), Input, ActivityFeed(), ChecklistWidget(), AVAILABLE_WIDGETS, CustomDashboardBuilder(), CustomWidgetMeta (+37 more)

### Community 15 - "mini-chart.tsx"
Cohesion: 0.06
Nodes (51): CompactMultiButton, CompactMultiButtonProps, actionDefinitions, MultiButtonDemo(), MultiButton, MultiButtonGroupContext, MultiButtonGroupContextValue, MultiButtonGroupProps (+43 more)

### Community 16 - "settings-section.tsx"
Cohesion: 0.11
Nodes (20): next-themes, sonner, @tanstack/react-query, RootLayout(), MODE_OPTIONS, SettingsSection(), THEME_OPTIONS, DEFAULT_PRIMARY_COLOR (+12 more)

### Community 17 - "store/index.ts"
Cohesion: 0.09
Nodes (45): CustomEdge(), JacketNodeData, RegenVacuumSteamoutNodeData, SurfacePrepNodeData, VesselNodeContainerProps, DEFAULT_SETTINGS, DiagramStore, ArithmeticOperation (+37 more)

### Community 18 - "HeroFlow.tsx"
Cohesion: 0.15
Nodes (25): Page(), CommandDialog(), Dialog(), DialogContent(), DialogDescription(), DialogHeader(), DialogOverlay(), DialogPortal() (+17 more)

### Community 19 - "Combobox"
Cohesion: 0.10
Nodes (30): cmdk, Combobox(), COMBOBOX_SEARCH_THRESHOLD, ComboboxProps, sizeClasses, Command(), CommandEmpty(), CommandGroup() (+22 more)

### Community 20 - "TooltipContent"
Cohesion: 0.17
Nodes (21): Page(), Props, SearchPopup(), SearchPopupProps, AiModeIcon(), GenericSearchBox(), GenericSearchBoxProps, Tooltip() (+13 more)

### Community 21 - "side-menu.tsx"
Cohesion: 0.18
Nodes (14): @phosphor-icons/react, SideMenuContent(), SideMenuContentProps, SideMenu(), AnimatedHamburger(), AnimatedHamburgerProps, createLineTransition(), dotSpring (+6 more)

### Community 22 - "paths"
Cohesion: 0.05
Nodes (36): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+28 more)

### Community 23 - "dictionary-page.tsx"
Cohesion: 0.11
Nodes (29): buildBilingualPattern(), escapeRegExp(), HighlightMatch(), HighlightMatchProps, DICE_FACES, NAV_ITEMS, CustomDictionaryTermInput, useDictionary() (+21 more)

### Community 24 - "src/services/index.ts"
Cohesion: 0.08
Nodes (22): ExchangeRates, FakeExchangeRatesService, IExchangeRatesService, RealExchangeRatesService, FALLBACK, ApiErrorResponse, ApiResponse, ApiResult (+14 more)

### Community 25 - "profile.ts"
Cohesion: 0.11
Nodes (18): PersonnelFormProps, fakeProfileService, MOCK_PROFILE, profileService, profileService, realProfileService, ContractType, DependentInfo (+10 more)

### Community 26 - "ref_fs"
Cohesion: 0.06
Nodes (20): code, fs, fs, fs, content, fs, content, fs (+12 more)

### Community 27 - "projects-tasks-store.ts"
Cohesion: 0.13
Nodes (23): Context, DELETE(), GET(), PUT(), GET(), POST(), Context, DELETE() (+15 more)

### Community 28 - "DiagramCanvas.tsx"
Cohesion: 0.11
Nodes (28): clampPosition(), ContextMenu(), ContextMenuState, QuickAddItem, safeT(), absolutePosition(), BG_VARIANT_MAP, DiagramCanvas() (+20 more)

### Community 29 - "AdminRequests.tsx"
Cohesion: 0.14
Nodes (24): AdminRequests(), normalizeDigits(), ReqSegmentId, sanitizeEnglish(), sanitizePersian(), ALL_DEPARTMENTS, ALL_JOB_TITLES, BASIC_INSURANCE_PROVIDERS (+16 more)

### Community 30 - "TaskItem"
Cohesion: 0.08
Nodes (8): ۴. ماژول مدیریت وظایف و تسک‌ها (Tasks Management), fakeTasksService, INITIAL_MOCK_TASKS, RealTasksService, TasksService, TaskComment, TaskCommentReply, TaskItem

### Community 31 - "EngineeringObject.tsx"
Cohesion: 0.15
Nodes (15): @react-three/drei, @react-three/fiber, three, OutputNode, OutputNodeData, ShapeNode, ShapeNodeData, ShapeOption (+7 more)

### Community 32 - "MarketQuote"
Cohesion: 0.16
Nodes (14): dynamic, fetchCache, GET(), MARKET_SYMBOLS, MarketController, MarketHistory, MarketQuote, MarketSymbol (+6 more)

### Community 33 - "docs-page-container.tsx"
Cohesion: 0.16
Nodes (18): HelpDocsPage(), Props, DocsDirectPage(), Props, DocsContentView(), DocsContentViewProps, DocsPageContainer(), DocsSidebar() (+10 more)

### Community 34 - "test-scheduler.ts"
Cohesion: 0.11
Nodes (17): @playwright/test, args, intervalArg, isQuick, isSchedule, isWatch, main(), printHeader() (+9 more)

### Community 35 - "channel-video-search.tsx"
Cohesion: 0.14
Nodes (27): normalizeSearchText(), ChannelHeader(), ChannelHeaderProps, ChannelVideoSearch(), ChannelVideoSearchProps, Playlist(), SlidingTabItem, SlidingTabs() (+19 more)

### Community 36 - "VideoListItem"
Cohesion: 0.10
Nodes (14): AparatContext, AparatProvider(), AparatProviderProps, sample(), useAparatChannel(), UseAparatChannelResult, VideoCardProps, IAparatService (+6 more)

### Community 37 - "dashboard.service.ts"
Cohesion: 0.10
Nodes (17): STATUS_CONFIG, ActivityItem, ChecklistItem, ChecklistPeriod, FAKE_DATA, IconName, MONTHS, REAL_EVENTS (+9 more)

### Community 38 - "ProjectDataNode.tsx"
Cohesion: 0.18
Nodes (23): PhoneInput(), PhoneInputProps, applyMask(), cleanRawPhone(), COUNTRIES, Country, getCountryByCode(), toEnglishDigits() (+15 more)

### Community 39 - "sitemap-client.tsx"
Cohesion: 0.13
Nodes (20): SitemapPage(), AccessFilter, SitemapClient(), ViewMode, API_ARCHITECTURE_OVERVIEW, ApiDomain, ApiEndpointContract, ApiErrorScenario (+12 more)

### Community 40 - "src/types/index.ts"
Cohesion: 0.11
Nodes (18): CategoryTabsProps, ChannelHeaderProps, ChannelInfo, ChannelProfile, ChannelResponse, ChannelStatsProps, LiveStream, PlaylistProps (+10 more)

### Community 41 - "HttpClient"
Cohesion: 0.17
Nodes (7): ApiError, ErrorCode, toApiError(), getToken(), HttpClient, isRetryable(), sleep()

### Community 42 - "attachments.schema.ts"
Cohesion: 0.14
Nodes (21): calcAttachmentWeight(), calcInsulationSupportWeight(), calcLiftingLugWeight(), calcNamePlateWeight(), calcTurningLugWeight(), getDensity(), AttachmentItem, AttachmentItemSchema (+13 more)

### Community 43 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 44 - "search/services/search.service.ts"
Cohesion: 0.17
Nodes (15): ALL_SEARCH_ITEMS, SEARCH_SUGGESTIONS_LEXICON, UseUniversalSearchOptions, BILINGUAL_SYNONYMS, FakeSearchService, ISearchService, isEnglishQuery(), isPersianQuery() (+7 more)

### Community 45 - "User"
Cohesion: 0.13
Nodes (10): AuthState, LoginResult, AUTH_USER_KEY, ChangePasswordPayload, FakeUserService, IUserService, RealUserService, UpdateProfilePayload (+2 more)

### Community 46 - "did-you-know-page.tsx"
Cohesion: 0.14
Nodes (14): Page(), DICE_FACES, MATH_FORMULA_STYLE, NAV_ITEMS, CustomCardInput, THEME_PRESETS, useDidYouKnow(), DidYouKnowSection() (+6 more)

### Community 47 - "Toolbar.tsx"
Cohesion: 0.09
Nodes (36): elkjs, html-to-image, GoogleShortcutTile(), cardItemVariants, editGridVariants, normalRowVariants, QuickAccessSection(), QuickAccessSectionProps (+28 more)

### Community 48 - "stats-section.tsx"
Cohesion: 0.16
Nodes (14): StatCard(), StatsSection(), StatsSectionProps, STATS, useCountUp(), UseCountUpOptions, useInView(), UseInViewOptions (+6 more)

### Community 49 - "dashboard-control-hub-modal.tsx"
Cohesion: 0.15
Nodes (21): DashboardControlHubModal(), DashboardControlHubModalProps, DashboardToolbar(), DashboardToolbarProps, DashboardSchematicStudioModalProps, DashboardSettingsPopoverProps, HiddenWidgetBadge(), DASHBOARD_TABS (+13 more)

### Community 50 - "search-results-client.tsx"
Cohesion: 0.17
Nodes (16): SearchPage(), GoogleSearchBox(), GoogleSearchBoxProps, SiteSearch(), Sheet(), SheetContent(), SheetDescription(), SheetHeader() (+8 more)

### Community 51 - "aparat.service.ts"
Cohesion: 0.21
Nodes (13): AparatService, decodeEntities(), endpointFromAparatUrl(), isAbortError(), isTransient(), normalizeVideo(), pickKey(), pickNextPageUrl() (+5 more)

### Community 52 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, eslint, eslint-config-next, eslint-config-prettier, eslint-plugin-react, eslint-plugin-react-hooks, @playwright/test, prettier (+12 more)

### Community 53 - "مشخصات و مستندات API سرور (Backend API Specification)"
Cohesion: 0.11
Nodes (17): ساختار مدل داده پرونده پرسنلی (UserProfile Data Model):, سامانه جامع پورتال سازمانی یورو اسلات پارس (Euroslot Pars), مشخصات و مستندات API سرور (Backend API Specification), ۱. اصول عمومی و استانداردهای ارتباطی (General Conventions), ۱. ورود به سامانه (Login):, ۱.۱. آدرس‌پایه (Base URL), ۱.۲. احراز هویت (Authentication Header), ۱.۳. فرمت استاندارد پاسخ خطاها (Error Response Schema) (+9 more)

### Community 54 - "refactor_admin.js"
Cohesion: 0.11
Nodes (12): adminDashboardPath, adminDir, content, fs, path, fs, path, srcDir (+4 more)

### Community 55 - "ShellNode.tsx"
Cohesion: 0.19
Nodes (13): DiagramNode, makeCourse(), Props, ShellNode, VesselSubSectionHeader(), NPS, PipeDimensions, PipeSchedule (+5 more)

### Community 56 - "Badge"
Cohesion: 0.31
Nodes (16): Badge(), badgeVariants, DialogFooter(), Progress(), ProjectWorkspacePage(), ProjectWorkspacePageProps, TabKey, ProjectBoardsTab() (+8 more)

### Community 57 - "ShapeNodes.tsx"
Cohesion: 0.15
Nodes (14): BaseNodeShell(), BaseNodeShellProps, DefaultNode(), FONT_WEIGHT_MAP, getNodeStyle(), VesselHandlesProps, FLOW_HANDLE_CIRCLE, FLOW_HANDLE_CLASS (+6 more)

### Community 58 - "next-intl"
Cohesion: 0.13
Nodes (14): next-intl, HomePage(), MultiButtonGroup, DidYouKnowSectionProps, DISCOVER_ITEMS, DiscoverItem, DiscoverSection(), FeaturedModulesCard() (+6 more)

### Community 59 - "scratch/package.json"
Cohesion: 0.12
Nodes (16): author, dependencies, axios, cheerio, xlsx, description, axios, xlsx (+8 more)

### Community 60 - "config/navigation.ts"
Cohesion: 0.17
Nodes (10): NAV_COLOR_ICON_GRADIENT_MAP, NAV_COLOR_MAP, NavGroup, NavItem, PRIMARY_NAV, PUBLIC_NAV_ITEMS, FakeNavigationService, INavigationService (+2 more)

### Community 61 - "navigation-search.ts"
Cohesion: 0.18
Nodes (12): GoogleShortcutTileProps, highlightText(), NavSearchResult(), NavColor, useSiteSearchItems(), BILINGUAL_KEYWORDS, getBilingualKeywords(), NAV_SEARCH_SOURCE (+4 more)

### Community 62 - "menubar.tsx"
Cohesion: 0.12
Nodes (12): Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarPortal(), MenubarRadioItem(), MenubarSeparator() (+4 more)

### Community 64 - "base.schema.ts"
Cohesion: 0.11
Nodes (17): AggregateInput, BaseNodeDataSchema, NodePositionSchema, UnitSystem, UnitSystemSchema, WeightSummary, WeightSummarySchema, NozzleNodeData (+9 more)

### Community 65 - "mistEliminator.schema.ts"
Cohesion: 0.15
Nodes (15): calcDemisterWeight(), calculateCircularSegments(), circleHalfArea(), getDensity(), YORK_DENSITIES, BeamProfileSchema, DemisterData, DemisterSchema (+7 more)

### Community 66 - "useAuth"
Cohesion: 0.35
Nodes (11): zustand, AppHeader(), AppHeaderProps, AppsPopover(), Header(), LocaleSwitcher(), ThemeToggle(), useAuth() (+3 more)

### Community 67 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, clean, dev, dev:local, dev:network, dev:network:hmr, lint (+8 more)

### Community 68 - "aparat-client.tsx"
Cohesion: 0.16
Nodes (5): AparatClient(), AparatClientProps, TaggedVideo, AparatPage(), ChannelInfoBar()

### Community 69 - "auth.service.ts"
Cohesion: 0.12
Nodes (15): ROLE_HOME, AccountRequestPayload, AccountRequestRecord, AccountRequestResult, AccountStatusResult, DEMO_USERS, LoginPayload, RegisterPayload (+7 more)

### Community 71 - "HeadNode.tsx"
Cohesion: 0.20
Nodes (14): createDefaultHead(), DiagramNode, HEAD_TYPES, HeadNode, MATERIALS, NPS_OPTIONS, POSITIONS, Props (+6 more)

### Community 72 - "context-menu.tsx"
Cohesion: 0.12
Nodes (10): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+2 more)

### Community 73 - "radix-ui"
Cohesion: 0.09
Nodes (16): class-variance-authority, radix-ui, HoverCardContent(), NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink() (+8 more)

### Community 74 - "Button"
Cohesion: 0.12
Nodes (19): LocaleNotFound(), PrivacyPage(), TermsPage(), NotFoundPage(), ThemeToggle(), Button(), buttonVariants, Calendar() (+11 more)

### Community 76 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext() (+6 more)

### Community 77 - "project-create-view.tsx"
Cohesion: 0.15
Nodes (18): DefaultPhaseItem, INITIAL_PHASES, ProjectCreateView(), ProjectCreateViewProps, ProjectStepId, ProjectsListPage(), ProjectsListPageProps, ProjectsListTab (+10 more)

### Community 78 - "date-picker.tsx"
Cohesion: 0.11
Nodes (24): date-fns-jalali, CalendarContent(), CalendarContentProps, DatePickerProps, getGregorianDaysInMonth(), getJalaliDaysInMonth(), GREGORIAN_MONTHS_EN, GREGORIAN_MONTHS_FA (+16 more)

### Community 79 - "fetch_events.js"
Cohesion: 0.18
Nodes (9): fs, https, postRequest(), run(), fs, https, get(), https (+1 more)

### Community 80 - "alert-dialog.tsx"
Cohesion: 0.22
Nodes (15): GlobalConfirmModal(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader() (+7 more)

### Community 82 - "slide-settings-drawer.tsx"
Cohesion: 0.22
Nodes (11): ALL_SLIDE_ITEMS, DEFAULT_SLIDE_ITEMS, SlideMenuCustomizerModal(), SlideMenuCustomizerModalProps, SlideMenuItemDef, itemKeySafe(), SlideSettingsDrawer(), SlideSettingsDrawerProps (+3 more)

### Community 83 - "support.schema.ts"
Cohesion: 0.15
Nodes (12): LegData, LegSchema, LugData, LugSchema, SaddleData, SaddleSchema, SkirtData, SkirtSchema (+4 more)

### Community 84 - "myFunc.ps1"
Cohesion: 0.26
Nodes (10): engines, node, npm, Get-DevServerUrl(), gp(), op(), run(), runall() (+2 more)

### Community 85 - "drawer.tsx"
Cohesion: 0.20
Nodes (8): vaul, DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerPortal(), DrawerTitle()

### Community 86 - "zod"
Cohesion: 0.13
Nodes (13): zod, AccountRequestInput, companyEmailRe, LoginInput, Material, MATERIAL_DENSITY, MaterialSchema, ShellCourse (+5 more)

### Community 87 - "alert.tsx"
Cohesion: 0.40
Nodes (5): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants

### Community 88 - "commodities.service.ts"
Cohesion: 0.24
Nodes (6): CommodityItem, FAKE_COMMODITIES, FakeCommoditiesService, ICommoditiesService, RealCommoditiesService, wait()

### Community 89 - "floatingEdge.ts"
Cohesion: 0.31
Nodes (10): ellipsePoints(), getEdgePosition(), getFloatingEdgeParams(), getNodeIntersection(), nodePolygon(), Point, polygonRayIntersection(), raySegmentIntersection() (+2 more)

### Community 90 - "fetch_bahesab.js"
Cohesion: 0.22
Nodes (7): cheerio, cheerio, fs, persianToEnglishDigits(), scrapeHolidays(), cheerio, fs

### Community 91 - "TransmittalLetter"
Cohesion: 0.17
Nodes (5): ProjectOverviewTabProps, ProjectVdisTransmittalTabProps, ProjectSubPackage, TransmittalLetter, VdisDocumentItem

### Community 92 - "scraper.js"
Cohesion: 0.28
Nodes (7): axios, cheerio, fs, getHolidays(), monthMap, parseIranfair(), run()

### Community 93 - "inject_fairs.js"
Cohesion: 0.22
Nodes (8): arrayStart, enObj, faObj, fs, newEvents, parsed, path, serviceContent

### Community 94 - "preferences.service.ts"
Cohesion: 0.19
Nodes (5): DEFAULT_PREFS, FakePreferencesService, IPreferencesService, RealPreferencesService, UserPreferences

### Community 95 - "head.schema.ts"
Cohesion: 0.22
Nodes (8): Head, HeadNodeData, HeadNodeDataSchema, HeadPosition, HeadPositionSchema, HeadSchema, HeadType, HeadTypeSchema

### Community 96 - "flowStorage.ts"
Cohesion: 0.29
Nodes (3): FlowState, saveFlowState(), setupAutoSave()

### Community 97 - "Getting Started"
Cohesion: 0.29
Nodes (6): ESP App, Features, Getting Started, Manual Setup, One-Liner Setup (PowerShell), Prerequisites

### Community 98 - "parse_excel.js"
Cohesion: 0.29
Nodes (5): data, events, fs, workbook, xlsx

### Community 99 - "src/services/search.service.ts"
Cohesion: 0.22
Nodes (5): FakeSearchService, ISearchService, RealSearchService, SearchPayload, SearchResponse

### Community 100 - "task-detail-view.tsx"
Cohesion: 0.08
Nodes (57): react-dom, Avatar(), AvatarFallback(), DatePicker(), getJalaliDate(), AdminHeader(), CalendarWidget(), TYPE_COLORS (+49 more)

### Community 101 - "internals.schema.ts"
Cohesion: 0.29
Nodes (5): DemisterPadSchema, InternalsNodeData, InternalsNodeDataSchema, TraySchema, TrayTypeSchema

### Community 102 - "AdminUserConfig.tsx"
Cohesion: 0.39
Nodes (7): AdminModuleAccessStep(), AdminUserConfig(), INITIAL_FORM, normalizeDigits(), sanitizeEnglish(), sanitizePersian(), SegmentId

### Community 103 - "update-remove-birthday.js"
Cohesion: 0.29
Nodes (6): enContent, faContent, fs, path, serviceContent, widgetContent

### Community 104 - "eslint.config.mjs"
Cohesion: 0.33
Nodes (3): eslintConfig, eslint-config-prettier, eslint-plugin-react-hooks

### Community 105 - "parse-pdf.js"
Cohesion: 0.33
Nodes (5): events, fs, lines, monthMap, ocr

### Community 106 - "parse_pdf_to_js.js"
Cohesion: 0.33
Nodes (5): events, fs, lines, monthMap, ocr

### Community 107 - "time-provider.tsx"
Cohesion: 0.60
Nodes (3): useRelativeTime(), TimeContext, useNow()

### Community 108 - "update-admin-translations.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 109 - "update-admin-translations2.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 110 - "update-admin-translations3.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 111 - "update-admin-translations4.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 112 - "update-translations.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, en, fa, fs

### Community 113 - "fix_types.js"
Cohesion: 0.40
Nodes (4): code, fs, matchFair, matchHol

### Community 114 - "replace.js"
Cohesion: 0.40
Nodes (3): code, events, fs

### Community 115 - "scratch_translations.js"
Cohesion: 0.40
Nodes (3): enProfile, faProfile, fs

### Community 116 - "remove-icons.js"
Cohesion: 0.40
Nodes (4): endIdx, fs, lines, startIdx

### Community 117 - "next"
Cohesion: 0.05
Nodes (31): nextConfig, withNextIntl, next, GET(), revalidateSeconds(), GET(), getCategory(), REFINERY_SYMBOLS (+23 more)

### Community 118 - "NozzleNode.tsx"
Cohesion: 0.16
Nodes (13): createNewNozzle(), DiagramNode, FLANGE_CLASSES, FLANGE_FACES, FLANGE_TYPES, NECK_FORMS, Props, RT_OPTIONS (+5 more)

### Community 119 - "fix_en_json.js"
Cohesion: 0.50
Nodes (3): enData, faData, fs

### Community 120 - "parse.js"
Cohesion: 0.50
Nodes (3): fs, html, urls

### Community 121 - "chart.tsx"
Cohesion: 0.20
Nodes (13): recharts, ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartStyle(), ChartTooltipContent() (+5 more)

### Community 122 - "EditorSettingsDialog.tsx"
Cohesion: 0.15
Nodes (21): Label(), Switch(), Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), AdminUsersTable() (+13 more)

### Community 123 - "constants/layout.ts"
Cohesion: 0.50
Nodes (3): HEADER_HEIGHT, MAX_CONTENT_WIDTH, SIDEBAR_WIDTH

### Community 124 - "flangeWeightTable.ts"
Cohesion: 0.50
Nodes (3): FLANGE_WEIGHTS, FlangeClass, FlangeType

### Community 125 - "pipeDimensions.ts"
Cohesion: 0.50
Nodes (3): PIPE_DIMENSIONS, PipeNPS, PipeSchedule

### Community 126 - "update-admin-translations-fix.js"
Cohesion: 0.50
Nodes (3): enData, faData, fs

### Community 127 - "update-departments.js"
Cohesion: 0.50
Nodes (3): en, fa, fs

### Community 128 - "update-tabs-motion.js"
Cohesion: 0.50
Nodes (3): calContent, checkContent, fs

### Community 129 - "browserslist"
Cohesion: 0.67
Nodes (3): browserslist, development, production

### Community 130 - "repository"
Cohesion: 0.67
Nodes (3): repository, type, url

### Community 134 - "cn"
Cohesion: 0.05
Nodes (51): input-otp, react-resizable-panels, Container(), ContainerProps, ContainerSize, containerSizeClasses, FullWidth(), FullWidthProps (+43 more)

### Community 135 - "react"
Cohesion: 0.08
Nodes (23): leaflet, react, ColorPickerProps, ColorPreset, DEFAULT_PRESETS, InputGroupButton(), inputGroupButtonVariants, InputGroupTextarea() (+15 more)

### Community 165 - "SettingsPanel.tsx"
Cohesion: 0.12
Nodes (21): Slider(), ToggleGroup(), DEL_BTN, DUPE_BTN, EDGE_TYPE_OPTIONS, EdgeColorTokenRow(), Field(), LABEL_SYMBOLS (+13 more)

### Community 166 - "profile-search.ts"
Cohesion: 0.47
Nodes (5): normalizeSearchText(), PROFILE_SEARCH_INDEX, ProfileSearchItem, ProfileSearchResult, searchProfileItems()

### Community 169 - "channelstats.tsx"
Cohesion: 0.50
Nodes (4): ChannelStats(), ExtendedChannelStatsProps, StatItem, ChannelStatsProps

## Knowledge Gaps
- **939 isolated node(s):** `fs`, `code`, `$schema`, `style`, `rsc` (+934 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1139 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `sidebar.tsx`, `tasks-management-page.tsx`, `VesselNodeBase.tsx`, `DiagramEditor.tsx`, `Link`, `lucide-react`, `dashboard-avatar.tsx`, `cn`, `modal-shell.tsx`, `AdminDashboard.tsx`, `i18n/navigation.ts`, `profile-page.tsx`, `package.json`, `BaseNode.tsx`, `Input`, `mini-chart.tsx`, `settings-section.tsx`, `store/index.ts`, `HeroFlow.tsx`, `Combobox`, `TooltipContent`, `side-menu.tsx`, `dictionary-page.tsx`, `src/services/index.ts`, `DiagramCanvas.tsx`, `AdminRequests.tsx`, `EngineeringObject.tsx`, `docs-page-container.tsx`, `channel-video-search.tsx`, `VideoListItem`, `SettingsPanel.tsx`, `ProjectDataNode.tsx`, `profile-search.ts`, `sitemap-client.tsx`, `src/types/index.ts`, `search/services/search.service.ts`, `did-you-know-page.tsx`, `Toolbar.tsx`, `stats-section.tsx`, `dashboard-control-hub-modal.tsx`, `search-results-client.tsx`, `ShellNode.tsx`, `Badge`, `ShapeNodes.tsx`, `next-intl`, `ProjectItem`, `navigation-search.ts`, `menubar.tsx`, `useAuth`, `aparat-client.tsx`, `HeadNode.tsx`, `context-menu.tsx`, `radix-ui`, `Button`, `carousel.tsx`, `project-create-view.tsx`, `date-picker.tsx`, `alert-dialog.tsx`, `slide-settings-drawer.tsx`, `drawer.tsx`, `alert.tsx`, `task-detail-view.tsx`, `AdminUserConfig.tsx`, `time-provider.tsx`, `next`, `NozzleNode.tsx`, `chart.tsx`, `EditorSettingsDialog.tsx`?**
  _High betweenness centrality (0.180) - this node is a cross-community bridge._
- **What connects `fs`, `code`, `$schema` to the rest of the system?**
  _939 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `sidebar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07954545454545454 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `sidebar.tsx`, `tasks-management-page.tsx`, `VesselNodeBase.tsx`, `DiagramEditor.tsx`, `Link`, `lucide-react`, `dashboard-avatar.tsx`, `react`, `profile-page.tsx`, `AdminDashboard.tsx`, `i18n/navigation.ts`, `BaseNode.tsx`, `Input`, `mini-chart.tsx`, `settings-section.tsx`, `store/index.ts`, `HeroFlow.tsx`, `Combobox`, `TooltipContent`, `side-menu.tsx`, `dictionary-page.tsx`, `DiagramCanvas.tsx`, `AdminRequests.tsx`, `docs-page-container.tsx`, `channel-video-search.tsx`, `SettingsPanel.tsx`, `dashboard.service.ts`, `sitemap-client.tsx`, `channelstats.tsx`, `did-you-know-page.tsx`, `Toolbar.tsx`, `dashboard-control-hub-modal.tsx`, `search-results-client.tsx`, `ShellNode.tsx`, `Badge`, `ShapeNodes.tsx`, `next-intl`, `menubar.tsx`, `useAuth`, `aparat-client.tsx`, `context-menu.tsx`, `radix-ui`, `Button`, `carousel.tsx`, `project-create-view.tsx`, `date-picker.tsx`, `alert-dialog.tsx`, `slide-settings-drawer.tsx`, `drawer.tsx`, `alert.tsx`, `task-detail-view.tsx`, `AdminUserConfig.tsx`, `chart.tsx`, `EditorSettingsDialog.tsx`?**
  _High betweenness centrality (0.179) - this node is a cross-community bridge._
- **Should `VesselNodeBase.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05801980198019802 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `MarketQuote`, `docs-page-container.tsx`, `tasks-management-page.tsx`, `DiagramEditor.tsx`, `Link`, `task-detail-view.tsx`, `channel-video-search.tsx`, `profile-page.tsx`, `package.json`, `did-you-know-page.tsx`, `Input`, `search-results-client.tsx`, `TooltipContent`, `refactor_admin.js`, `dictionary-page.tsx`, `Badge`, `projects-tasks-store.ts`?**
  _High betweenness centrality (0.166) - this node is a cross-community bridge._
- **Should `DiagramEditor.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._