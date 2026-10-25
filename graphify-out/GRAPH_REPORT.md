# Graph Report - esp-app  (2026-10-25)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 3094 nodes · 9647 edges · 159 communities (131 shown, 28 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0440dea8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- BaseNode.tsx
- react
- Toolbar.tsx
- login/page.tsx
- useDiagramStore
- dependencies
- User
- package.json
- cn
- dashboard.service.ts
- store/index.ts
- vessel/HeadNode.tsx
- search-results-client.tsx
- task-detail-view.tsx
- TaskItem
- Combobox
- tasks-management-page.tsx
- search/services/search.service.ts
- dictionary-page.tsx
- paths
- dashboard-avatar.tsx
- src/services/index.ts
- ref_fs
- auth.service.ts
- HeroFlow.tsx
- profile.ts
- team-client.tsx
- Link
- esp-flow/components/DiagramCanvas.tsx
- vessel/AttachmentsNode.tsx
- base.schema.ts
- VideoListItem
- dashboard.tsx
- MarketQuote
- Label
- test-scheduler.ts
- SettingsPanel.tsx
- profile-page.tsx
- [locale]/layout.tsx
- commodities-widget.tsx
- Badge
- DiagramEditor.tsx
- personnel-form.tsx
- ProjectDataNode.tsx
- home-client.tsx
- useVesselWeightStore
- AdminDashboard.tsx
- components.json
- HttpClient
- modules-registry.ts
- aparat.service.ts
- date-picker.tsx
- channel-video-search.tsx
- stats-section.tsx
- mistEliminator.schema.ts
- devDependencies
- use-auth.ts
- src/services/search.service.ts
- support.schema.ts
- refactor_admin.js
- alert-dialog.tsx
- FakeProjectsService
- src/types/index.ts
- app/layout.tsx
- ShapeNodes.tsx
- radix-ui
- scratch/package.json
- menubar.tsx
- multi-button.tsx
- video-card.tsx
- scripts
- context-menu.tsx
- FakeAuthService
- aparat-client.tsx
- EditorSettingsDialog.tsx
- chart.tsx
- carousel.tsx
- IAuthService
- ProjectItem
- fake-projects.service.ts
- ProjectsService
- fetch_events.js
- did-you-know-page.tsx
- http.ts
- .get
- slide-settings-drawer.tsx
- projects.types.ts
- myFunc.ps1
- drawer.tsx
- preferences.service.ts
- sheet.tsx
- navigation.service.ts
- commodities.service.ts
- floatingEdge.ts
- fetch_bahesab.js
- navigation-menu.tsx
- nodes/NozzleNode.tsx
- scraper.js
- inject_fairs.js
- generic-search-box.tsx
- dashboard-menu-sidebar.tsx
- pagination.tsx
- flowStorage.ts
- Getting Started
- parse_excel.js
- admin/page.tsx
- market-control-bar.tsx
- update-remove-birthday.js
- eslint.config.mjs
- parse-pdf.js
- parse_pdf_to_js.js
- container.tsx
- alert.tsx
- ProjectTaskItem
- ProjectPhase
- ProjectRiskItem
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
- aggregate.calc.ts
- fix_en_json.js
- parse.js
- constants/layout.ts
- use-dashboard.ts
- flangeWeightTable.ts
- pipeDimensions.ts
- update-admin-translations-fix.js
- update-departments.js
- update-tabs-motion.js
- browserslist
- repository
- fix_titles.js
- aparat-skeleton.tsx
- channel-banner.tsx
- modal-shell.tsx
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

## Communities (159 total, 28 thin omitted)

### Community 0 - "BaseNode.tsx"
Cohesion: 0.05
Nodes (89): BEAM_SHAPE_LABELS, BeamCalcNode(), ChartNode(), CircleNode(), CloudNode(), ConstantNode(), CORNER_OFFSET_STYLE, CornerResizer() (+81 more)

### Community 1 - "react"
Cohesion: 0.08
Nodes (46): leaflet, lucide-react, next-intl, react, react-day-picker, ForgotPasswordPage(), PrivacyPage(), TermsPage() (+38 more)

### Community 2 - "Toolbar.tsx"
Cohesion: 0.05
Nodes (61): dagre, SitemapPage(), GoogleAddShortcutTile(), GoogleShortcutTile(), GoogleShortcutTileProps, QuickAccessCustomizer(), QuickAccessCustomizerProps, QuickAccessSection() (+53 more)

### Community 3 - "login/page.tsx"
Cohesion: 0.06
Nodes (55): nextConfig, withNextIntl, @hookform/resolvers, next, react-hook-form, GET(), revalidateSeconds(), CRYPTO_SYMBOL (+47 more)

