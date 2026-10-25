# Graph Report - esp-app  (2026-10-25)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 3081 nodes · 9604 edges · 155 communities (129 shown, 26 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3f3ceafa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react
- VesselNodeBase.tsx
- cn
- BaseNode.tsx
- dependencies
- User
- task-detail-view.tsx
- package.json
- login/page.tsx
- store/index.ts
- vessel/HeadNode.tsx
- TaskItem
- home-client.tsx
- esp-flow/components/DiagramCanvas.tsx
- GoogleShortcutTile.tsx
- Label
- Link
- dashboard.tsx
- src/services/index.ts
- dashboard-avatar.tsx
- channel-video-search.tsx
- paths
- Combobox
- HttpClient
- ref_fs
- date-picker.tsx
- Badge
- team-client.tsx
- VideoListItem
- Toolbar.tsx
- profile-page.tsx
- MarketQuote
- dictionary-page.tsx
- [locale]/layout.tsx
- stats-section.tsx
- test-scheduler.ts
- radix-ui
- useVesselWeightStore
- base.schema.ts
- ProjectDataNode.tsx
- SettingsPanel.tsx
- IAuthService
- attachments.schema.ts
- EditorSettingsDialog.tsx
- dashboard.service.ts
- engineering-dictionary-data.ts
- TooltipContent
- header.tsx
- src/services/search.service.ts
- search/services/search.service.ts
- components.json
- aparat.service.ts
- mistEliminator.schema.ts
- devDependencies
- app/layout.tsx
- support.schema.ts
- refactor_admin.js
- EngineeringObject.tsx
- UserProfile
- useAuth
- auth.service.ts
- FakeProjectsService
- src/types/index.ts
- scratch/package.json
- menubar.tsx
- ShapeNodes.tsx
- scripts
- alert-dialog.tsx
- FakeAuthService
- did-you-know-page.tsx
- AdminDashboard.tsx
- aparat-client.tsx
- sitemap-client.tsx
- carousel.tsx
- ProjectItem
- fake-projects.service.ts
- ProjectsService
- nodes/NozzleNode.tsx
- fetch_events.js
- chart.tsx
- User
- commodities-widget.tsx
- slide-settings-drawer.tsx
- stats.service.ts
- projects.types.ts
- myFunc.ps1
- stat-card.tsx
- drawer.tsx
- search-results-client.tsx
- profile.ts
- input-otp.tsx
- commodities.service.ts
- floatingEdge.ts
- fetch_bahesab.js
- scraper.js
- inject_fairs.js
- input-group.tsx
- pagination.tsx
- flowStorage.ts
- exchange-rates.service.ts
- Getting Started
- parse_excel.js
- market-control-bar.tsx
- update-remove-birthday.js
- eslint.config.mjs
- parse-pdf.js
- mini-chart.tsx
- parse_pdf_to_js.js
- settings-section.tsx
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
- replace.js
- scratch_translations.js
- remove-icons.js
- chart/route.ts
- time-provider.tsx
- channelstats.tsx
- aggregate.calc.ts
- fix_en_json.js
- parse.js
- exchange-rates/route.ts
- constants/layout.ts
- flangeWeightTable.ts
- pipeDimensions.ts
- update-admin-translations-fix.js
- update-departments.js
- update-tabs-motion.js
- next.config.ts
- browserslist
- repository
- fix_titles.js
- [...path]/route.ts
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
- `QuickAddItem` --references--> `DiagramNodeType`  [EXTRACTED]
  src/modules/esp-flow/components/ContextMenu.tsx → src/modules/esp-flow/types/index.ts
- `AuthState` --references--> `User`  [EXTRACTED]
  src/modules/auth/hooks/use-auth.ts → src/types/auth.ts
- `GeneralDataNodeData` --inherits--> `DiagramNodeData`  [EXTRACTED]
  src/modules/esp-flow/components/nodes/vessel/GeneralDataNode.tsx → src/modules/esp-flow/types/index.ts

## Import Cycles
- None detected.

## Communities (155 total, 26 thin omitted)

### Community 0 - "react"
Cohesion: 0.06
Nodes (57): leaflet, lucide-react, motion, next-intl, react, react-day-picker, ForgotPasswordPage(), PrivacyPage() (+49 more)

### Community 1 - "VesselNodeBase.tsx"
Cohesion: 0.06
Nodes (84): @xyflow/react, Checkbox(), AttachmentsNode, createNewAttachment(), DiagramNode, Props, GeneralDataNode, DiagramNode (+76 more)

