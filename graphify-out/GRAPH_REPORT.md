# Graph Report - esp-app  (2026-10-20)

## Corpus Check
- 527 files · ~746,426 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 117 file(s) not represented in the graph (top: .woff2 69, .css 16, .woff 13)

## Summary
- 2952 nodes · 9114 edges · 148 communities (127 shown, 21 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 49 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `26ae5283`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- did-you-know-page.tsx
- radix-ui
- Input
- BaseNode.tsx
- login/page.tsx
- dependencies
- auth.service.ts
- package.json
- GeneralDataNode.tsx
- alert-dialog.tsx
- store/index.ts
- AdminDashboard.tsx
- react
- ProjectDataNode.tsx
- profile-page.tsx
- cn
- tasks-management-page.tsx
- search/services/search.service.ts
- paths
- Link
- ref_fs
- TaskItem
- app/layout.tsx
- commodities-widget.tsx
- VideoListItem
- team-client.tsx
- Toolbar.tsx
- base.schema.ts
- playlist.tsx
- dictionary-page.tsx
- MarketQuote
- stats-section.tsx
- dashboard-control-hub-modal.tsx
- test-scheduler.ts
- next
- useVesselWeightStore
- attachments.schema.ts
- Combobox
- HttpClient
- nodes/NozzleNode.tsx
- SettingsPanel.tsx
- src/services/search.service.ts
- components.json
- EditorSettingsDialog.tsx
- task-detail-view.tsx
- aparat.service.ts
- dashboard.service.ts
- mistEliminator.schema.ts
- devDependencies
- channel-video-search.tsx
- support.schema.ts
- refactor_admin.js
- EngineeringObject.tsx
- date-picker.tsx
- RealAuthService
- esp-flow/components/DiagramCanvas.tsx
- ProjectItem
- src/types/index.ts
- multi-button.tsx
- user.service.ts
- vessel/ShellNode.tsx
- scratch/package.json
- menubar.tsx
- scripts
- custom-dashboard-builder.tsx
- home-client.tsx
- sitemap-client.tsx
- i18n/navigation.ts
- chart.tsx
- config/navigation.ts
- Button
- context-menu.tsx
- aparat-client.tsx
- GoogleShortcutTile.tsx
- carousel.tsx
- fetch_events.js
- dashboard-avatar.tsx
- stats.service.ts
- Badge
- usePersianDigits.ts
- myFunc.ps1
- drawer.tsx
- preferences.service.ts
- fakeTasksService
- commodities.service.ts
- floatingEdge.ts
- fetch_bahesab.js
- .get
- FakeAuthService
- scraper.js
- inject_fairs.js
- TasksManagementPage
- navigation-menu.tsx
- pagination.tsx
- flowStorage.ts
- src/services/index.ts
- Getting Started
- parse_excel.js
- routing.ts
- input-group.tsx
- aggregate.calc.ts
- update-remove-birthday.js
- eslint.config.mjs
- parse-pdf.js
- input-otp.tsx
- parse_pdf_to_js.js
- resizable.tsx
- search-results-client.tsx
- container.tsx
- update-admin-translations.js
- update-admin-translations2.js
- update-admin-translations3.js
- update-admin-translations4.js
- update-translations.js
- fix_types.js
- dashboard.tsx
- replace.js
- scratch_translations.js
- remove-icons.js
- channel-banner.tsx
- fix_en_json.js
- parse.js
- admin/page.tsx
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
1. `cn()` - 496 edges
2. `react` - 269 edges
3. `Button()` - 199 edges
4. `lucide-react` - 185 edges
5. `next-intl` - 174 edges
6. `Input` - 123 edges
7. `useDiagramStore` - 74 edges
8. `Link` - 63 edges
9. `Combobox()` - 61 edges
10. `@xyflow/react` - 51 edges

## Surprising Connections (you probably didn't know these)
- `run()` --calls--> `npm`  [INFERRED]
  public/docs/myFunc.ps1 → package.json
- `runall()` --calls--> `npm`  [INFERRED]
  public/docs/myFunc.ps1 → package.json
- `TaggedVideo` --inherits--> `VideoListItem`  [EXTRACTED]
  src/app/[locale]/aparat/aparat-client.tsx → src/types/index.ts
- `Page()` --calls--> `DictionaryPage()`  [EXTRACTED]
  src/app/[locale]/dictionary/page.tsx → src/modules/dictionary/components/dictionary-page.tsx
- `PlansPage()` --calls--> `Link`  [EXTRACTED]
  src/app/[locale]/plans/page.tsx → src/i18n/navigation.ts

## Import Cycles
- None detected.

## Communities (148 total, 21 thin omitted)

### Community 0 - "did-you-know-page.tsx"
Cohesion: 0.15
Nodes (33): Page(), CommandDialog(), Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay() (+25 more)

### Community 1 - "radix-ui"
Cohesion: 0.11
Nodes (14): class-variance-authority, radix-ui, Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants, HoverCardContent() (+6 more)

### Community 2 - "Input"
Cohesion: 0.08
Nodes (76): Checkbox(), Input, AttachmentsNode, createNewAttachment(), DiagramNode, Props, GeneralDataNode, createDefaultHead() (+68 more)

### Community 3 - "BaseNode.tsx"
Cohesion: 0.05
Nodes (91): BEAM_SHAPE_LABELS, BeamCalcNode(), ChartNode(), CircleNode(), CloudNode(), ConstantNode(), CORNER_OFFSET_STYLE, CornerResizer() (+83 more)

### Community 4 - "login/page.tsx"
Cohesion: 0.10
Nodes (40): @radix-ui/react-label, @radix-ui/react-slot, react-hook-form, LoginPage(), RegisterPage(), ResetPasswordContent(), ResetPasswordPage(), VerifyEmailContent() (+32 more)

### Community 5 - "dependencies"
Cohesion: 0.03
Nodes (77): dependencies, @auth/core, axios, @base-ui/react, bcryptjs, class-variance-authority, clsx, cmdk (+69 more)

### Community 6 - "auth.service.ts"
Cohesion: 0.15
Nodes (10): ROLE_HOME, DEMO_USERS, LoginPayload, RegisterPayload, FakeDashboardService, IDashboardService, RealDashboardService, AUTH_TOKEN_KEY (+2 more)

### Community 7 - "package.json"
Cohesion: 0.03
Nodes (65): author, axios, xlsx, keywords, license, name, private, version (+57 more)

### Community 8 - "GeneralDataNode.tsx"
Cohesion: 0.08
Nodes (25): BaseNodeShell(), BaseNodeShellProps, DefaultNode(), FONT_WEIGHT_MAP, getNodeStyle(), DiagramNode, GeneralData, GeneralDataNodeData (+17 more)

### Community 9 - "alert-dialog.tsx"
Cohesion: 0.30
Nodes (12): GlobalConfirmModal(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader() (+4 more)

### Community 10 - "store/index.ts"
Cohesion: 0.07
Nodes (58): @xyflow/react, CustomEdge(), ShapeCanvasProps, HDim(), ShapeSchematic(), VDim(), Wrap(), JacketNodeData (+50 more)

### Community 11 - "AdminDashboard.tsx"
Cohesion: 0.10
Nodes (26): zustand, Collapsible(), CollapsibleContent(), CollapsibleTrigger(), Skeleton(), ConfirmOptions, ConfirmStore, useConfirm (+18 more)

### Community 12 - "react"
Cohesion: 0.06
Nodes (34): leaflet, lucide-react, next-intl, react, Props, GoogleAddShortcutTileProps, SearchPopup(), SearchPopupProps (+26 more)

### Community 13 - "ProjectDataNode.tsx"
Cohesion: 0.18
Nodes (23): PhoneInput(), PhoneInputProps, applyMask(), cleanRawPhone(), COUNTRIES, Country, getCountryByCode(), toEnglishDigits() (+15 more)

### Community 14 - "profile-page.tsx"
Cohesion: 0.09
Nodes (23): next-themes, sonner, Page(), Props, MODE_OPTIONS, SettingsSection(), THEME_OPTIONS, DEFAULT_PRIMARY_COLOR (+15 more)

### Community 15 - "cn"
Cohesion: 0.07
Nodes (53): Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator(), Separator() (+45 more)

### Community 16 - "tasks-management-page.tsx"
Cohesion: 0.11
Nodes (29): Textarea(), TaskBoardProps, TaskCreateDialog(), TaskCreateDialogProps, TaskCreateView(), TaskCreateViewProps, TaskEditingField, ColumnFilters (+21 more)

### Community 17 - "search/services/search.service.ts"
Cohesion: 0.08
Nodes (30): CustomCardInput, THEME_PRESETS, DidYouKnowSection(), DidYouKnowSectionProps, getDidYouKnowCards(), seededShuffle(), DID_YOU_KNOW_CARDS_EN, DID_YOU_KNOW_CARDS_FA (+22 more)

### Community 18 - "paths"
Cohesion: 0.05
Nodes (36): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+28 more)

### Community 19 - "Link"
Cohesion: 0.20
Nodes (34): AppHeader(), AppHeaderProps, AppsPopover(), Header(), HelpPopover(), AiModeIcon(), GenericSearchBox(), GenericSearchBoxProps (+26 more)

### Community 20 - "ref_fs"
Cohesion: 0.06
Nodes (20): code, fs, fs, fs, content, fs, content, fs (+12 more)

### Community 21 - "TaskItem"
Cohesion: 0.10
Nodes (12): TaskAttachmentsSectionProps, TaskCommentThreadProps, TaskDetailDrawerProps, TaskDetailViewProps, INITIAL_MOCK_TASKS, RealTasksService, TasksService, TaskAssignee (+4 more)

### Community 22 - "app/layout.tsx"
Cohesion: 0.10
Nodes (18): @tanstack/react-query, RootLayout(), useRelativeTime(), FakeProfileService, MOCK_PROFILE, profileService, ProfileService, EducationInfo (+10 more)

### Community 23 - "commodities-widget.tsx"
Cohesion: 0.13
Nodes (25): CATEGORIES, CommoditiesWidget(), formatLargeIrr(), formatPrice(), UNITS, CustomDashboardBuilderProps, DashboardSettingsModalProps, CountdownTimer() (+17 more)

### Community 24 - "VideoListItem"
Cohesion: 0.11
Nodes (14): AparatContext, AparatProvider(), AparatProviderProps, sample(), useAparatChannel(), UseAparatChannelResult, VideoCardProps, IAparatService (+6 more)

### Community 25 - "team-client.tsx"
Cohesion: 0.08
Nodes (20): TeamPage(), BINARY_BG, CARD_MAX_HEIGHT, cardMaxWidth(), containerVariants, contentTeam, engineeringTeam, GitHubIcon() (+12 more)

### Community 26 - "Toolbar.tsx"
Cohesion: 0.11
Nodes (28): elkjs, html-to-image, GoogleShortcutTile(), AvatarBadge(), ComboboxOption, DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent() (+20 more)

### Community 27 - "base.schema.ts"
Cohesion: 0.08
Nodes (28): zod, Material, MATERIAL_DENSITY, MaterialSchema, NodePositionSchema, UnitSystem, UnitSystemSchema, WeightSummarySchema (+20 more)

### Community 28 - "playlist.tsx"
Cohesion: 0.22
Nodes (17): Playlist(), VideoCard(), VideoPlayer(), VideoPlayerProps, highlightText(), VideoSearchResult(), PlaylistProps, Profile (+9 more)

### Community 29 - "dictionary-page.tsx"
Cohesion: 0.12
Nodes (24): Page(), buildBilingualPattern(), escapeRegExp(), HighlightMatch(), HighlightMatchProps, DICE_FACES, NAV_ITEMS, CustomDictionaryTermInput (+16 more)

### Community 30 - "MarketQuote"
Cohesion: 0.16
Nodes (14): dynamic, fetchCache, GET(), MARKET_SYMBOLS, MarketController, MarketHistory, MarketQuote, MarketSymbol (+6 more)

### Community 31 - "stats-section.tsx"
Cohesion: 0.15
Nodes (15): StatCard(), StatsSection(), StatsSectionProps, STATS, useCountUp(), UseCountUpOptions, useInView(), UseInViewOptions (+7 more)

### Community 32 - "dashboard-control-hub-modal.tsx"
Cohesion: 0.17
Nodes (19): DashboardControlHubModal(), DashboardControlHubModalProps, DashboardSchematicStudioModal(), DashboardSchematicStudioModalProps, DashboardSettingsPopoverProps, DASHBOARD_TABS, DashboardModuleMeta, DEFAULT_TAB_LAYOUTS (+11 more)

### Community 33 - "test-scheduler.ts"
Cohesion: 0.11
Nodes (17): @playwright/test, args, intervalArg, isQuick, isSchedule, isWatch, main(), printHeader() (+9 more)

### Community 34 - "next"
Cohesion: 0.10
Nodes (10): nextConfig, withNextIntl, next, GET(), revalidateSeconds(), CRYPTO_SYMBOL, SYMBOL_MAP, YH_HEADERS (+2 more)

### Community 35 - "useVesselWeightStore"
Cohesion: 0.21
Nodes (14): metadata, VesselWeightPage(), DiagramCanvas(), getId(), nodeTypes, MTOPanel(), InternalsNode, OutputHubNode (+6 more)

### Community 36 - "attachments.schema.ts"
Cohesion: 0.15
Nodes (23): calcAttachmentWeight(), calcInsulationSupportWeight(), calcLiftingLugWeight(), calcNamePlateWeight(), calcTurningLugWeight(), getDensity(), AttachmentsNode, createNewAttachment() (+15 more)

### Community 37 - "Combobox"
Cohesion: 0.09
Nodes (42): Combobox(), COMBOBOX_SEARCH_THRESHOLD, ComboboxProps, Command(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem() (+34 more)

### Community 38 - "HttpClient"
Cohesion: 0.15
Nodes (8): ApiError, ErrorCode, toApiError(), getToken(), HttpClient, isRetryable(), sleep(), RealUserService

### Community 39 - "nodes/NozzleNode.tsx"
Cohesion: 0.25
Nodes (11): calcNozzleWeight(), getDensity(), AccordionItem(), createNewNozzle(), NozzleDrawing(), NozzleNode, BaseNodeDataSchema, Nozzle (+3 more)

### Community 40 - "SettingsPanel.tsx"
Cohesion: 0.12
Nodes (22): Slider(), ToggleGroup(), DEL_BTN, DUPE_BTN, EDGE_TYPE_OPTIONS, EdgeColorTokenRow(), Field(), LABEL_SYMBOLS (+14 more)

### Community 41 - "src/services/search.service.ts"
Cohesion: 0.13
Nodes (11): useSiteSearchItems(), getBilingualKeywords(), NAV_SEARCH_SOURCE, universalSearchService, API_MODE, FakeSearchService, ISearchService, RealSearchService (+3 more)

### Community 42 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 43 - "EditorSettingsDialog.tsx"
Cohesion: 0.24
Nodes (16): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), Tabs(), TabsContent(), TabsList(), tabsListVariants (+8 more)

### Community 44 - "task-detail-view.tsx"
Cohesion: 0.29
Nodes (13): Avatar(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), AdminHeader(), AdminTasksTime(), AnimatedNumber() (+5 more)

### Community 45 - "aparat.service.ts"
Cohesion: 0.21
Nodes (13): AparatService, decodeEntities(), endpointFromAparatUrl(), isAbortError(), isTransient(), normalizeVideo(), pickKey(), pickNextPageUrl() (+5 more)

### Community 46 - "dashboard.service.ts"
Cohesion: 0.07
Nodes (41): react-dom, DashboardHeaderProps, DailyNotificationsModal(), DailyNotificationsModalProps, NotificationsPopoverProps, COLOR_CONFIG, DailyRoutinesWidget(), DailyRoutinesWidgetProps (+33 more)

### Community 47 - "mistEliminator.schema.ts"
Cohesion: 0.16
Nodes (18): calcDemisterWeight(), calculateCircularSegments(), circleHalfArea(), getDensity(), YORK_DENSITIES, createNewDemister(), DemisterDrawing(), MistEliminatorNode (+10 more)

### Community 48 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, eslint, eslint-config-next, eslint-config-prettier, eslint-plugin-react, eslint-plugin-react-hooks, @playwright/test, prettier (+12 more)

### Community 49 - "channel-video-search.tsx"
Cohesion: 0.25
Nodes (11): @radix-ui/react-tabs, normalizeSearchText(), ChannelHeader(), ChannelHeaderProps, ChannelVideoSearch(), ChannelVideoSearchProps, SlidingTabItem, SlidingTabs() (+3 more)

### Community 50 - "support.schema.ts"
Cohesion: 0.15
Nodes (17): calcAnnularRingWeight(), calcCylinderWeight(), calcLegColumnWeight(), calcRectPlateWeight(), SupportNode, LegData, LegSchema, LugData (+9 more)

### Community 51 - "refactor_admin.js"
Cohesion: 0.11
Nodes (12): adminDashboardPath, adminDir, content, fs, path, fs, path, srcDir (+4 more)

### Community 52 - "EngineeringObject.tsx"
Cohesion: 0.15
Nodes (15): @react-three/drei, @react-three/fiber, three, OutputNode, OutputNodeData, ShapeNode, ShapeNodeData, ShapeOption (+7 more)

### Community 53 - "date-picker.tsx"
Cohesion: 0.10
Nodes (30): date-fns-jalali, CalendarContent(), CalendarContentProps, DatePicker(), DatePickerProps, getGregorianDaysInMonth(), getJalaliDate(), getJalaliDaysInMonth() (+22 more)

### Community 55 - "esp-flow/components/DiagramCanvas.tsx"
Cohesion: 0.07
Nodes (43): FlowPage(), metadata, clampPosition(), ContextMenu(), ContextMenuState, QuickAddItem, safeT(), absolutePosition() (+35 more)

### Community 56 - "ProjectItem"
Cohesion: 0.06
Nodes (20): ProjectCreateDialogProps, ProjectBoardsTabProps, ProjectOverviewTabProps, ProjectPhasesWbsTabProps, ProjectReportsAnalyticsTabProps, ProjectStrategicOkrsTabProps, ProjectVdisTransmittalTabProps, DEFAULT_PROJECT_PHASES (+12 more)

### Community 57 - "src/types/index.ts"
Cohesion: 0.09
Nodes (23): CategoryTabsProps, ChannelHeaderProps, ChannelInfo, ChannelProfile, ChannelResponse, ChannelStatsProps, LiveStream, PlaylistProps (+15 more)

### Community 58 - "multi-button.tsx"
Cohesion: 0.16
Nodes (14): CompactMultiButton, CompactMultiButtonProps, actionDefinitions, MultiButtonDemo(), MultiButton, MultiButtonGroupContext, MultiButtonGroupContextValue, MultiButtonGroupProps (+6 more)

### Community 59 - "user.service.ts"
Cohesion: 0.15
Nodes (9): AuthState, LoginResult, AUTH_USER_KEY, ChangePasswordPayload, FakeUserService, IUserService, UpdateProfilePayload, wait() (+1 more)

### Community 60 - "vessel/ShellNode.tsx"
Cohesion: 0.13
Nodes (26): DiagramNode, makeCourse(), Props, calcElliptical21HeadWeight(), calcHeadBlankWeight(), calcHemisphericalHeadWeight(), calcTorishericalHeadWeight(), HeadCalcResult (+18 more)

### Community 61 - "scratch/package.json"
Cohesion: 0.12
Nodes (16): author, dependencies, axios, cheerio, xlsx, description, axios, xlsx (+8 more)

### Community 62 - "menubar.tsx"
Cohesion: 0.12
Nodes (12): Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarPortal(), MenubarRadioItem(), MenubarSeparator() (+4 more)

### Community 63 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, clean, dev, dev:local, dev:network, dev:network:hmr, lint (+8 more)

### Community 64 - "custom-dashboard-builder.tsx"
Cohesion: 0.15
Nodes (13): AVAILABLE_WIDGETS, CustomWidgetMeta, DEFAULT_ACTIVE, CustomLinksWidget(), CustomLinksWidgetProps, COLOR_CLASSES, NotesWidget(), NotesWidgetProps (+5 more)

### Community 65 - "home-client.tsx"
Cohesion: 0.17
Nodes (16): @phosphor-icons/react, HomePage(), Container(), SideMenuContent(), SideMenuContentProps, MultiButtonGroup, FeaturedModulesCard(), FeaturedModulesCardProps (+8 more)

### Community 66 - "sitemap-client.tsx"
Cohesion: 0.18
Nodes (11): dagre, SitemapPage(), NAV_COLOR_MAP, FlowInner(), getDoubleSidedLayout(), LayoutDirection, nodeTypes, SitemapClient() (+3 more)

### Community 67 - "i18n/navigation.ts"
Cohesion: 0.11
Nodes (25): LocaleLayout(), generateMetadata(), viewport, PlansPage(), PremiumGuard(), ConditionalFooter(), HIDDEN_PREFIXES, ConditionalHeader() (+17 more)

### Community 68 - "chart.tsx"
Cohesion: 0.20
Nodes (13): recharts, ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartStyle(), ChartTooltipContent() (+5 more)

### Community 69 - "config/navigation.ts"
Cohesion: 0.13
Nodes (22): GoogleAddShortcutTile(), GoogleShortcutModal(), GoogleShortcutModalProps, QuickAccessCustomizer(), QuickAccessCustomizerProps, QuickAccessCard(), QuickAccessCardProps, QuickAccessSection() (+14 more)

### Community 70 - "Button"
Cohesion: 0.18
Nodes (11): react-day-picker, ForgotPasswordPage(), LocaleNotFound(), PrivacyPage(), TermsPage(), NotFoundPage(), ThemeToggle(), Button() (+3 more)

### Community 71 - "context-menu.tsx"
Cohesion: 0.12
Nodes (10): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+2 more)