### Community 4 - "useDiagramStore"
Cohesion: 0.08
Nodes (68): Checkbox(), AttachmentsNode, GeneralDataNode, HeadNode, DiagramNode, InternalsNode, Props, DiagramNode (+60 more)

### Community 5 - "dependencies"
Cohesion: 0.03
Nodes (78): dependencies, @auth/core, axios, @base-ui/react, bcryptjs, class-variance-authority, clsx, cmdk (+70 more)

### Community 6 - "User"
Cohesion: 0.07
Nodes (22): AdminHeaderProps, AdminHeatmapModulesProps, AdminProfileStatsProps, AdminRequestsProps, AdminTasksTimeProps, AdminUserConfigProps, AdminUsersTableProps, AdminFakeService (+14 more)

### Community 7 - "package.json"
Cohesion: 0.03
Nodes (65): author, keywords, license, name, private, version, @auth/core, @base-ui/react (+57 more)

### Community 8 - "cn"
Cohesion: 0.06
Nodes (57): input-otp, AvatarGroup(), AvatarGroupCount(), AvatarImage(), Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink() (+49 more)

### Community 9 - "dashboard.service.ts"
Cohesion: 0.05
Nodes (52): motion, react-dom, STATUS_CONFIG, TYPE_COLORS, TYPE_DOT_COLORS, TYPE_ICONS, DashboardHeaderProps, CustomLinksWidgetProps (+44 more)

### Community 10 - "store/index.ts"
Cohesion: 0.08
Nodes (50): CustomEdge(), edgeTypes, ShapeCanvasProps, JacketNodeData, RegenVacuumSteamoutNodeData, SurfacePrepNodeData, DEFAULT_SETTINGS, DiagramStore (+42 more)

### Community 11 - "vessel/HeadNode.tsx"
Cohesion: 0.08
Nodes (44): createDefaultHead(), DiagramNode, HEAD_TYPES, MATERIALS, NPS_OPTIONS, POSITIONS, Props, RT_OPTIONS (+36 more)

### Community 12 - "search-results-client.tsx"
Cohesion: 0.15
Nodes (39): SearchPage(), AppHeader(), AppHeaderProps, ConditionalHeader(), HIDDEN_PREFIXES, Header(), HelpPopover(), SideMenuContent() (+31 more)

### Community 13 - "task-detail-view.tsx"
Cohesion: 0.13
Nodes (34): Avatar(), AvatarFallback(), Textarea(), AdminHeader(), AdminTasksTime(), TaskAttachmentsSection(), TaskAttachmentsSectionProps, TaskBoard() (+26 more)

### Community 14 - "TaskItem"
Cohesion: 0.08
Nodes (4): FakeTasksService, RealTasksService, TasksService, TaskItem

### Community 15 - "Combobox"
Cohesion: 0.07
Nodes (39): cmdk, Combobox(), COMBOBOX_SEARCH_THRESHOLD, ComboboxProps, sizeClasses, Command(), CommandEmpty(), CommandGroup() (+31 more)

### Community 16 - "tasks-management-page.tsx"
Cohesion: 0.08
Nodes (35): Props, TaskDetailPage(), Page(), Props, Page(), Props, TaskCreateView(), INITIAL_FILTERS (+27 more)

### Community 17 - "search/services/search.service.ts"
Cohesion: 0.10
Nodes (24): embla-carousel-react, normalizeSearchText(), DidYouKnowSectionProps, getDidYouKnowCards(), seededShuffle(), DID_YOU_KNOW_CARDS_EN, DID_YOU_KNOW_CARDS_FA, DidYouKnowCardItem (+16 more)

### Community 18 - "dictionary-page.tsx"
Cohesion: 0.10
Nodes (31): @phosphor-icons/react, Page(), buildBilingualPattern(), escapeRegExp(), HighlightMatch(), HighlightMatchProps, DICE_FACES, NAV_ITEMS (+23 more)

### Community 19 - "paths"
Cohesion: 0.05
Nodes (36): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+28 more)

### Community 20 - "dashboard-avatar.tsx"
Cohesion: 0.15
Nodes (18): AppsPopover(), SideMenuContentProps, Popover(), PopoverAnchor(), PopoverContent(), PopoverTrigger(), ScrollArea(), ScrollBar() (+10 more)

### Community 21 - "src/services/index.ts"
Cohesion: 0.08
Nodes (22): ExchangeRates, FakeExchangeRatesService, IExchangeRatesService, RealExchangeRatesService, FALLBACK, ApiErrorResponse, ApiResponse, ApiResult (+14 more)

### Community 22 - "ref_fs"
Cohesion: 0.06
Nodes (20): code, fs, fs, fs, content, fs, content, fs (+12 more)