### Community 2 - "cn"
Cohesion: 0.04
Nodes (75): SearchPopup(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink() (+67 more)

### Community 3 - "BaseNode.tsx"
Cohesion: 0.06
Nodes (80): BEAM_SHAPE_LABELS, BeamCalcNode(), ChartNode(), CircleNode(), CloudNode(), ConstantNode(), CORNER_OFFSET_STYLE, CornerResizer() (+72 more)

### Community 4 - "dependencies"
Cohesion: 0.03
Nodes (78): dependencies, @auth/core, axios, @base-ui/react, bcryptjs, class-variance-authority, clsx, cmdk (+70 more)

### Community 5 - "User"
Cohesion: 0.07
Nodes (26): AdminHeaderProps, AdminHeatmapModulesProps, AdminProfileStatsProps, AdminRequestsProps, AdminTasksTimeProps, AdminUserConfigProps, AdminUsersTableProps, AdminFakeService (+18 more)

### Community 6 - "task-detail-view.tsx"
Cohesion: 0.08
Nodes (54): react-dom, Avatar(), AvatarFallback(), Textarea(), AdminHeader(), AdminTasksTime(), AnimatedNumber(), TaskAttachmentsSection() (+46 more)

### Community 7 - "package.json"
Cohesion: 0.03
Nodes (66): author, keywords, license, name, private, version, @auth/core, @base-ui/react (+58 more)

### Community 8 - "login/page.tsx"
Cohesion: 0.10
Nodes (43): @hookform/resolvers, next, react-hook-form, AccountPendingPage(), AccountRequestPage(), LoginPage(), RegisterPage(), ResetPasswordContent() (+35 more)

### Community 9 - "store/index.ts"
Cohesion: 0.08
Nodes (53): CustomEdge(), edgeTypes, ShapeCanvasProps, JacketNodeData, RegenVacuumSteamoutNodeData, SurfacePrepNodeData, VesselNodeContainerProps, DEFAULT_SETTINGS (+45 more)

### Community 10 - "vessel/HeadNode.tsx"
Cohesion: 0.08
Nodes (45): createDefaultHead(), DiagramNode, HEAD_TYPES, HeadNode, MATERIALS, NPS_OPTIONS, POSITIONS, Props (+37 more)

### Community 11 - "TaskItem"
Cohesion: 0.08
Nodes (7): FakeTasksService, INITIAL_MOCK_TASKS, RealTasksService, TasksService, TaskComment, TaskCommentReply, TaskItem

### Community 12 - "home-client.tsx"
Cohesion: 0.06
Nodes (38): @phosphor-icons/react, zustand, HomePage(), SiteSearch(), Container(), ContainerProps, ContainerSize, containerSizeClasses (+30 more)

### Community 13 - "esp-flow/components/DiagramCanvas.tsx"
Cohesion: 0.07
Nodes (42): FlowPage(), metadata, clampPosition(), ContextMenu(), ContextMenuState, QuickAddItem, safeT(), absolutePosition() (+34 more)

### Community 14 - "GoogleShortcutTile.tsx"
Cohesion: 0.09
Nodes (33): GoogleAddShortcutTile(), GoogleAddShortcutTileProps, GoogleShortcutModal(), GoogleShortcutModalProps, GoogleShortcutTile(), GoogleShortcutTileProps, QuickAccessCustomizer(), QuickAccessCustomizerProps (+25 more)

### Community 15 - "Label"
Cohesion: 0.18
Nodes (31): CommandDialog(), Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogPortal() (+23 more)

### Community 16 - "Link"
Cohesion: 0.10
Nodes (29): LocaleNotFound(), PlansPage(), HIDDEN_PREFIXES, ConditionalHeader(), HIDDEN_PREFIXES, Footer(), FooterLinkItem, FooterProps (+21 more)

### Community 17 - "dashboard.tsx"
Cohesion: 0.10
Nodes (35): Skeleton(), ActivityFeed(), BourseWidget(), CalendarWidget(), DashboardControlHubModalProps, CustomDashboardBuilder(), CustomResizeHandle, Dashboard() (+27 more)

### Community 18 - "src/services/index.ts"
Cohesion: 0.09
Nodes (27): AuthState, useAuthStore, CustomDashboardBuilderProps, useDashboard(), UseDashboardResult, DashboardData, ApiError, ErrorCode (+19 more)

### Community 19 - "dashboard-avatar.tsx"
Cohesion: 0.17
Nodes (22): AppsPopover(), HelpPopover(), Popover(), PopoverAnchor(), PopoverContent(), PopoverTrigger(), ScrollArea(), ScrollBar() (+14 more)

### Community 20 - "channel-video-search.tsx"
Cohesion: 0.14
Nodes (28): @radix-ui/react-tabs, @tanstack/react-virtual, ChannelHeader(), ChannelHeaderProps, ChannelVideoSearch(), ChannelVideoSearchProps, Playlist(), SlidingTabItem (+20 more)

### Community 21 - "paths"
Cohesion: 0.05
Nodes (36): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+28 more)

