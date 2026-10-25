# Graph Report - esp-app  (2026-10-25)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 3081 nodes · 9605 edges · 144 communities (123 shown, 21 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ffc34e87`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Button
- search-results-client.tsx
- VesselNodeBase.tsx
- login/page.tsx
- dependencies
- BaseNode.tsx
- profile-page.tsx
- TaskItem
- dictionary-page.tsx
- package.json
- cn
- store/index.ts
- search/services/search.service.ts
- utils.ts
- vessel/HeadNode.tsx
- home-client.tsx
- SettingsPanel.tsx
- react
- sidebar.tsx
- Combobox
- Link
- src/services/index.ts
- paths
- ref_fs
- dashboard.tsx
- esp-flow/components/DiagramCanvas.tsx
- base.schema.ts
- team-client.tsx
- dashboard.service.ts
- vessel/AttachmentsNode.tsx
- [locale]/layout.tsx
- PendingRequest
- MarketQuote
- test-scheduler.ts
- useVesselWeightStore
- HttpClient
- user.service.ts
- profile.ts
- ProjectDataNode.tsx
- EditorSettingsDialog.tsx
- IAuthService
- src/types/index.ts
- modules-registry.ts
- config/navigation.ts
- src/services/search.service.ts
- ProjectItem
- components.json
- dashboard-settings-modal.tsx
- aparat.service.ts
- stats-section.tsx
- mistEliminator.schema.ts
- devDependencies
- radix-ui
- GoogleShortcutTile.tsx
- dropdown-menu.tsx
- support.schema.ts
- refactor_admin.js
- channel-video-search.tsx
- EngineeringObject.tsx
- VideoListItem
- aparat-client.tsx
- HeroFlow.tsx
- ShapeNodes.tsx
- FakeProjectsService
- playlist.tsx
- scratch/package.json
- AdminDashboard.tsx
- auth.service.ts
- commodities-widget.tsx
- projects.types.ts
- scripts
- sitemap-client.tsx
- context-menu.tsx
- FakeAuthService
- ProjectsService
- alert-dialog.tsx
- User
- chart.tsx
- carousel.tsx
- admin.types.ts
- FakeAdminService
- nodes/NozzleNode.tsx
- Toolbar.tsx
- fetch_events.js
- slide-settings-drawer.tsx
- myFunc.ps1
- drawer.tsx
- AdminUserConfig.tsx
- use-aparat-channel.ts
- preferences.service.ts
- floatingEdge.ts
- fetch_bahesab.js
- navigation-menu.tsx
- scraper.js
- inject_fairs.js
- input-group.tsx
- flowStorage.ts
- exchange-rates.service.ts
- Getting Started
- parse_excel.js
- market-control-bar.tsx
- fake-projects.service.ts
- update-remove-birthday.js
- eslint.config.mjs
- parse-pdf.js
- unit-converter-widget.tsx
- parse_pdf_to_js.js
- ProjectTaskItem
- ProjectPhase
- update-admin-translations.js
- update-admin-translations2.js
- update-admin-translations3.js
- update-admin-translations4.js
- update-translations.js
- fix_types.js
- calendar.tsx
- resizable.tsx
- replace.js
- scratch_translations.js
- remove-icons.js
- fix_en_json.js
- parse.js
- constants/layout.ts
- flangeWeightTable.ts
- pipeDimensions.ts
- update-admin-translations-fix.js
- update-departments.js
- update-tabs-motion.js
- browserslist
- repository
- fix_titles.js
- dateParser.ts
- update-calendar-badges.js
- update-checklist.js
- update-profile.js
- update-time-tabs.js
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `cn()` - 504 edges
2. `react` - 275 edges
3. `Button()` - 206 edges
4. `lucide-react` - 189 edges
5. `next-intl` - 179 edges
6. `Input` - 131 edges
7. `useDiagramStore` - 74 edges
8. `Link` - 67 edges
9. `Combobox()` - 63 edges
10. `@xyflow/react` - 51 edges

## Surprising Connections (you probably didn't know these)
- `run()` --calls--> `npm`  [INFERRED]
  public/docs/myFunc.ps1 → package.json
- `runall()` --calls--> `npm`  [INFERRED]
  public/docs/myFunc.ps1 → package.json
- `BaseNodeShellProps` --references--> `DiagramNodeData`  [EXTRACTED]
  src/modules/esp-flow/components/nodes/ShapeNodes.tsx → src/modules/esp-flow/types/index.ts