### Community 23 - "auth.service.ts"
Cohesion: 0.10
Nodes (19): companyEmailRe, AuthState, AccountRequestPayload, AccountRequestRecord, AccountRequestResult, AccountStatusResult, DEMO_USERS, LoginPayload (+11 more)

### Community 24 - "HeroFlow.tsx"
Cohesion: 0.11
Nodes (25): @react-three/drei, @react-three/fiber, three, AuthModalState, useAuthModal, buildInitialEdges(), buildNodes(), FlowInner() (+17 more)

### Community 25 - "profile.ts"
Cohesion: 0.10
Nodes (20): @tanstack/react-query, PersonnelFormProps, useProfile(), FakeProfileService, MOCK_PROFILE, profileService, ProfileService, RealProfileService (+12 more)

### Community 26 - "team-client.tsx"
Cohesion: 0.08
Nodes (20): TeamPage(), BINARY_BG, CARD_MAX_HEIGHT, cardMaxWidth(), containerVariants, contentTeam, engineeringTeam, GitHubIcon() (+12 more)

### Community 27 - "Link"
Cohesion: 0.12
Nodes (21): LocaleNotFound(), PlansPage(), QuickAccessCard(), QuickAccessCardProps, ConditionalFooter(), HIDDEN_PREFIXES, Footer(), FooterLinkItem (+13 more)

### Community 28 - "esp-flow/components/DiagramCanvas.tsx"
Cohesion: 0.12
Nodes (26): clampPosition(), ContextMenu(), ContextMenuState, QuickAddItem, safeT(), absolutePosition(), BG_VARIANT_MAP, DiagramCanvas() (+18 more)

### Community 29 - "vessel/AttachmentsNode.tsx"
Cohesion: 0.14
Nodes (26): createNewAttachment(), DiagramNode, Props, calcAttachmentWeight(), calcInsulationSupportWeight(), calcLiftingLugWeight(), calcNamePlateWeight(), calcTurningLugWeight() (+18 more)

### Community 30 - "base.schema.ts"
Cohesion: 0.10
Nodes (22): zod, InternalsNode, Material, MATERIAL_DENSITY, MaterialSchema, BaseNodeDataSchema, NodePositionSchema, UnitSystem (+14 more)

### Community 31 - "VideoListItem"
Cohesion: 0.11
Nodes (14): AparatContext, AparatProvider(), AparatProviderProps, sample(), useAparatChannel(), UseAparatChannelResult, VideoCardProps, IAparatService (+6 more)

### Community 32 - "dashboard.tsx"
Cohesion: 0.16
Nodes (25): ActivityFeed(), BourseWidget(), CalendarWidget(), AVAILABLE_WIDGETS, CustomDashboardBuilder(), CustomWidgetMeta, DEFAULT_ACTIVE, CustomResizeHandle (+17 more)

### Community 33 - "MarketQuote"
Cohesion: 0.16
Nodes (14): dynamic, fetchCache, GET(), MARKET_SYMBOLS, MarketController, MarketHistory, MarketQuote, MarketSymbol (+6 more)

### Community 34 - "Label"
Cohesion: 0.28
Nodes (19): CommandDialog(), Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogPortal() (+11 more)

### Community 35 - "test-scheduler.ts"
Cohesion: 0.11
Nodes (17): @playwright/test, args, intervalArg, isQuick, isSchedule, isWatch, main(), printHeader() (+9 more)

### Community 36 - "SettingsPanel.tsx"
Cohesion: 0.12
Nodes (22): @xyflow/react, Slider(), ToggleGroup(), DEL_BTN, DUPE_BTN, EDGE_TYPE_OPTIONS, EdgeColorTokenRow(), Field() (+14 more)

### Community 37 - "profile-page.tsx"
Cohesion: 0.13
Nodes (18): Page(), Props, AVATAR_COLOR_PRESETS, getSkillBadgeStyle(), LocationPickerMap, MARITAL_STATUS_OPTIONS, NAV_ITEMS, normalizeRelationship() (+10 more)

### Community 38 - "[locale]/layout.tsx"
Cohesion: 0.12
Nodes (18): LocaleLayout(), generateMetadata(), viewport, HtmlLangSync(), ScrollToTop(), PersianDigitsProvider(), PersianDigitsProviderProps, abbreviationMap (+10 more)

### Community 39 - "commodities-widget.tsx"
Cohesion: 0.16
Nodes (19): CATEGORIES, CommoditiesWidget(), formatLargeIrr(), formatPrice(), UNITS, CustomTick(), CustomTooltip(), MiniChart() (+11 more)

### Community 40 - "Badge"
Cohesion: 0.21
Nodes (17): Page(), Props, Badge(), badgeVariants, Progress(), ProjectsListPage(), ProjectsListPageProps, ProjectsPageContainer() (+9 more)