### Community 22 - "Combobox"
Cohesion: 0.08
Nodes (33): Combobox(), COMBOBOX_SEARCH_THRESHOLD, ComboboxOption, ComboboxProps, sizeClasses, Command(), CommandEmpty(), CommandGroup() (+25 more)

### Community 23 - "HttpClient"
Cohesion: 0.08
Nodes (12): RealDashboardService, getToken(), HttpClient, isRetryable(), sleep(), RealNavigationService, DEFAULT_PREFS, FakePreferencesService (+4 more)

### Community 24 - "ref_fs"
Cohesion: 0.06
Nodes (20): code, fs, fs, fs, content, fs, content, fs (+12 more)

### Community 25 - "date-picker.tsx"
Cohesion: 0.11
Nodes (28): date-fns-jalali, CalendarContent(), CalendarContentProps, DatePicker(), DatePickerProps, getGregorianDaysInMonth(), getJalaliDate(), getJalaliDaysInMonth() (+20 more)

### Community 26 - "Badge"
Cohesion: 0.16
Nodes (22): Page(), Props, Badge(), badgeVariants, Progress(), DISCOVER_ITEMS, DiscoverItem, DiscoverSection() (+14 more)

### Community 27 - "team-client.tsx"
Cohesion: 0.08
Nodes (20): TeamPage(), BINARY_BG, CARD_MAX_HEIGHT, cardMaxWidth(), containerVariants, contentTeam, engineeringTeam, GitHubIcon() (+12 more)

### Community 28 - "VideoListItem"
Cohesion: 0.11
Nodes (14): AparatContext, AparatProvider(), AparatProviderProps, sample(), useAparatChannel(), UseAparatChannelResult, VideoCardProps, IAparatService (+6 more)

### Community 29 - "Toolbar.tsx"
Cohesion: 0.14
Nodes (23): AvatarBadge(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem() (+15 more)

### Community 30 - "profile-page.tsx"
Cohesion: 0.11
Nodes (19): Page(), Props, AVATAR_COLOR_PRESETS, DEGREE_OPTIONS, formatDateToString(), getSkillBadgeStyle(), LocationPickerMap, MARITAL_STATUS_OPTIONS (+11 more)

### Community 31 - "MarketQuote"
Cohesion: 0.16
Nodes (14): dynamic, fetchCache, GET(), MARKET_SYMBOLS, MarketController, MarketHistory, MarketQuote, MarketSymbol (+6 more)

### Community 32 - "dictionary-page.tsx"
Cohesion: 0.13
Nodes (22): Page(), buildBilingualPattern(), escapeRegExp(), HighlightMatch(), HighlightMatchProps, DICE_FACES, NAV_ITEMS, CustomDictionaryTermInput (+14 more)

### Community 33 - "[locale]/layout.tsx"
Cohesion: 0.11
Nodes (19): LocaleLayout(), generateMetadata(), viewport, ConditionalFooter(), HtmlLangSync(), ScrollToTop(), PersianDigitsProvider(), PersianDigitsProviderProps (+11 more)

### Community 34 - "stats-section.tsx"
Cohesion: 0.12
Nodes (20): StatCard(), StatsSection(), StatsSectionProps, STATS, useCountUp(), UseCountUpOptions, useInView(), UseInViewOptions (+12 more)

### Community 35 - "test-scheduler.ts"
Cohesion: 0.11
Nodes (17): @playwright/test, args, intervalArg, isQuick, isSchedule, isWatch, main(), printHeader() (+9 more)

### Community 36 - "radix-ui"
Cohesion: 0.10
Nodes (18): class-variance-authority, radix-ui, HoverCardContent(), NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink() (+10 more)

### Community 37 - "useVesselWeightStore"
Cohesion: 0.18
Nodes (16): metadata, VesselWeightPage(), DiagramCanvas(), getId(), nodeTypes, MTOPanel(), InternalsNode, OutputHubNode (+8 more)

### Community 38 - "base.schema.ts"
Cohesion: 0.11
Nodes (20): zod, Material, MATERIAL_DENSITY, MaterialSchema, NodePositionSchema, UnitSystem, UnitSystemSchema, WeightSummarySchema (+12 more)

### Community 39 - "ProjectDataNode.tsx"
Cohesion: 0.18
Nodes (23): PhoneInput(), PhoneInputProps, applyMask(), cleanRawPhone(), COUNTRIES, Country, getCountryByCode(), toEnglishDigits() (+15 more)

### Community 40 - "SettingsPanel.tsx"
Cohesion: 0.12
Nodes (21): Slider(), ToggleGroup(), DEL_BTN, DUPE_BTN, EDGE_TYPE_OPTIONS, EdgeColorTokenRow(), Field(), LABEL_SYMBOLS (+13 more)

### Community 42 - "attachments.schema.ts"
Cohesion: 0.15
Nodes (23): calcAttachmentWeight(), calcInsulationSupportWeight(), calcLiftingLugWeight(), calcNamePlateWeight(), calcTurningLugWeight(), getDensity(), AttachmentsNode, createNewAttachment() (+15 more)

### Community 43 - "EditorSettingsDialog.tsx"
Cohesion: 0.22
Nodes (17): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), Switch(), Tabs(), TabsContent(), TabsList() (+9 more)