- `GeneralDataNodeData` --inherits--> `DiagramNodeData`  [EXTRACTED]
  src/modules/esp-flow/components/nodes/vessel/GeneralDataNode.tsx → src/modules/esp-flow/types/index.ts
- `MaterialListNodeData` --inherits--> `DiagramNodeData`  [EXTRACTED]
  src/modules/esp-flow/components/nodes/vessel/MaterialListNode.tsx → src/modules/esp-flow/types/index.ts

## Import Cycles
- None detected.

## Communities (144 total, 21 thin omitted)

### Community 0 - "Button"
Cohesion: 0.07
Nodes (64): lucide-react, motion, next-intl, react-dom, ForgotPasswordPage(), Page(), Props, PrivacyPage() (+56 more)

### Community 1 - "search-results-client.tsx"
Cohesion: 0.09
Nodes (61): SearchPage(), AppHeader(), AppHeaderProps, AppsPopover(), Header(), HelpPopover(), SideMenuContent(), SideMenuContentProps (+53 more)

### Community 2 - "VesselNodeBase.tsx"
Cohesion: 0.06
Nodes (82): @xyflow/react, Checkbox(), AttachmentsNode, GeneralDataNode, HeadNode, DiagramNode, InternalsNode, Props (+74 more)

### Community 3 - "login/page.tsx"
Cohesion: 0.06
Nodes (52): nextConfig, withNextIntl, @hookform/resolvers, next, react-hook-form, GET(), revalidateSeconds(), CRYPTO_SYMBOL (+44 more)

### Community 4 - "dependencies"
Cohesion: 0.03
Nodes (78): dependencies, @auth/core, axios, @base-ui/react, bcryptjs, class-variance-authority, clsx, cmdk (+70 more)

### Community 5 - "BaseNode.tsx"
Cohesion: 0.07
Nodes (72): BEAM_SHAPE_LABELS, BeamCalcNode(), ChartNode(), CircleNode(), CloudNode(), ConstantNode(), CORNER_OFFSET_STYLE, CornerResizer() (+64 more)

### Community 6 - "profile-page.tsx"
Cohesion: 0.05
Nodes (57): date-fns-jalali, leaflet, next-themes, sonner, Page(), Props, MODE_OPTIONS, SettingsSection() (+49 more)

### Community 7 - "TaskItem"
Cohesion: 0.06
Nodes (27): TaskAttachmentsSectionProps, TaskBoardProps, TaskCommentThreadProps, TaskCreateDialogProps, TaskCreateViewProps, TaskDetailDrawerProps, TaskDetailViewProps, TaskTableProps (+19 more)

### Community 8 - "dictionary-page.tsx"
Cohesion: 0.11
Nodes (46): @phosphor-icons/react, Page(), Page(), Badge(), badgeVariants, CommandDialog(), Dialog(), DialogContent() (+38 more)

### Community 9 - "package.json"
Cohesion: 0.03
Nodes (63): author, keywords, license, name, private, version, @auth/core, @base-ui/react (+55 more)

### Community 10 - "cn"
Cohesion: 0.05
Nodes (48): input-otp, Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator() (+40 more)

### Community 11 - "store/index.ts"
Cohesion: 0.07
Nodes (52): CustomEdge(), edgeTypes, HDim(), ShapeSchematic(), VDim(), Wrap(), JacketNodeData, RegenVacuumSteamoutNodeData (+44 more)

### Community 12 - "search/services/search.service.ts"
Cohesion: 0.06
Nodes (39): embla-carousel-react, normalizeSearchText(), CustomDictionaryTermInput, CustomCardInput, THEME_PRESETS, useDidYouKnow(), DidYouKnowSectionProps, DictionaryCardProps (+31 more)

### Community 13 - "utils.ts"
Cohesion: 0.08
Nodes (44): Props, TaskDetailPage(), Page(), Props, Page(), Props, FooterLinkItem, Avatar() (+36 more)

### Community 14 - "vessel/HeadNode.tsx"
Cohesion: 0.08
Nodes (44): createDefaultHead(), DiagramNode, HEAD_TYPES, MATERIALS, NPS_OPTIONS, POSITIONS, Props, RT_OPTIONS (+36 more)

### Community 15 - "home-client.tsx"
Cohesion: 0.07
Nodes (34): HomePage(), SiteSearch(), Container(), ContainerProps, ContainerSize, containerSizeClasses, FullWidth(), FullWidthProps (+26 more)