### Community 72 - "aparat-client.tsx"
Cohesion: 0.16
Nodes (5): AparatClient(), AparatClientProps, TaggedVideo, AparatPage(), ChannelInfoBar()

### Community 73 - "GoogleShortcutTile.tsx"
Cohesion: 0.23
Nodes (10): GoogleShortcutTileProps, highlightText(), NavSearchResult(), APP_ICON_DEFAULT_WEIGHT, AppIcon(), AppIconProps, NavColor, BILINGUAL_KEYWORDS (+2 more)

### Community 74 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext() (+6 more)

### Community 75 - "fetch_events.js"
Cohesion: 0.18
Nodes (9): fs, https, postRequest(), run(), fs, https, get(), https (+1 more)

### Community 76 - "dashboard-avatar.tsx"
Cohesion: 0.15
Nodes (3): PREDEFINED_AVATARS, STATUSES, UserStatus

### Community 77 - "stats.service.ts"
Cohesion: 0.18
Nodes (6): FALLBACK, FAKE_STATS, FakeStatsService, IStatsService, RealStatsService, StatItem

### Community 78 - "Badge"
Cohesion: 0.11
Nodes (30): Page(), Badge(), badgeVariants, Progress(), ProjectsListPage(), ProjectsListPageProps, ProjectsPageContainer(), ProjectsSlideWidget() (+22 more)