### Community 41 - "DiagramEditor.tsx"
Cohesion: 0.12
Nodes (21): FlowPage(), metadata, DiagramEditor(), DiagramEditorProps, EditorShell(), safeT(), Toast(), DiagramLibraryDialog() (+13 more)

### Community 42 - "personnel-form.tsx"
Cohesion: 0.14
Nodes (23): ComboboxOption, DatePicker(), AVATAR_COLOR_PRESETS, LocationPickerMap, PersonnelForm(), DEGREE_DEFINITIONS, DegreeDefinition, getDegreeOptions() (+15 more)

### Community 43 - "ProjectDataNode.tsx"
Cohesion: 0.18
Nodes (23): PhoneInput(), PhoneInputProps, applyMask(), cleanRawPhone(), COUNTRIES, Country, getCountryByCode(), toEnglishDigits() (+15 more)

### Community 44 - "home-client.tsx"
Cohesion: 0.14
Nodes (18): zustand, HomePage(), GoogleSearchBox(), GoogleSearchBoxProps, SiteSearch(), Container(), MultiButtonGroup, DidYouKnowSection() (+10 more)

### Community 45 - "useVesselWeightStore"
Cohesion: 0.20
Nodes (15): metadata, VesselWeightPage(), DiagramCanvas(), getId(), nodeTypes, MTOPanel(), OutputHubNode, VesselRootNode (+7 more)

### Community 46 - "AdminDashboard.tsx"
Cohesion: 0.17
Nodes (16): sonner, Collapsible(), CollapsibleContent(), CollapsibleTrigger(), AdminDashboard(), AdminHeatmapModules(), AdminProfileStats(), AnimatedNumber() (+8 more)

### Community 47 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 48 - "HttpClient"
Cohesion: 0.10
Nodes (3): RealAuthService, HttpClient, RealUserService

### Community 49 - "modules-registry.ts"
Cohesion: 0.16
Nodes (19): DashboardControlHubModalProps, DashboardToolbar(), DashboardSchematicStudioModalProps, DashboardSettingsPopoverProps, HiddenWidgetBadge(), DASHBOARD_TABS, DashboardModuleMeta, DEFAULT_TAB_LAYOUTS (+11 more)

### Community 50 - "aparat.service.ts"
Cohesion: 0.21
Nodes (13): AparatService, decodeEntities(), endpointFromAparatUrl(), isAbortError(), isTransient(), normalizeVideo(), pickKey(), pickNextPageUrl() (+5 more)

### Community 51 - "date-picker.tsx"
Cohesion: 0.14
Nodes (19): date-fns-jalali, CalendarContent(), CalendarContentProps, DatePickerProps, getGregorianDaysInMonth(), getJalaliDate(), getJalaliDaysInMonth(), GREGORIAN_MONTHS_EN (+11 more)

### Community 52 - "channel-video-search.tsx"
Cohesion: 0.18
Nodes (15): @radix-ui/react-tabs, @tanstack/react-virtual, ChannelHeader(), ChannelHeaderProps, ChannelVideoSearch(), ChannelVideoSearchProps, SlidingTabItem, SlidingTabs() (+7 more)

### Community 53 - "stats-section.tsx"
Cohesion: 0.16
Nodes (14): StatCard(), StatsSection(), StatsSectionProps, STATS, useCountUp(), UseCountUpOptions, useInView(), UseInViewOptions (+6 more)

### Community 54 - "mistEliminator.schema.ts"
Cohesion: 0.16
Nodes (18): calcDemisterWeight(), calculateCircularSegments(), circleHalfArea(), getDensity(), YORK_DENSITIES, createNewDemister(), DemisterDrawing(), MistEliminatorNode (+10 more)

### Community 55 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, eslint, eslint-config-next, eslint-config-prettier, eslint-plugin-react, eslint-plugin-react-hooks, @playwright/test, prettier (+12 more)

### Community 56 - "use-auth.ts"
Cohesion: 0.15
Nodes (12): MODE_OPTIONS, SettingsSection(), THEME_OPTIONS, DEFAULT_PRIMARY_COLOR, PRIMARY_COLORS, PrimaryColorId, PrimaryColorPreset, useAuthStore (+4 more)

### Community 57 - "src/services/search.service.ts"
Cohesion: 0.14
Nodes (10): useSiteSearchItems(), getBilingualKeywords(), NAV_SEARCH_SOURCE, API_MODE, FakeSearchService, ISearchService, RealSearchService, SearchPayload (+2 more)

### Community 58 - "support.schema.ts"
Cohesion: 0.15
Nodes (17): calcAnnularRingWeight(), calcCylinderWeight(), calcLegColumnWeight(), calcRectPlateWeight(), SupportNode, LegData, LegSchema, LugData (+9 more)