### Community 16 - "SettingsPanel.tsx"
Cohesion: 0.07
Nodes (37): FlowPage(), metadata, ToggleGroup(), DiagramEditor(), DiagramEditorProps, EditorShell(), safeT(), Toast() (+29 more)

### Community 17 - "react"
Cohesion: 0.07
Nodes (22): react, RootLayout(), SearchPopup(), SearchPopupProps, DEFAULT_PRIMARY_COLOR, PRIMARY_COLORS, PrimaryColorId, PrimaryColorPreset (+14 more)

### Community 18 - "sidebar.tsx"
Cohesion: 0.07
Nodes (36): Separator(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetPortal(), SheetTitle() (+28 more)

### Community 19 - "Combobox"
Cohesion: 0.08
Nodes (37): cmdk, Combobox(), COMBOBOX_SEARCH_THRESHOLD, ComboboxProps, sizeClasses, Command(), CommandEmpty(), CommandGroup() (+29 more)

### Community 20 - "Link"
Cohesion: 0.09
Nodes (27): AccountPendingPage(), LocaleNotFound(), PlansPage(), QuickAccessCardProps, GoogleSearchBox(), GoogleSearchBoxProps, HIDDEN_PREFIXES, HIDDEN_PREFIXES (+19 more)

### Community 21 - "src/services/index.ts"
Cohesion: 0.08
Nodes (24): AuthState, useAuthStore, FALLBACK, ApiErrorResponse, ApiResponse, ApiResult, AUTH_TOKEN_KEY, DateRangeParams (+16 more)

### Community 22 - "paths"
Cohesion: 0.05
Nodes (36): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+28 more)

### Community 23 - "ref_fs"
Cohesion: 0.06
Nodes (20): code, fs, fs, fs, content, fs, content, fs (+12 more)

### Community 24 - "dashboard.tsx"
Cohesion: 0.12
Nodes (28): ActivityFeed(), STATUS_CONFIG, BourseItem, BourseWidget(), CalendarWidget(), TYPE_COLORS, TYPE_DOT_COLORS, TYPE_ICONS (+20 more)

### Community 25 - "esp-flow/components/DiagramCanvas.tsx"
Cohesion: 0.11
Nodes (28): clampPosition(), ContextMenu(), ContextMenuState, QuickAddItem, safeT(), absolutePosition(), BG_VARIANT_MAP, DiagramCanvas() (+20 more)

### Community 26 - "base.schema.ts"
Cohesion: 0.09
Nodes (23): zod, AggregateInput, Material, MATERIAL_DENSITY, MaterialSchema, NodePositionSchema, UnitSystem, UnitSystemSchema (+15 more)

### Community 27 - "team-client.tsx"
Cohesion: 0.08
Nodes (20): TeamPage(), BINARY_BG, CARD_MAX_HEIGHT, cardMaxWidth(), containerVariants, contentTeam, engineeringTeam, GitHubIcon() (+12 more)

### Community 28 - "dashboard.service.ts"
Cohesion: 0.07
Nodes (23): CustomLinksWidgetProps, NotesWidgetProps, ActivityItem, ChartPoint, ChecklistItem, ChecklistPeriod, CustomLink, DashboardNote (+15 more)

### Community 29 - "vessel/AttachmentsNode.tsx"
Cohesion: 0.14
Nodes (26): createNewAttachment(), DiagramNode, Props, calcAttachmentWeight(), calcInsulationSupportWeight(), calcLiftingLugWeight(), calcNamePlateWeight(), calcTurningLugWeight() (+18 more)

### Community 30 - "[locale]/layout.tsx"
Cohesion: 0.11
Nodes (20): LocaleLayout(), generateMetadata(), viewport, ConditionalFooter(), ConditionalHeader(), HtmlLangSync(), ScrollToTop(), PersianDigitsProvider() (+12 more)

### Community 31 - "PendingRequest"
Cohesion: 0.12
Nodes (5): AdminRequestsProps, RealAdminService, IAdminService, PendingRequest, RequestQueryParams

### Community 32 - "MarketQuote"
Cohesion: 0.16
Nodes (14): dynamic, fetchCache, GET(), MARKET_SYMBOLS, MarketController, MarketHistory, MarketQuote, MarketSymbol (+6 more)

### Community 33 - "test-scheduler.ts"
Cohesion: 0.11
Nodes (17): @playwright/test, args, intervalArg, isQuick, isSchedule, isWatch, main(), printHeader() (+9 more)