### Community 79 - "usePersianDigits.ts"
Cohesion: 0.33
Nodes (7): PersianDigitsProvider(), PersianDigitsProviderProps, abbreviationMap, convertTextNode(), englishToPersianMap, shouldProcessNode(), usePersianDigits()

### Community 80 - "myFunc.ps1"
Cohesion: 0.26
Nodes (10): engines, node, npm, Get-DevServerUrl(), gp(), op(), run(), runall() (+2 more)

### Community 81 - "drawer.tsx"
Cohesion: 0.20
Nodes (8): vaul, DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerPortal(), DrawerTitle()

### Community 82 - "preferences.service.ts"
Cohesion: 0.21
Nodes (5): DEFAULT_PREFS, FakePreferencesService, IPreferencesService, RealPreferencesService, UserPreferences

### Community 84 - "commodities.service.ts"
Cohesion: 0.24
Nodes (6): CommodityItem, FAKE_COMMODITIES, FakeCommoditiesService, ICommoditiesService, RealCommoditiesService, wait()

### Community 85 - "floatingEdge.ts"
Cohesion: 0.31
Nodes (10): ellipsePoints(), getEdgePosition(), getFloatingEdgeParams(), getNodeIntersection(), nodePolygon(), Point, polygonRayIntersection(), raySegmentIntersection() (+2 more)