### Community 44 - "dashboard.service.ts"
Cohesion: 0.08
Nodes (21): STATUS_CONFIG, CustomLinksWidgetProps, NotesWidgetProps, ActivityItem, ChecklistItem, ChecklistPeriod, CustomLink, DashboardNote (+13 more)

### Community 45 - "engineering-dictionary-data.ts"
Cohesion: 0.14
Nodes (16): getDidYouKnowCards(), seededShuffle(), DID_YOU_KNOW_CARDS_EN, DID_YOU_KNOW_CARDS_FA, DidYouKnowCardItem, DictionaryCategoryItem, interleaveDictionaryTerms(), DICTIONARY_CATEGORIES_EN (+8 more)

### Community 46 - "TooltipContent"
Cohesion: 0.18
Nodes (18): GoogleSearchBox(), GoogleSearchBoxProps, AiModeIcon(), GenericSearchBox(), GenericSearchBoxProps, SidebarMenuButton(), Tooltip(), TooltipContent() (+10 more)

### Community 47 - "header.tsx"
Cohesion: 0.21
Nodes (17): AppHeader(), AppHeaderProps, LocaleSwitcher(), ThemeToggle(), FOOTER_HEIGHT_MOBILE_PX, FOOTER_HEIGHT_PX, HEADER_HEIGHT_PX, HEADER_ICON_BUTTON_CLASS (+9 more)

### Community 48 - "src/services/search.service.ts"
Cohesion: 0.13
Nodes (12): useSiteSearchItems(), BILINGUAL_KEYWORDS, getBilingualKeywords(), NAV_SEARCH_SOURCE, NavSearchItem, API_MODE, FakeSearchService, ISearchService (+4 more)

### Community 49 - "search/services/search.service.ts"
Cohesion: 0.19
Nodes (14): normalizeSearchText(), UseUniversalSearchOptions, BILINGUAL_SYNONYMS, FakeSearchService, ISearchService, isEnglishQuery(), isPersianQuery(), RealSearchService (+6 more)

### Community 50 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 51 - "aparat.service.ts"
Cohesion: 0.21
Nodes (13): AparatService, decodeEntities(), endpointFromAparatUrl(), isAbortError(), isTransient(), normalizeVideo(), pickKey(), pickNextPageUrl() (+5 more)

### Community 52 - "mistEliminator.schema.ts"
Cohesion: 0.16
Nodes (18): calcDemisterWeight(), calculateCircularSegments(), circleHalfArea(), getDensity(), YORK_DENSITIES, createNewDemister(), DemisterDrawing(), MistEliminatorNode (+10 more)

### Community 53 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, eslint, eslint-config-next, eslint-config-prettier, eslint-plugin-react, eslint-plugin-react-hooks, @playwright/test, prettier (+12 more)

### Community 54 - "app/layout.tsx"
Cohesion: 0.17
Nodes (14): next-themes, RootLayout(), DEFAULT_PRIMARY_COLOR, PRIMARY_COLORS, PrimaryColorId, PrimaryColorPreset, ALL_COLOR_CLASSES, applyColorClass() (+6 more)

### Community 55 - "support.schema.ts"
Cohesion: 0.15
Nodes (17): calcAnnularRingWeight(), calcCylinderWeight(), calcLegColumnWeight(), calcRectPlateWeight(), SupportNode, LegData, LegSchema, LugData (+9 more)