### Community 34 - "useVesselWeightStore"
Cohesion: 0.18
Nodes (16): metadata, VesselWeightPage(), DiagramCanvas(), getId(), nodeTypes, MTOPanel(), InternalsNode, OutputHubNode (+8 more)

### Community 35 - "HttpClient"
Cohesion: 0.12
Nodes (9): RealProfileService, ApiError, ErrorCode, toApiError(), getToken(), HttpClient, isRetryable(), sleep() (+1 more)

### Community 36 - "user.service.ts"
Cohesion: 0.11
Nodes (10): DEMO_USERS, LoginResult, AUTH_USER_KEY, ChangePasswordPayload, FakeUserService, IUserService, RealUserService, UpdateProfilePayload (+2 more)

### Community 37 - "profile.ts"
Cohesion: 0.10
Nodes (18): @tanstack/react-query, PersonnelFormProps, FakeProfileService, MOCK_PROFILE, profileService, ProfileService, ContractType, DependentInfo (+10 more)

### Community 38 - "ProjectDataNode.tsx"
Cohesion: 0.18
Nodes (23): PhoneInput(), PhoneInputProps, applyMask(), cleanRawPhone(), COUNTRIES, Country, getCountryByCode(), toEnglishDigits() (+15 more)

### Community 39 - "EditorSettingsDialog.tsx"
Cohesion: 0.22
Nodes (17): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), Switch(), Tabs(), TabsContent(), TabsList() (+9 more)

### Community 41 - "src/types/index.ts"
Cohesion: 0.09
Nodes (23): CategoryTabsProps, ChannelHeaderProps, ChannelInfo, ChannelProfile, ChannelResponse, ChannelStatsProps, LiveStream, PlaylistProps (+15 more)

### Community 42 - "modules-registry.ts"
Cohesion: 0.15
Nodes (20): DashboardControlHubModalProps, DashboardToolbar(), DashboardToolbarProps, DashboardSchematicStudioModalProps, DashboardSettingsPopoverProps, HiddenWidgetBadge(), DASHBOARD_TABS, DashboardModuleMeta (+12 more)

### Community 43 - "config/navigation.ts"
Cohesion: 0.15
Nodes (16): GoogleAddShortcutTile(), GoogleAddShortcutTileProps, GoogleShortcutModal(), GoogleShortcutModalProps, QuickAccessCustomizer(), QuickAccessCustomizerProps, QuickAccessCard(), NAV_COLOR_ICON_GRADIENT_MAP (+8 more)

### Community 44 - "src/services/search.service.ts"
Cohesion: 0.13
Nodes (12): useSiteSearchItems(), BILINGUAL_KEYWORDS, getBilingualKeywords(), NAV_SEARCH_SOURCE, NavSearchItem, API_MODE, FakeSearchService, ISearchService (+4 more)

### Community 45 - "ProjectItem"
Cohesion: 0.14
Nodes (9): ProjectCreateDialogProps, ProjectOverviewTabProps, ProjectReportsAnalyticsTabProps, ProjectRisksTabProps, ProjectStrategicOkrsTabProps, RealProjectsService, ProjectItem, ProjectRiskItem (+1 more)

### Community 46 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 47 - "dashboard-settings-modal.tsx"
Cohesion: 0.19
Nodes (16): DashboardSettingsModal(), DashboardSettingsModalProps, CustomTick(), CustomTooltip(), MiniChart(), ICONS, StatCard(), TREND_COLOR (+8 more)

### Community 48 - "aparat.service.ts"
Cohesion: 0.21
Nodes (13): AparatService, decodeEntities(), endpointFromAparatUrl(), isAbortError(), isTransient(), normalizeVideo(), pickKey(), pickNextPageUrl() (+5 more)

### Community 49 - "stats-section.tsx"
Cohesion: 0.16
Nodes (14): StatCard(), StatsSection(), StatsSectionProps, STATS, useCountUp(), UseCountUpOptions, useInView(), UseInViewOptions (+6 more)

### Community 50 - "mistEliminator.schema.ts"
Cohesion: 0.16
Nodes (18): calcDemisterWeight(), calculateCircularSegments(), circleHalfArea(), getDensity(), YORK_DENSITIES, createNewDemister(), DemisterDrawing(), MistEliminatorNode (+10 more)

### Community 51 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, eslint, eslint-config-next, eslint-config-prettier, eslint-plugin-react, eslint-plugin-react-hooks, @playwright/test, prettier (+12 more)