### Community 59 - "refactor_admin.js"
Cohesion: 0.11
Nodes (12): adminDashboardPath, adminDir, content, fs, path, fs, path, srcDir (+4 more)

### Community 60 - "alert-dialog.tsx"
Cohesion: 0.22
Nodes (15): GlobalConfirmModal(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader() (+7 more)

### Community 62 - "src/types/index.ts"
Cohesion: 0.11
Nodes (18): CategoryTabsProps, ChannelHeaderProps, ChannelInfo, ChannelProfile, ChannelResponse, ChannelStatsProps, LiveStream, PlaylistProps (+10 more)

### Community 63 - "app/layout.tsx"
Cohesion: 0.17
Nodes (10): next-themes, RootLayout(), useRelativeTime(), applyColorClass(), PrimaryColorProvider(), QueryProvider(), ThemeProvider(), TimeContext (+2 more)

### Community 64 - "ShapeNodes.tsx"
Cohesion: 0.14
Nodes (15): BaseNodeShell(), BaseNodeShellProps, DefaultNode(), FONT_WEIGHT_MAP, getNodeStyle(), VesselHandles(), VesselHandlesProps, FLOW_HANDLE_CIRCLE (+7 more)

### Community 65 - "radix-ui"
Cohesion: 0.15
Nodes (9): class-variance-authority, radix-ui, HoverCardContent(), RadioGroup(), RadioGroupItem(), ToggleGroupContext, ToggleGroupItem(), Toggle() (+1 more)

### Community 66 - "scratch/package.json"
Cohesion: 0.12
Nodes (16): author, dependencies, axios, cheerio, xlsx, description, axios, xlsx (+8 more)

### Community 67 - "menubar.tsx"
Cohesion: 0.12
Nodes (12): Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarPortal(), MenubarRadioItem(), MenubarSeparator() (+4 more)

### Community 68 - "multi-button.tsx"
Cohesion: 0.16
Nodes (14): CompactMultiButton, CompactMultiButtonProps, actionDefinitions, MultiButtonDemo(), MultiButton, MultiButtonGroupContext, MultiButtonGroupContextValue, MultiButtonGroupProps (+6 more)

### Community 69 - "video-card.tsx"
Cohesion: 0.29
Nodes (13): Playlist(), VideoCard(), VideoPlayer(), highlightText(), VideoSearchResult(), formatDuration(), formatRelativeTime(), formatViews() (+5 more)

### Community 70 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, clean, dev, dev:local, dev:network, dev:network:hmr, lint (+8 more)

### Community 71 - "context-menu.tsx"
Cohesion: 0.12
Nodes (10): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+2 more)

### Community 73 - "aparat-client.tsx"
Cohesion: 0.16
Nodes (5): AparatClient(), AparatClientProps, TaggedVideo, AparatPage(), ChannelInfoBar()

### Community 74 - "EditorSettingsDialog.tsx"
Cohesion: 0.29
Nodes (12): Switch(), Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), EditorSettingsDialog(), Row() (+4 more)

### Community 75 - "chart.tsx"
Cohesion: 0.20
Nodes (13): recharts, ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartStyle(), ChartTooltipContent() (+5 more)

### Community 76 - "carousel.tsx"
Cohesion: 0.19
Nodes (13): Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions (+5 more)

### Community 78 - "ProjectItem"
Cohesion: 0.19
Nodes (6): ProjectCreateDialogProps, ProjectMiroRoadmapTabProps, ProjectReportsAnalyticsTabProps, ProjectStrategicOkrsTabProps, RealProjectsService, ProjectItem

### Community 79 - "fake-projects.service.ts"
Cohesion: 0.21
Nodes (6): ProjectVdisTransmittalTabProps, DEFAULT_PROJECT_PHASES, INITIAL_PROJECTS, projectsService, ProjectTeamMember, VdisDocumentItem

### Community 81 - "fetch_events.js"
Cohesion: 0.18
Nodes (9): fs, https, postRequest(), run(), fs, https, get(), https (+1 more)

### Community 82 - "did-you-know-page.tsx"
Cohesion: 0.23
Nodes (8): Page(), DICE_FACES, DidYouKnowPage(), MATH_FORMULA_STYLE, NAV_ITEMS, CustomCardInput, THEME_PRESETS, useDidYouKnow()

### Community 83 - "http.ts"
Cohesion: 0.26
Nodes (6): ApiError, ErrorCode, toApiError(), getToken(), isRetryable(), sleep()

### Community 84 - ".get"
Cohesion: 0.18
Nodes (5): RegisterPayload, FakeDashboardService, IDashboardService, RealDashboardService, UserRole