### Community 56 - "refactor_admin.js"
Cohesion: 0.11
Nodes (12): adminDashboardPath, adminDir, content, fs, path, fs, path, srcDir (+4 more)

### Community 57 - "EngineeringObject.tsx"
Cohesion: 0.15
Nodes (15): @react-three/drei, @react-three/fiber, three, OutputNode, OutputNodeData, ShapeNode, ShapeNodeData, ShapeOption (+7 more)

### Community 58 - "UserProfile"
Cohesion: 0.18
Nodes (9): @tanstack/react-query, PersonnelFormProps, useProfile(), FakeProfileService, MOCK_PROFILE, profileService, ProfileService, RealProfileService (+1 more)

### Community 59 - "useAuth"
Cohesion: 0.16
Nodes (12): AdminPage(), HomePage(), Props, TaskDetailPage(), Page(), Props, Page(), Props (+4 more)

### Community 60 - "auth.service.ts"
Cohesion: 0.14
Nodes (14): ROLE_HOME, AccountRequestPayload, AccountRequestRecord, AccountRequestResult, AccountStatusResult, DEMO_USERS, LoginPayload, LoginResult (+6 more)

### Community 62 - "src/types/index.ts"
Cohesion: 0.11
Nodes (18): CategoryTabsProps, ChannelHeaderProps, ChannelInfo, ChannelProfile, ChannelResponse, ChannelStatsProps, LiveStream, PlaylistProps (+10 more)

### Community 63 - "scratch/package.json"
Cohesion: 0.12
Nodes (16): author, dependencies, axios, cheerio, xlsx, description, axios, xlsx (+8 more)

### Community 64 - "menubar.tsx"
Cohesion: 0.12
Nodes (12): Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarPortal(), MenubarRadioItem(), MenubarSeparator() (+4 more)

### Community 65 - "ShapeNodes.tsx"
Cohesion: 0.15
Nodes (14): BaseNodeShell(), BaseNodeShellProps, DefaultNode(), FONT_WEIGHT_MAP, getNodeStyle(), VesselHandlesProps, FLOW_HANDLE_CIRCLE, FLOW_HANDLE_CLASS (+6 more)

### Community 66 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, clean, dev, dev:local, dev:network, dev:network:hmr, lint (+8 more)