### Community 52 - "radix-ui"
Cohesion: 0.13
Nodes (12): class-variance-authority, radix-ui, Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants, HoverCardContent() (+4 more)

### Community 53 - "GoogleShortcutTile.tsx"
Cohesion: 0.20
Nodes (14): GoogleShortcutTile(), GoogleShortcutTileProps, QuickAccessSection(), QuickAccessSectionProps, highlightText(), NavSearchResult(), APP_ICON_DEFAULT_WEIGHT, AppIcon() (+6 more)

### Community 54 - "dropdown-menu.tsx"
Cohesion: 0.16
Nodes (14): AvatarBadge(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem() (+6 more)

### Community 55 - "support.schema.ts"
Cohesion: 0.15
Nodes (17): calcAnnularRingWeight(), calcCylinderWeight(), calcLegColumnWeight(), calcRectPlateWeight(), SupportNode, LegData, LegSchema, LugData (+9 more)

### Community 56 - "refactor_admin.js"
Cohesion: 0.11
Nodes (12): adminDashboardPath, adminDir, content, fs, path, fs, path, srcDir (+4 more)

### Community 57 - "channel-video-search.tsx"
Cohesion: 0.23
Nodes (13): @radix-ui/react-tabs, ChannelHeader(), ChannelHeaderProps, ChannelVideoSearch(), ChannelVideoSearchProps, SlidingTabItem, SlidingTabs(), SlidingTabsProps (+5 more)

### Community 58 - "EngineeringObject.tsx"
Cohesion: 0.15
Nodes (15): @react-three/drei, @react-three/fiber, three, OutputNode, OutputNodeData, ShapeNode, ShapeNodeData, ShapeOption (+7 more)

### Community 59 - "VideoListItem"
Cohesion: 0.16
Nodes (7): VideoCardProps, IAparatService, RealAparatService, Category, CategoryWithVideos, VideoItem, VideoListItem

### Community 60 - "aparat-client.tsx"
Cohesion: 0.14
Nodes (7): AparatClient(), AparatClientProps, TaggedVideo, AparatPage(), ChannelInfoBar(), ChannelInfoBarProps, VideoCard()

### Community 61 - "HeroFlow.tsx"
Cohesion: 0.18
Nodes (13): Slider(), AuthModalState, buildInitialEdges(), buildNodes(), FlowInner(), HeroFlowNodeData, nodeTypes, resolveThemeColor() (+5 more)

### Community 62 - "ShapeNodes.tsx"
Cohesion: 0.14
Nodes (15): BaseNodeShell(), BaseNodeShellProps, DefaultNode(), FONT_WEIGHT_MAP, getNodeStyle(), VesselHandles(), VesselHandlesProps, FLOW_HANDLE_CIRCLE (+7 more)

### Community 64 - "playlist.tsx"
Cohesion: 0.23
Nodes (14): @tanstack/react-virtual, Playlist(), VideoPlayer(), VideoPlayerProps, PlaylistProps, VideoItem, formatDuration(), formatRelativeTime() (+6 more)

### Community 65 - "scratch/package.json"
Cohesion: 0.12
Nodes (16): author, dependencies, axios, cheerio, xlsx, description, axios, xlsx (+8 more)

### Community 66 - "AdminDashboard.tsx"
Cohesion: 0.24
Nodes (9): AdminPage(), HomePage(), Skeleton(), AdminDashboard(), AdminHeatmapModules(), AdminProfileStats(), AdminTasksTime(), AnimatedNumber() (+1 more)

### Community 67 - "auth.service.ts"
Cohesion: 0.17
Nodes (13): ROLE_HOME, companyEmailRe, AccountRequestPayload, AccountRequestRecord, AccountRequestResult, AccountStatusResult, LoginPayload, RegisterPayload (+5 more)

### Community 68 - "commodities-widget.tsx"
Cohesion: 0.16
Nodes (11): CATEGORIES, CommoditiesWidget(), formatLargeIrr(), formatPrice(), UNITS, CommodityItem, FAKE_COMMODITIES, FakeCommoditiesService (+3 more)

### Community 69 - "projects.types.ts"
Cohesion: 0.17
Nodes (12): ProjectMiroRoadmapTabProps, DEFAULT_FILTERS, projectsService, ProjectFilterState, ProjectStatus, ProjectSubPackage, ProjectType, RiskProbability (+4 more)

### Community 70 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, clean, dev, dev:local, dev:network, dev:network:hmr, lint (+8 more)

### Community 71 - "sitemap-client.tsx"
Cohesion: 0.19
Nodes (12): dagre, SitemapPage(), NAV_COLOR_MAP, NAVIGATION, FlowInner(), getDoubleSidedLayout(), LayoutDirection, nodeTypes (+4 more)

### Community 72 - "context-menu.tsx"
Cohesion: 0.12
Nodes (10): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+2 more)