### Community 85 - "slide-settings-drawer.tsx"
Cohesion: 0.22
Nodes (11): ALL_SLIDE_ITEMS, DEFAULT_SLIDE_ITEMS, SlideMenuCustomizerModal(), SlideMenuCustomizerModalProps, SlideMenuItemDef, itemKeySafe(), SlideSettingsDrawer(), SlideSettingsDrawerProps (+3 more)

### Community 86 - "projects.types.ts"
Cohesion: 0.19
Nodes (11): ProjectOverviewTabProps, DEFAULT_FILTERS, ProjectFilterState, ProjectStatus, ProjectSubPackage, ProjectType, RiskProbability, RiskSeverity (+3 more)

### Community 87 - "myFunc.ps1"
Cohesion: 0.26
Nodes (10): engines, node, npm, Get-DevServerUrl(), gp(), op(), run(), runall() (+2 more)

### Community 88 - "drawer.tsx"
Cohesion: 0.20
Nodes (8): vaul, DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerPortal(), DrawerTitle()

### Community 89 - "preferences.service.ts"
Cohesion: 0.21
Nodes (5): DEFAULT_PREFS, FakePreferencesService, IPreferencesService, RealPreferencesService, UserPreferences

### Community 90 - "sheet.tsx"
Cohesion: 0.27
Nodes (8): SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetPortal(), SheetTitle(), Sidebar()

### Community 91 - "navigation.service.ts"
Cohesion: 0.25
Nodes (6): NavGroup, NavItem, FakeNavigationService, INavigationService, NavigationResult, RealNavigationService

### Community 92 - "commodities.service.ts"
Cohesion: 0.24
Nodes (6): CommodityItem, FAKE_COMMODITIES, FakeCommoditiesService, ICommoditiesService, RealCommoditiesService, wait()

### Community 93 - "floatingEdge.ts"
Cohesion: 0.31
Nodes (10): ellipsePoints(), getEdgePosition(), getFloatingEdgeParams(), getNodeIntersection(), nodePolygon(), Point, polygonRayIntersection(), raySegmentIntersection() (+2 more)

### Community 94 - "fetch_bahesab.js"
Cohesion: 0.22
Nodes (7): cheerio, cheerio, fs, persianToEnglishDigits(), scrapeHolidays(), cheerio, fs

### Community 95 - "navigation-menu.tsx"
Cohesion: 0.24
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger(), navigationMenuTriggerStyle (+1 more)

### Community 96 - "nodes/NozzleNode.tsx"
Cohesion: 0.36
Nodes (8): calcNozzleWeight(), getDensity(), AccordionItem(), createNewNozzle(), NozzleDrawing(), NozzleNode, Nozzle, NozzleNodeData

### Community 97 - "scraper.js"
Cohesion: 0.28
Nodes (8): axios, axios, cheerio, fs, getHolidays(), monthMap, parseIranfair(), run()

### Community 98 - "inject_fairs.js"
Cohesion: 0.22
Nodes (8): arrayStart, enObj, faObj, fs, newEvents, parsed, path, serviceContent

### Community 99 - "generic-search-box.tsx"
Cohesion: 0.36
Nodes (6): SearchPopup(), SearchPopupProps, AiModeIcon(), GenericSearchBox(), GenericSearchBoxProps, useSearchHistory()

### Community 100 - "dashboard-menu-sidebar.tsx"
Cohesion: 0.67
Nodes (5): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), DashboardMenuSidebar()

### Community 101 - "pagination.tsx"
Cohesion: 0.28
Nodes (7): Pagination(), PaginationContent(), PaginationEllipsis(), PaginationLink(), PaginationLinkProps, PaginationNext(), PaginationPrevious()

### Community 102 - "flowStorage.ts"
Cohesion: 0.29
Nodes (3): FlowState, saveFlowState(), setupAutoSave()

### Community 103 - "Getting Started"
Cohesion: 0.29
Nodes (6): ESP App, Features, Getting Started, Manual Setup, One-Liner Setup (PowerShell), Prerequisites

### Community 104 - "parse_excel.js"
Cohesion: 0.29
Nodes (6): xlsx, data, events, fs, workbook, xlsx

### Community 105 - "admin/page.tsx"
Cohesion: 0.48
Nodes (3): AdminPage(), HomePage(), AuthGate()

### Community 106 - "market-control-bar.tsx"
Cohesion: 0.52
Nodes (6): CountdownTimer(), getRateModes(), MarketControlBar(), MarketControlBarProps, SettingsDropdown(), toPersianDigits()

### Community 107 - "update-remove-birthday.js"
Cohesion: 0.29
Nodes (6): enContent, faContent, fs, path, serviceContent, widgetContent

### Community 108 - "eslint.config.mjs"
Cohesion: 0.33
Nodes (3): eslintConfig, eslint-config-prettier, eslint-plugin-react-hooks

### Community 109 - "parse-pdf.js"
Cohesion: 0.33
Nodes (5): events, fs, lines, monthMap, ocr