### Community 86 - "fetch_bahesab.js"
Cohesion: 0.22
Nodes (7): cheerio, cheerio, fs, persianToEnglishDigits(), scrapeHolidays(), cheerio, fs

### Community 87 - ".get"
Cohesion: 0.18
Nodes (3): FakeNavigationService, INavigationService, RealNavigationService

### Community 89 - "scraper.js"
Cohesion: 0.28
Nodes (7): axios, cheerio, fs, getHolidays(), monthMap, parseIranfair(), run()

### Community 90 - "inject_fairs.js"
Cohesion: 0.22
Nodes (8): arrayStart, enObj, faObj, fs, newEvents, parsed, path, serviceContent

### Community 91 - "TasksManagementPage"
Cohesion: 0.27
Nodes (7): Props, TaskDetailPage(), Page(), Props, Page(), Props, TasksManagementPage()

### Community 92 - "navigation-menu.tsx"
Cohesion: 0.24
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger(), navigationMenuTriggerStyle (+1 more)

### Community 93 - "pagination.tsx"
Cohesion: 0.28
Nodes (7): Pagination(), PaginationContent(), PaginationEllipsis(), PaginationLink(), PaginationLinkProps, PaginationNext(), PaginationPrevious()

### Community 94 - "flowStorage.ts"
Cohesion: 0.29
Nodes (3): FlowState, saveFlowState(), setupAutoSave()