### Community 75 - "alert-dialog.tsx"
Cohesion: 0.30
Nodes (12): GlobalConfirmModal(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader() (+4 more)

### Community 76 - "User"
Cohesion: 0.20
Nodes (8): AdminHeaderProps, AdminHeatmapModulesProps, AdminProfileStatsProps, AdminTasksTimeProps, AdminUsersTableProps, normalizeText(), User, UserQueryParams

### Community 77 - "chart.tsx"
Cohesion: 0.20
Nodes (13): recharts, ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartStyle(), ChartTooltipContent() (+5 more)

### Community 78 - "carousel.tsx"
Cohesion: 0.19
Nodes (13): Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions (+5 more)

### Community 79 - "admin.types.ts"
Cohesion: 0.16
Nodes (10): AdminFakeService, generateWorkActivity(), getAvatar(), INITIAL_REQUESTS, INITIAL_USERS, AccountStatus, Activity, ChecklistItem (+2 more)

### Community 81 - "nodes/NozzleNode.tsx"
Cohesion: 0.25
Nodes (11): calcNozzleWeight(), getDensity(), AccordionItem(), createNewNozzle(), NozzleDrawing(), NozzleNode, BaseNodeDataSchema, Nozzle (+3 more)

### Community 82 - "Toolbar.tsx"
Cohesion: 0.27
Nodes (12): elkjs, html-to-image, DropdownMenuSeparator(), Divider(), safeT(), Toolbar(), ToolbarButton(), warnIfCrowded() (+4 more)

### Community 83 - "fetch_events.js"
Cohesion: 0.18
Nodes (9): fs, https, postRequest(), run(), fs, https, get(), https (+1 more)

### Community 84 - "slide-settings-drawer.tsx"
Cohesion: 0.22
Nodes (11): ALL_SLIDE_ITEMS, DEFAULT_SLIDE_ITEMS, SlideMenuCustomizerModal(), SlideMenuCustomizerModalProps, SlideMenuItemDef, itemKeySafe(), SlideSettingsDrawer(), SlideSettingsDrawerProps (+3 more)

### Community 85 - "myFunc.ps1"
Cohesion: 0.26
Nodes (10): engines, node, npm, Get-DevServerUrl(), gp(), op(), run(), runall() (+2 more)

### Community 86 - "drawer.tsx"
Cohesion: 0.20
Nodes (8): vaul, DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerPortal(), DrawerTitle()

### Community 87 - "AdminUserConfig.tsx"
Cohesion: 0.29
Nodes (9): zustand, Collapsible(), CollapsibleContent(), CollapsibleTrigger(), ConfirmOptions, ConfirmStore, useConfirm, AdminUserConfig() (+1 more)

### Community 88 - "use-aparat-channel.ts"
Cohesion: 0.24
Nodes (7): AparatContext, AparatProvider(), AparatProviderProps, sample(), useAparatChannel(), UseAparatChannelResult, Profile

### Community 89 - "preferences.service.ts"
Cohesion: 0.21
Nodes (5): DEFAULT_PREFS, FakePreferencesService, IPreferencesService, RealPreferencesService, UserPreferences

### Community 90 - "floatingEdge.ts"
Cohesion: 0.31
Nodes (10): ellipsePoints(), getEdgePosition(), getFloatingEdgeParams(), getNodeIntersection(), nodePolygon(), Point, polygonRayIntersection(), raySegmentIntersection() (+2 more)

### Community 91 - "fetch_bahesab.js"
Cohesion: 0.22
Nodes (7): cheerio, cheerio, fs, persianToEnglishDigits(), scrapeHolidays(), cheerio, fs

### Community 92 - "navigation-menu.tsx"
Cohesion: 0.24
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger(), navigationMenuTriggerStyle (+1 more)

### Community 93 - "scraper.js"
Cohesion: 0.28
Nodes (8): axios, axios, cheerio, fs, getHolidays(), monthMap, parseIranfair(), run()

### Community 94 - "inject_fairs.js"
Cohesion: 0.22
Nodes (8): arrayStart, enObj, faObj, fs, newEvents, parsed, path, serviceContent

### Community 95 - "input-group.tsx"
Cohesion: 0.32
Nodes (7): InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea()

### Community 96 - "flowStorage.ts"
Cohesion: 0.29
Nodes (3): FlowState, saveFlowState(), setupAutoSave()

### Community 97 - "exchange-rates.service.ts"
Cohesion: 0.32
Nodes (4): ExchangeRates, FakeExchangeRatesService, IExchangeRatesService, RealExchangeRatesService

### Community 98 - "Getting Started"
Cohesion: 0.29
Nodes (6): ESP App, Features, Getting Started, Manual Setup, One-Liner Setup (PowerShell), Prerequisites

### Community 99 - "parse_excel.js"
Cohesion: 0.29
Nodes (6): xlsx, data, events, fs, workbook, xlsx

### Community 100 - "market-control-bar.tsx"
Cohesion: 0.52
Nodes (6): CountdownTimer(), getRateModes(), MarketControlBar(), MarketControlBarProps, SettingsDropdown(), toPersianDigits()

### Community 101 - "fake-projects.service.ts"
Cohesion: 0.29
Nodes (4): ProjectVdisTransmittalTabProps, DEFAULT_PROJECT_PHASES, INITIAL_PROJECTS, VdisDocumentItem

### Community 102 - "update-remove-birthday.js"
Cohesion: 0.29
Nodes (6): enContent, faContent, fs, path, serviceContent, widgetContent

### Community 103 - "eslint.config.mjs"
Cohesion: 0.33
Nodes (3): eslintConfig, eslint-config-prettier, eslint-plugin-react-hooks

### Community 104 - "parse-pdf.js"
Cohesion: 0.33
Nodes (5): events, fs, lines, monthMap, ocr

### Community 105 - "unit-converter-widget.tsx"
Cohesion: 0.33
Nodes (3): CONVERTER_CATEGORIES, UNITS, TIMEZONES

### Community 106 - "parse_pdf_to_js.js"
Cohesion: 0.33
Nodes (5): events, fs, lines, monthMap, ocr

### Community 109 - "update-admin-translations.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 110 - "update-admin-translations2.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 111 - "update-admin-translations3.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 112 - "update-admin-translations4.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 113 - "update-translations.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, en, fa, fs

### Community 114 - "fix_types.js"
Cohesion: 0.40
Nodes (4): code, fs, matchFair, matchHol

### Community 115 - "calendar.tsx"
Cohesion: 0.60
Nodes (4): react-day-picker, buttonVariants, Calendar(), CalendarDayButton()

### Community 116 - "resizable.tsx"
Cohesion: 0.40
Nodes (3): react-resizable-panels, ResizableHandle(), ResizablePanelGroup()

### Community 117 - "replace.js"
Cohesion: 0.40
Nodes (3): code, events, fs

### Community 118 - "scratch_translations.js"
Cohesion: 0.40
Nodes (3): enProfile, faProfile, fs

### Community 119 - "remove-icons.js"
Cohesion: 0.40
Nodes (4): endIdx, fs, lines, startIdx

### Community 120 - "fix_en_json.js"
Cohesion: 0.50
Nodes (3): enData, faData, fs

### Community 121 - "parse.js"
Cohesion: 0.50
Nodes (3): fs, html, urls

### Community 122 - "constants/layout.ts"
Cohesion: 0.50
Nodes (3): HEADER_HEIGHT, MAX_CONTENT_WIDTH, SIDEBAR_WIDTH

### Community 123 - "flangeWeightTable.ts"
Cohesion: 0.50
Nodes (3): FLANGE_WEIGHTS, FlangeClass, FlangeType

### Community 124 - "pipeDimensions.ts"
Cohesion: 0.50
Nodes (3): PIPE_DIMENSIONS, PipeNPS, PipeSchedule

### Community 125 - "update-admin-translations-fix.js"
Cohesion: 0.50
Nodes (3): enData, faData, fs

### Community 126 - "update-departments.js"
Cohesion: 0.50
Nodes (3): en, fa, fs

### Community 127 - "update-tabs-motion.js"
Cohesion: 0.50
Nodes (3): calContent, checkContent, fs

### Community 128 - "browserslist"
Cohesion: 0.67
Nodes (3): browserslist, development, production

### Community 129 - "repository"
Cohesion: 0.67
Nodes (3): repository, type, url

## Knowledge Gaps
- **901 isolated node(s):** `Props`, `RoutineColor`, `WeekDayItem`, `ProjectsListPageProps`, `ProjectWorkspacePageProps` (+896 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1088 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `Button`, `search-results-client.tsx`, `VesselNodeBase.tsx`, `login/page.tsx`, `BaseNode.tsx`, `profile-page.tsx`, `TaskItem`, `dictionary-page.tsx`, `package.json`, `cn`, `store/index.ts`, `search/services/search.service.ts`, `utils.ts`, `vessel/HeadNode.tsx`, `home-client.tsx`, `SettingsPanel.tsx`, `sidebar.tsx`, `Combobox`, `Link`, `src/services/index.ts`, `dashboard.tsx`, `esp-flow/components/DiagramCanvas.tsx`, `base.schema.ts`, `team-client.tsx`, `vessel/AttachmentsNode.tsx`, `[locale]/layout.tsx`, `useVesselWeightStore`, `ProjectDataNode.tsx`, `EditorSettingsDialog.tsx`, `src/types/index.ts`, `modules-registry.ts`, `config/navigation.ts`, `src/services/search.service.ts`, `dashboard-settings-modal.tsx`, `stats-section.tsx`, `mistEliminator.schema.ts`, `radix-ui`, `GoogleShortcutTile.tsx`, `dropdown-menu.tsx`, `support.schema.ts`, `channel-video-search.tsx`, `EngineeringObject.tsx`, `VideoListItem`, `aparat-client.tsx`, `HeroFlow.tsx`, `ShapeNodes.tsx`, `playlist.tsx`, `AdminDashboard.tsx`, `auth.service.ts`, `commodities-widget.tsx`, `projects.types.ts`, `sitemap-client.tsx`, `context-menu.tsx`, `alert-dialog.tsx`, `User`, `chart.tsx`, `carousel.tsx`, `nodes/NozzleNode.tsx`, `Toolbar.tsx`, `slide-settings-drawer.tsx`, `drawer.tsx`, `AdminUserConfig.tsx`, `use-aparat-channel.ts`, `navigation-menu.tsx`, `input-group.tsx`, `market-control-bar.tsx`, `unit-converter-widget.tsx`, `calendar.tsx`?**
  _High betweenness centrality (0.200) - this node is a cross-community bridge._
- **What connects `Props`, `RoutineColor`, `WeekDayItem` to the rest of the system?**
  _901 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Button` be split into smaller, more focused modules?**
  _Cohesion score 0.06831683168316832 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `Button`, `search-results-client.tsx`, `VesselNodeBase.tsx`, `login/page.tsx`, `BaseNode.tsx`, `profile-page.tsx`, `dictionary-page.tsx`, `store/index.ts`, `search/services/search.service.ts`, `utils.ts`, `vessel/HeadNode.tsx`, `home-client.tsx`, `SettingsPanel.tsx`, `react`, `sidebar.tsx`, `Combobox`, `Link`, `dashboard.tsx`, `esp-flow/components/DiagramCanvas.tsx`, `useVesselWeightStore`, `EditorSettingsDialog.tsx`, `modules-registry.ts`, `config/navigation.ts`, `dashboard-settings-modal.tsx`, `radix-ui`, `GoogleShortcutTile.tsx`, `dropdown-menu.tsx`, `channel-video-search.tsx`, `VideoListItem`, `aparat-client.tsx`, `HeroFlow.tsx`, `ShapeNodes.tsx`, `playlist.tsx`, `AdminDashboard.tsx`, `commodities-widget.tsx`, `projects.types.ts`, `sitemap-client.tsx`, `context-menu.tsx`, `alert-dialog.tsx`, `chart.tsx`, `carousel.tsx`, `Toolbar.tsx`, `slide-settings-drawer.tsx`, `drawer.tsx`, `navigation-menu.tsx`, `input-group.tsx`, `market-control-bar.tsx`, `unit-converter-widget.tsx`, `calendar.tsx`, `resizable.tsx`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Should `search-results-client.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09451754385964913 - nodes in this community are weakly interconnected._
- **Why does `next` connect `login/page.tsx` to `playlist.tsx`, `MarketQuote`, `useVesselWeightStore`, `Button`, `search-results-client.tsx`, `profile-page.tsx`, `dictionary-page.tsx`, `package.json`, `team-client.tsx`, `utils.ts`, `SettingsPanel.tsx`, `refactor_admin.js`, `VideoListItem`, `[locale]/layout.tsx`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Should `VesselNodeBase.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0626858842370167 - nodes in this community are weakly interconnected._