### Community 110 - "parse_pdf_to_js.js"
Cohesion: 0.33
Nodes (5): events, fs, lines, monthMap, ocr

### Community 111 - "container.tsx"
Cohesion: 0.33
Nodes (5): ContainerProps, ContainerSize, containerSizeClasses, FullWidth(), FullWidthProps

### Community 112 - "alert.tsx"
Cohesion: 0.40
Nodes (5): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants

### Community 116 - "update-admin-translations.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 117 - "update-admin-translations2.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 118 - "update-admin-translations3.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 119 - "update-admin-translations4.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 120 - "update-translations.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, en, fa, fs

### Community 121 - "fix_types.js"
Cohesion: 0.40
Nodes (4): code, fs, matchFair, matchHol

### Community 122 - "resizable.tsx"
Cohesion: 0.40
Nodes (3): react-resizable-panels, ResizableHandle(), ResizablePanelGroup()

### Community 123 - "replace.js"
Cohesion: 0.40
Nodes (3): code, events, fs

### Community 124 - "scratch_translations.js"
Cohesion: 0.40
Nodes (3): enProfile, faProfile, fs

### Community 125 - "remove-icons.js"
Cohesion: 0.40
Nodes (4): endIdx, fs, lines, startIdx

### Community 126 - "aggregate.calc.ts"
Cohesion: 0.40
Nodes (3): AggregateInput, WeightSummary, VesselWeightState

### Community 127 - "fix_en_json.js"
Cohesion: 0.50
Nodes (3): enData, faData, fs

### Community 128 - "parse.js"
Cohesion: 0.50
Nodes (3): fs, html, urls

### Community 129 - "constants/layout.ts"
Cohesion: 0.50
Nodes (3): HEADER_HEIGHT, MAX_CONTENT_WIDTH, SIDEBAR_WIDTH

### Community 130 - "use-dashboard.ts"
Cohesion: 0.67
Nodes (3): CustomDashboardBuilderProps, UseDashboardResult, DashboardData

### Community 131 - "flangeWeightTable.ts"
Cohesion: 0.50
Nodes (3): FLANGE_WEIGHTS, FlangeClass, FlangeType

### Community 132 - "pipeDimensions.ts"
Cohesion: 0.50
Nodes (3): PIPE_DIMENSIONS, PipeNPS, PipeSchedule

### Community 133 - "update-admin-translations-fix.js"
Cohesion: 0.50
Nodes (3): enData, faData, fs

### Community 134 - "update-departments.js"
Cohesion: 0.50
Nodes (3): en, fa, fs

### Community 135 - "update-tabs-motion.js"
Cohesion: 0.50
Nodes (3): calContent, checkContent, fs

### Community 136 - "browserslist"
Cohesion: 0.67
Nodes (3): browserslist, development, production

### Community 137 - "repository"
Cohesion: 0.67
Nodes (3): repository, type, url