### Community 95 - "src/services/index.ts"
Cohesion: 0.13
Nodes (16): ExchangeRates, FakeExchangeRatesService, IExchangeRatesService, RealExchangeRatesService, ApiErrorResponse, ApiResponse, ApiResult, DateRangeParams (+8 more)

### Community 96 - "Getting Started"
Cohesion: 0.29
Nodes (6): ESP App, Features, Getting Started, Manual Setup, One-Liner Setup (PowerShell), Prerequisites

### Community 97 - "parse_excel.js"
Cohesion: 0.29
Nodes (5): data, events, fs, workbook, xlsx

### Community 98 - "routing.ts"
Cohesion: 0.28
Nodes (6): deepMerge(), Locale, localeDirection, localeLabels, routing, config

### Community 99 - "input-group.tsx"
Cohesion: 0.32
Nodes (7): InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea()

### Community 100 - "aggregate.calc.ts"
Cohesion: 0.40
Nodes (3): AggregateInput, WeightSummary, VesselWeightState

### Community 101 - "update-remove-birthday.js"
Cohesion: 0.29
Nodes (6): enContent, faContent, fs, path, serviceContent, widgetContent

### Community 102 - "eslint.config.mjs"
Cohesion: 0.33
Nodes (3): eslintConfig, eslint-config-prettier, eslint-plugin-react-hooks