### Community 67 - "alert-dialog.tsx"
Cohesion: 0.28
Nodes (13): GlobalConfirmModal(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader() (+5 more)

### Community 69 - "did-you-know-page.tsx"
Cohesion: 0.17
Nodes (9): embla-carousel-react, Page(), DICE_FACES, MATH_FORMULA_STYLE, NAV_ITEMS, CustomCardInput, THEME_PRESETS, useDidYouKnow() (+1 more)

### Community 70 - "AdminDashboard.tsx"
Cohesion: 0.26
Nodes (9): sonner, Collapsible(), CollapsibleContent(), CollapsibleTrigger(), AdminDashboard(), AdminHeatmapModules(), AdminProfileStats(), AdminUserConfig() (+1 more)

### Community 71 - "aparat-client.tsx"
Cohesion: 0.16
Nodes (5): AparatClient(), AparatClientProps, TaggedVideo, AparatPage(), ChannelInfoBar()

### Community 72 - "sitemap-client.tsx"
Cohesion: 0.22
Nodes (10): dagre, SitemapPage(), FlowInner(), getDoubleSidedLayout(), LayoutDirection, nodeTypes, SitemapClient(), SitemapNode (+2 more)

### Community 73 - "carousel.tsx"
Cohesion: 0.19
Nodes (13): Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions (+5 more)

### Community 74 - "ProjectItem"
Cohesion: 0.19
Nodes (6): ProjectCreateDialogProps, ProjectMiroRoadmapTabProps, ProjectReportsAnalyticsTabProps, ProjectStrategicOkrsTabProps, RealProjectsService, ProjectItem

### Community 75 - "fake-projects.service.ts"
Cohesion: 0.21
Nodes (6): ProjectVdisTransmittalTabProps, DEFAULT_PROJECT_PHASES, INITIAL_PROJECTS, projectsService, ProjectTeamMember, VdisDocumentItem

### Community 77 - "nodes/NozzleNode.tsx"
Cohesion: 0.25
Nodes (11): calcNozzleWeight(), getDensity(), AccordionItem(), createNewNozzle(), NozzleDrawing(), NozzleNode, BaseNodeDataSchema, Nozzle (+3 more)

### Community 78 - "fetch_events.js"
Cohesion: 0.18
Nodes (9): fs, https, postRequest(), run(), fs, https, get(), https (+1 more)

### Community 79 - "chart.tsx"
Cohesion: 0.22
Nodes (12): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartStyle(), ChartTooltipContent(), getPayloadConfigFromPayload() (+4 more)

### Community 80 - "User"
Cohesion: 0.24
Nodes (4): FakeUserService, IUserService, wait(), User

### Community 81 - "commodities-widget.tsx"
Cohesion: 0.29
Nodes (10): CATEGORIES, CommoditiesWidget(), formatLargeIrr(), formatPrice(), UNITS, StatsOverviewWidget(), useCommodities(), DashboardSettingsState (+2 more)

### Community 82 - "slide-settings-drawer.tsx"
Cohesion: 0.22
Nodes (11): ALL_SLIDE_ITEMS, DEFAULT_SLIDE_ITEMS, SlideMenuCustomizerModal(), SlideMenuCustomizerModalProps, SlideMenuItemDef, itemKeySafe(), SlideSettingsDrawer(), SlideSettingsDrawerProps (+3 more)

### Community 83 - "stats.service.ts"
Cohesion: 0.18
Nodes (6): FALLBACK, FAKE_STATS, FakeStatsService, IStatsService, RealStatsService, StatItem

### Community 84 - "projects.types.ts"
Cohesion: 0.19
Nodes (11): ProjectOverviewTabProps, DEFAULT_FILTERS, ProjectFilterState, ProjectStatus, ProjectSubPackage, ProjectType, RiskProbability, RiskSeverity (+3 more)

### Community 85 - "myFunc.ps1"
Cohesion: 0.26
Nodes (10): engines, node, npm, Get-DevServerUrl(), gp(), op(), run(), runall() (+2 more)

### Community 86 - "stat-card.tsx"
Cohesion: 0.21
Nodes (8): ICONS, StatCard(), TREND_COLOR, TREND_ICON, UNIT_LABELS, CONVERTER_CATEGORIES, UNITS, StatCard

### Community 87 - "drawer.tsx"
Cohesion: 0.20
Nodes (8): vaul, DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerPortal(), DrawerTitle()

### Community 88 - "search-results-client.tsx"
Cohesion: 0.27
Nodes (8): SearchPage(), AnimatedHamburger(), AnimatedHamburgerProps, createLineTransition(), dotSpring, SearchResultCard(), SearchResultsClient(), useUniversalSearch()

### Community 89 - "profile.ts"
Cohesion: 0.17
Nodes (11): ContractType, DependentInfo, EducationInfo, EducationRecord, InsuranceInfo, MaritalStatus, OrganizationalInfo, PersonalInfo (+3 more)

### Community 90 - "input-otp.tsx"
Cohesion: 0.16
Nodes (7): input-otp, react-resizable-panels, InputOTP(), InputOTPGroup(), InputOTPSlot(), ResizableHandle(), ResizablePanelGroup()

### Community 91 - "commodities.service.ts"
Cohesion: 0.24
Nodes (6): CommodityItem, FAKE_COMMODITIES, FakeCommoditiesService, ICommoditiesService, RealCommoditiesService, wait()

### Community 92 - "floatingEdge.ts"
Cohesion: 0.31
Nodes (10): ellipsePoints(), getEdgePosition(), getFloatingEdgeParams(), getNodeIntersection(), nodePolygon(), Point, polygonRayIntersection(), raySegmentIntersection() (+2 more)

### Community 93 - "fetch_bahesab.js"
Cohesion: 0.22
Nodes (7): cheerio, cheerio, fs, persianToEnglishDigits(), scrapeHolidays(), cheerio, fs

### Community 94 - "scraper.js"
Cohesion: 0.28
Nodes (8): axios, axios, cheerio, fs, getHolidays(), monthMap, parseIranfair(), run()

### Community 95 - "inject_fairs.js"
Cohesion: 0.22
Nodes (8): arrayStart, enObj, faObj, fs, newEvents, parsed, path, serviceContent

### Community 96 - "input-group.tsx"
Cohesion: 0.31
Nodes (8): CommandInput(), InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupTextarea()

### Community 97 - "pagination.tsx"
Cohesion: 0.28
Nodes (7): Pagination(), PaginationContent(), PaginationEllipsis(), PaginationLink(), PaginationLinkProps, PaginationNext(), PaginationPrevious()

### Community 98 - "flowStorage.ts"
Cohesion: 0.29
Nodes (3): FlowState, saveFlowState(), setupAutoSave()

### Community 99 - "exchange-rates.service.ts"
Cohesion: 0.32
Nodes (4): ExchangeRates, FakeExchangeRatesService, IExchangeRatesService, RealExchangeRatesService

### Community 100 - "Getting Started"
Cohesion: 0.29
Nodes (6): ESP App, Features, Getting Started, Manual Setup, One-Liner Setup (PowerShell), Prerequisites

### Community 101 - "parse_excel.js"
Cohesion: 0.29
Nodes (6): xlsx, data, events, fs, workbook, xlsx

### Community 102 - "market-control-bar.tsx"
Cohesion: 0.52
Nodes (6): CountdownTimer(), getRateModes(), MarketControlBar(), MarketControlBarProps, SettingsDropdown(), toPersianDigits()

### Community 103 - "update-remove-birthday.js"
Cohesion: 0.29
Nodes (6): enContent, faContent, fs, path, serviceContent, widgetContent

### Community 104 - "eslint.config.mjs"
Cohesion: 0.33
Nodes (3): eslintConfig, eslint-config-prettier, eslint-plugin-react-hooks

### Community 105 - "parse-pdf.js"
Cohesion: 0.33
Nodes (5): events, fs, lines, monthMap, ocr

### Community 106 - "mini-chart.tsx"
Cohesion: 0.47
Nodes (5): recharts, CustomTick(), CustomTooltip(), MiniChart(), ChartPoint

### Community 107 - "parse_pdf_to_js.js"
Cohesion: 0.33
Nodes (5): events, fs, lines, monthMap, ocr

### Community 108 - "settings-section.tsx"
Cohesion: 0.47
Nodes (4): MODE_OPTIONS, SettingsSection(), THEME_OPTIONS, usePrimaryColor()

### Community 109 - "alert.tsx"
Cohesion: 0.40
Nodes (5): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants

### Community 113 - "update-admin-translations.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 114 - "update-admin-translations2.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 115 - "update-admin-translations3.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 116 - "update-admin-translations4.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 117 - "update-translations.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, en, fa, fs

### Community 118 - "fix_types.js"
Cohesion: 0.40
Nodes (4): code, fs, matchFair, matchHol

### Community 119 - "replace.js"
Cohesion: 0.40
Nodes (3): code, events, fs

### Community 120 - "scratch_translations.js"
Cohesion: 0.40
Nodes (3): enProfile, faProfile, fs

### Community 121 - "remove-icons.js"
Cohesion: 0.40
Nodes (4): endIdx, fs, lines, startIdx

### Community 122 - "chart/route.ts"
Cohesion: 0.40
Nodes (3): CRYPTO_SYMBOL, SYMBOL_MAP, YH_HEADERS

### Community 123 - "time-provider.tsx"
Cohesion: 0.60
Nodes (3): useRelativeTime(), TimeContext, useNow()

### Community 124 - "channelstats.tsx"
Cohesion: 0.50
Nodes (4): ChannelStats(), ExtendedChannelStatsProps, StatItem, ChannelStatsProps

### Community 125 - "aggregate.calc.ts"
Cohesion: 0.40
Nodes (3): AggregateInput, WeightSummary, VesselWeightState

### Community 126 - "fix_en_json.js"
Cohesion: 0.50
Nodes (3): enData, faData, fs

### Community 127 - "parse.js"
Cohesion: 0.50
Nodes (3): fs, html, urls

### Community 129 - "constants/layout.ts"
Cohesion: 0.50
Nodes (3): HEADER_HEIGHT, MAX_CONTENT_WIDTH, SIDEBAR_WIDTH

### Community 130 - "flangeWeightTable.ts"
Cohesion: 0.50
Nodes (3): FLANGE_WEIGHTS, FlangeClass, FlangeType

### Community 131 - "pipeDimensions.ts"
Cohesion: 0.50
Nodes (3): PIPE_DIMENSIONS, PipeNPS, PipeSchedule

### Community 132 - "update-admin-translations-fix.js"
Cohesion: 0.50
Nodes (3): enData, faData, fs

### Community 133 - "update-departments.js"
Cohesion: 0.50
Nodes (3): en, fa, fs

### Community 134 - "update-tabs-motion.js"
Cohesion: 0.50
Nodes (3): calContent, checkContent, fs

### Community 136 - "browserslist"
Cohesion: 0.67
Nodes (3): browserslist, development, production

### Community 137 - "repository"
Cohesion: 0.67
Nodes (3): repository, type, url

## Knowledge Gaps
- **901 isolated node(s):** `SearchPopupProps`, `ColorPickerProps`, `ColorPreset`, `ColumnFilterState`, `ChannelInfoBarProps` (+896 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1089 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `VesselNodeBase.tsx`, `cn`, `BaseNode.tsx`, `task-detail-view.tsx`, `package.json`, `login/page.tsx`, `store/index.ts`, `vessel/HeadNode.tsx`, `home-client.tsx`, `esp-flow/components/DiagramCanvas.tsx`, `GoogleShortcutTile.tsx`, `Label`, `Link`, `dashboard.tsx`, `src/services/index.ts`, `dashboard-avatar.tsx`, `channel-video-search.tsx`, `modal-shell.tsx`, `Combobox`, `date-picker.tsx`, `Badge`, `team-client.tsx`, `VideoListItem`, `Toolbar.tsx`, `profile-page.tsx`, `dictionary-page.tsx`, `[locale]/layout.tsx`, `stats-section.tsx`, `radix-ui`, `useVesselWeightStore`, `base.schema.ts`, `ProjectDataNode.tsx`, `SettingsPanel.tsx`, `attachments.schema.ts`, `EditorSettingsDialog.tsx`, `TooltipContent`, `header.tsx`, `src/services/search.service.ts`, `search/services/search.service.ts`, `mistEliminator.schema.ts`, `app/layout.tsx`, `support.schema.ts`, `EngineeringObject.tsx`, `useAuth`, `src/types/index.ts`, `menubar.tsx`, `ShapeNodes.tsx`, `alert-dialog.tsx`, `did-you-know-page.tsx`, `AdminDashboard.tsx`, `aparat-client.tsx`, `sitemap-client.tsx`, `carousel.tsx`, `fake-projects.service.ts`, `nodes/NozzleNode.tsx`, `chart.tsx`, `commodities-widget.tsx`, `slide-settings-drawer.tsx`, `stats.service.ts`, `projects.types.ts`, `stat-card.tsx`, `drawer.tsx`, `search-results-client.tsx`, `input-otp.tsx`, `input-group.tsx`, `pagination.tsx`, `market-control-bar.tsx`, `settings-section.tsx`, `alert.tsx`, `time-provider.tsx`?**
  _High betweenness centrality (0.212) - this node is a cross-community bridge._
- **What connects `SearchPopupProps`, `ColorPickerProps`, `ColorPreset` to the rest of the system?**
  _901 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.06441374159820762 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `react`, `VesselNodeBase.tsx`, `BaseNode.tsx`, `task-detail-view.tsx`, `login/page.tsx`, `store/index.ts`, `vessel/HeadNode.tsx`, `home-client.tsx`, `esp-flow/components/DiagramCanvas.tsx`, `GoogleShortcutTile.tsx`, `Label`, `Link`, `dashboard.tsx`, `dashboard-avatar.tsx`, `channel-video-search.tsx`, `Combobox`, `date-picker.tsx`, `Badge`, `Toolbar.tsx`, `profile-page.tsx`, `dictionary-page.tsx`, `radix-ui`, `useVesselWeightStore`, `SettingsPanel.tsx`, `EditorSettingsDialog.tsx`, `dashboard.service.ts`, `TooltipContent`, `header.tsx`, `useAuth`, `menubar.tsx`, `ShapeNodes.tsx`, `alert-dialog.tsx`, `did-you-know-page.tsx`, `AdminDashboard.tsx`, `aparat-client.tsx`, `sitemap-client.tsx`, `carousel.tsx`, `chart.tsx`, `commodities-widget.tsx`, `slide-settings-drawer.tsx`, `stat-card.tsx`, `drawer.tsx`, `search-results-client.tsx`, `input-otp.tsx`, `input-group.tsx`, `pagination.tsx`, `market-control-bar.tsx`, `settings-section.tsx`, `alert.tsx`, `channelstats.tsx`?**
  _High betweenness centrality (0.166) - this node is a cross-community bridge._
- **Should `VesselNodeBase.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06056701030927835 - nodes in this community are weakly interconnected._
- **Why does `next` connect `login/page.tsx` to `exchange-rates/route.ts`, `task-detail-view.tsx`, `package.json`, `next.config.ts`, `[...path]/route.ts`, `esp-flow/components/DiagramCanvas.tsx`, `Link`, `channel-video-search.tsx`, `date-picker.tsx`, `Badge`, `team-client.tsx`, `profile-page.tsx`, `MarketQuote`, `dictionary-page.tsx`, `[locale]/layout.tsx`, `useVesselWeightStore`, `refactor_admin.js`, `did-you-know-page.tsx`, `search-results-client.tsx`, `chart/route.ts`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.040293040293040296 - nodes in this community are weakly interconnected._