## Knowledge Gaps
- **904 isolated node(s):** `DiagramNodeObject`, `DiagramNodeProps`, `LengthUnit`, `MathConstant`, `DiscoverItem` (+899 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1091 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `BaseNode.tsx`, `Toolbar.tsx`, `login/page.tsx`, `useDiagramStore`, `package.json`, `cn`, `dashboard.service.ts`, `store/index.ts`, `vessel/HeadNode.tsx`, `search-results-client.tsx`, `task-detail-view.tsx`, `Combobox`, `tasks-management-page.tsx`, `search/services/search.service.ts`, `dictionary-page.tsx`, `dashboard-avatar.tsx`, `src/services/index.ts`, `HeroFlow.tsx`, `team-client.tsx`, `Link`, `esp-flow/components/DiagramCanvas.tsx`, `vessel/AttachmentsNode.tsx`, `base.schema.ts`, `VideoListItem`, `dashboard.tsx`, `Label`, `SettingsPanel.tsx`, `profile-page.tsx`, `[locale]/layout.tsx`, `commodities-widget.tsx`, `Badge`, `DiagramEditor.tsx`, `personnel-form.tsx`, `ProjectDataNode.tsx`, `home-client.tsx`, `useVesselWeightStore`, `AdminDashboard.tsx`, `modules-registry.ts`, `date-picker.tsx`, `channel-video-search.tsx`, `stats-section.tsx`, `mistEliminator.schema.ts`, `use-auth.ts`, `src/services/search.service.ts`, `support.schema.ts`, `alert-dialog.tsx`, `src/types/index.ts`, `app/layout.tsx`, `ShapeNodes.tsx`, `radix-ui`, `menubar.tsx`, `multi-button.tsx`, `video-card.tsx`, `context-menu.tsx`, `aparat-client.tsx`, `EditorSettingsDialog.tsx`, `chart.tsx`, `carousel.tsx`, `fake-projects.service.ts`, `did-you-know-page.tsx`, `slide-settings-drawer.tsx`, `projects.types.ts`, `drawer.tsx`, `sheet.tsx`, `navigation-menu.tsx`, `nodes/NozzleNode.tsx`, `generic-search-box.tsx`, `dashboard-menu-sidebar.tsx`, `pagination.tsx`, `admin/page.tsx`, `market-control-bar.tsx`, `container.tsx`, `alert.tsx`, `use-dashboard.ts`, `aparat-skeleton.tsx`, `channel-banner.tsx`, `modal-shell.tsx`, `dashboard/layout.tsx`, `ESP-Flow/layout.tsx`, `premium-guard.tsx`, `logo-mark.tsx`?**
  _High betweenness centrality (0.201) - this node is a cross-community bridge._
- **What connects `DiagramNodeObject`, `DiagramNodeProps`, `LengthUnit` to the rest of the system?**
  _904 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `BaseNode.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.04639175257731959 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `BaseNode.tsx`, `react`, `Toolbar.tsx`, `login/page.tsx`, `useDiagramStore`, `dashboard.service.ts`, `store/index.ts`, `aparat-skeleton.tsx`, `search-results-client.tsx`, `task-detail-view.tsx`, `channel-banner.tsx`, `Combobox`, `vessel/HeadNode.tsx`, `search/services/search.service.ts`, `dictionary-page.tsx`, `tasks-management-page.tsx`, `dashboard-avatar.tsx`, `Link`, `esp-flow/components/DiagramCanvas.tsx`, `dashboard.tsx`, `Label`, `SettingsPanel.tsx`, `profile-page.tsx`, `commodities-widget.tsx`, `Badge`, `DiagramEditor.tsx`, `personnel-form.tsx`, `home-client.tsx`, `useVesselWeightStore`, `AdminDashboard.tsx`, `modules-registry.ts`, `date-picker.tsx`, `channel-video-search.tsx`, `use-auth.ts`, `alert-dialog.tsx`, `ShapeNodes.tsx`, `radix-ui`, `menubar.tsx`, `multi-button.tsx`, `video-card.tsx`, `context-menu.tsx`, `aparat-client.tsx`, `EditorSettingsDialog.tsx`, `chart.tsx`, `carousel.tsx`, `did-you-know-page.tsx`, `slide-settings-drawer.tsx`, `drawer.tsx`, `sheet.tsx`, `navigation-menu.tsx`, `generic-search-box.tsx`, `dashboard-menu-sidebar.tsx`, `pagination.tsx`, `market-control-bar.tsx`, `container.tsx`, `alert.tsx`, `resizable.tsx`?**
  _High betweenness centrality (0.173) - this node is a cross-community bridge._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.07523939808481532 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `react` to `BaseNode.tsx`, `Toolbar.tsx`, `login/page.tsx`, `useDiagramStore`, `package.json`, `cn`, `dashboard.service.ts`, `store/index.ts`, `vessel/HeadNode.tsx`, `search-results-client.tsx`, `task-detail-view.tsx`, `Combobox`, `tasks-management-page.tsx`, `search/services/search.service.ts`, `dictionary-page.tsx`, `dashboard-avatar.tsx`, `src/services/index.ts`, `team-client.tsx`, `Link`, `esp-flow/components/DiagramCanvas.tsx`, `vessel/AttachmentsNode.tsx`, `base.schema.ts`, `dashboard.tsx`, `Label`, `SettingsPanel.tsx`, `profile-page.tsx`, `[locale]/layout.tsx`, `commodities-widget.tsx`, `Badge`, `DiagramEditor.tsx`, `personnel-form.tsx`, `ProjectDataNode.tsx`, `home-client.tsx`, `useVesselWeightStore`, `AdminDashboard.tsx`, `modules-registry.ts`, `date-picker.tsx`, `channel-video-search.tsx`, `stats-section.tsx`, `mistEliminator.schema.ts`, `use-auth.ts`, `src/services/search.service.ts`, `support.schema.ts`, `alert-dialog.tsx`, `app/layout.tsx`, `menubar.tsx`, `multi-button.tsx`, `video-card.tsx`, `context-menu.tsx`, `EditorSettingsDialog.tsx`, `carousel.tsx`, `did-you-know-page.tsx`, `slide-settings-drawer.tsx`, `sheet.tsx`, `navigation.service.ts`, `navigation-menu.tsx`, `nodes/NozzleNode.tsx`, `generic-search-box.tsx`, `dashboard-menu-sidebar.tsx`, `pagination.tsx`, `market-control-bar.tsx`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Should `Toolbar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0519219736087206 - nodes in this community are weakly interconnected._