### Community 103 - "parse-pdf.js"
Cohesion: 0.33
Nodes (5): events, fs, lines, monthMap, ocr

### Community 104 - "input-otp.tsx"
Cohesion: 0.33
Nodes (4): input-otp, InputOTP(), InputOTPGroup(), InputOTPSlot()

### Community 105 - "parse_pdf_to_js.js"
Cohesion: 0.33
Nodes (5): events, fs, lines, monthMap, ocr

### Community 106 - "resizable.tsx"
Cohesion: 0.40
Nodes (3): react-resizable-panels, ResizableHandle(), ResizablePanelGroup()

### Community 107 - "search-results-client.tsx"
Cohesion: 0.17
Nodes (15): SearchPage(), GoogleSearchBox(), GoogleSearchBoxProps, SiteSearch(), SideMenu(), AnimatedHamburger(), AnimatedHamburgerProps, createLineTransition() (+7 more)

### Community 108 - "container.tsx"
Cohesion: 0.33
Nodes (5): ContainerProps, ContainerSize, containerSizeClasses, FullWidth(), FullWidthProps

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

### Community 115 - "dashboard.tsx"
Cohesion: 0.11
Nodes (24): motion, ActivityFeed(), STATUS_CONFIG, BourseItem, BourseWidget(), ChecklistWidget(), CustomResizeHandle, Dashboard() (+16 more)

### Community 116 - "replace.js"
Cohesion: 0.40
Nodes (3): code, events, fs

### Community 117 - "scratch_translations.js"
Cohesion: 0.40
Nodes (3): enProfile, faProfile, fs

### Community 118 - "remove-icons.js"
Cohesion: 0.40
Nodes (4): endIdx, fs, lines, startIdx

### Community 120 - "fix_en_json.js"
Cohesion: 0.50
Nodes (3): enData, faData, fs

### Community 121 - "parse.js"
Cohesion: 0.50
Nodes (3): fs, html, urls

### Community 122 - "admin/page.tsx"
Cohesion: 0.48
Nodes (3): AdminPage(), HomePage(), AuthGate()

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

## Knowledge Gaps
- **881 isolated node(s):** `fs`, `code`, `$schema`, `style`, `rsc` (+876 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1064 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `did-you-know-page.tsx`, `radix-ui`, `Input`, `BaseNode.tsx`, `login/page.tsx`, `package.json`, `GeneralDataNode.tsx`, `alert-dialog.tsx`, `store/index.ts`, `AdminDashboard.tsx`, `ProjectDataNode.tsx`, `profile-page.tsx`, `cn`, `tasks-management-page.tsx`, `search/services/search.service.ts`, `Link`, `app/layout.tsx`, `commodities-widget.tsx`, `VideoListItem`, `team-client.tsx`, `Toolbar.tsx`, `base.schema.ts`, `playlist.tsx`, `dictionary-page.tsx`, `stats-section.tsx`, `dashboard-control-hub-modal.tsx`, `useVesselWeightStore`, `attachments.schema.ts`, `Combobox`, `nodes/NozzleNode.tsx`, `SettingsPanel.tsx`, `src/services/search.service.ts`, `EditorSettingsDialog.tsx`, `task-detail-view.tsx`, `dashboard.service.ts`, `mistEliminator.schema.ts`, `channel-video-search.tsx`, `support.schema.ts`, `EngineeringObject.tsx`, `date-picker.tsx`, `esp-flow/components/DiagramCanvas.tsx`, `ProjectItem`, `src/types/index.ts`, `multi-button.tsx`, `vessel/ShellNode.tsx`, `menubar.tsx`, `custom-dashboard-builder.tsx`, `home-client.tsx`, `sitemap-client.tsx`, `i18n/navigation.ts`, `chart.tsx`, `config/navigation.ts`, `Button`, `context-menu.tsx`, `aparat-client.tsx`, `GoogleShortcutTile.tsx`, `carousel.tsx`, `dashboard-avatar.tsx`, `stats.service.ts`, `Badge`, `usePersianDigits.ts`, `drawer.tsx`, `TasksManagementPage`, `navigation-menu.tsx`, `pagination.tsx`, `input-group.tsx`, `input-otp.tsx`, `search-results-client.tsx`, `container.tsx`, `dashboard.tsx`, `channel-banner.tsx`, `admin/page.tsx`?**
  _High betweenness centrality (0.199) - this node is a cross-community bridge._
- **What connects `fs`, `code`, `$schema` to the rest of the system?**
  _881 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `radix-ui` be split into smaller, more focused modules?**
  _Cohesion score 0.11067193675889328 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `did-you-know-page.tsx`, `i18n/navigation.ts`, `login/page.tsx`, `useVesselWeightStore`, `package.json`, `search-results-client.tsx`, `task-detail-view.tsx`, `profile-page.tsx`, `Badge`, `tasks-management-page.tsx`, `refactor_admin.js`, `esp-flow/components/DiagramCanvas.tsx`, `team-client.tsx`, `playlist.tsx`, `dictionary-page.tsx`, `MarketQuote`?**
  _High betweenness centrality (0.179) - this node is a cross-community bridge._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.07507660878447395 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `did-you-know-page.tsx`, `radix-ui`, `Input`, `BaseNode.tsx`, `login/page.tsx`, `GeneralDataNode.tsx`, `alert-dialog.tsx`, `store/index.ts`, `AdminDashboard.tsx`, `react`, `profile-page.tsx`, `tasks-management-page.tsx`, `search/services/search.service.ts`, `Link`, `commodities-widget.tsx`, `Toolbar.tsx`, `playlist.tsx`, `dictionary-page.tsx`, `dashboard-control-hub-modal.tsx`, `useVesselWeightStore`, `Combobox`, `SettingsPanel.tsx`, `EditorSettingsDialog.tsx`, `task-detail-view.tsx`, `dashboard.service.ts`, `channel-video-search.tsx`, `date-picker.tsx`, `esp-flow/components/DiagramCanvas.tsx`, `ProjectItem`, `multi-button.tsx`, `menubar.tsx`, `custom-dashboard-builder.tsx`, `home-client.tsx`, `sitemap-client.tsx`, `i18n/navigation.ts`, `chart.tsx`, `config/navigation.ts`, `Button`, `context-menu.tsx`, `aparat-client.tsx`, `GoogleShortcutTile.tsx`, `carousel.tsx`, `dashboard-avatar.tsx`, `Badge`, `drawer.tsx`, `TasksManagementPage`, `navigation-menu.tsx`, `pagination.tsx`, `input-group.tsx`, `input-otp.tsx`, `resizable.tsx`, `search-results-client.tsx`, `container.tsx`, `dashboard.tsx`, `channel-banner.tsx`?**
  _High betweenness centrality (0.168) - this node is a cross-community bridge._
- **Should `BaseNode.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.047474747474747475 - nodes in this community are weakly interconnected._