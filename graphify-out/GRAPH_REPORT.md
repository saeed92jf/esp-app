# Graph Report - esp-app  (2026-10-06)

## Corpus Check
- Large corpus: 467 files · ~506,730 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 2393 nodes · 6625 edges · 141 communities (121 shown, 20 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 45 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 117
- Community 118
- Community 119
- Community 120
- Community 121
- Community 122
- Community 123
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128
- Community 130
- Community 131
- Community 132
- Community 133
- Community 134
- Community 135

## God Nodes (most connected - your core abstractions)
1. `cn()` - 386 edges
2. `react` - 196 edges
3. `lucide-react` - 134 edges
4. `Button()` - 122 edges
5. `next-intl` - 110 edges
6. `useDiagramStore` - 74 edges
7. `Input` - 71 edges
8. `@xyflow/react` - 51 edges
9. `Combobox()` - 51 edges
10. `Link` - 46 edges

## Surprising Connections (you probably didn't know these)
- `run()` --calls--> `npm`  [INFERRED]
  public/docs/myFunc.ps1 → package.json
- `runall()` --calls--> `npm`  [INFERRED]
  public/docs/myFunc.ps1 → package.json
- `TaggedVideo` --inherits--> `VideoListItem`  [EXTRACTED]
  src/app/[locale]/aparat/aparat-client.tsx → src/types/index.ts
- `AlertDialogMedia()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts
- `AlertTitle()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (141 total, 20 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (75): dependencies, @auth/core, axios, @base-ui/react, bcryptjs, class-variance-authority, clsx, cmdk (+67 more)

### Community 1 - "Community 1"
Cohesion: 0.03
Nodes (65): author, axios, xlsx, keywords, license, name, private, version (+57 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (31): next-themes, Page(), Props, AppsPopover(), HelpPopover(), IconGradients(), LocaleSwitcher(), Popover() (+23 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (37): next, @radix-ui/react-label, react-hook-form, ForgotPasswordPage(), LoginPage(), RegisterPage(), ResetPasswordContent(), ResetPasswordPage() (+29 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (39): input-otp, Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator() (+31 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (49): BEAM_SHAPE_LABELS, CircleNode(), CloudNode(), CORNER_OFFSET_STYLE, CylinderNode(), DEFAULT_CHART_ROWS, DEFAULT_EXCEL_ROWS, DEFAULT_MATRIX_ROWS (+41 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (43): FlowPage(), metadata, clampPosition(), ContextMenu(), ContextMenuState, QuickAddItem, safeT(), absolutePosition() (+35 more)

### Community 7 - "Community 7"
Cohesion: 0.16
Nodes (40): Checkbox(), Input, AttachmentsNode, createNewAttachment(), DiagramNode, Props, HeadNode, DiagramNode (+32 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (28): lucide-react, motion, next-intl, GoogleAddShortcutTileProps, SearchPopupProps, Skeleton(), ChannelInfoBarProps, ChannelStats() (+20 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (37): Combobox(), PhoneInput(), PhoneInputProps, Tooltip(), TooltipContent(), TooltipProvider(), TooltipTrigger(), applyMask() (+29 more)

### Community 10 - "Community 10"
Cohesion: 0.07
Nodes (37): Separator(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetPortal() (+29 more)

### Community 11 - "Community 11"
Cohesion: 0.14
Nodes (35): CustomEdge(), DEFAULT_SETTINGS, DiagramStore, nodeSize(), sortNodesParentFirst(), useDiagramStore, ArithmeticOperation, DiagramEdgeData (+27 more)

### Community 12 - "Community 12"
Cohesion: 0.05
Nodes (36): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+28 more)

### Community 13 - "Community 13"
Cohesion: 0.09
Nodes (30): date-fns-jalali, CalendarContent(), CalendarContentProps, DatePicker(), DatePickerProps, getGregorianDaysInMonth(), getJalaliDate(), getJalaliDaysInMonth() (+22 more)

### Community 14 - "Community 14"
Cohesion: 0.12
Nodes (27): CATEGORIES, CommoditiesWidget(), formatLargeIrr(), formatPrice(), UNITS, DashboardSettingsModalProps, CountdownTimer(), getRateModes() (+19 more)

### Community 15 - "Community 15"
Cohesion: 0.14
Nodes (17): react, metadata, VesselWeightPage(), DiagramCanvas(), getId(), nodeTypes, MTOPanel(), InternalsNode (+9 more)

### Community 16 - "Community 16"
Cohesion: 0.08
Nodes (29): @xyflow/react, ShapeCanvasProps, GeneralDataNodeData, JacketNodeData, MaterialListNodeData, createNewNozzle(), DiagramNode, FLANGE_CLASSES (+21 more)

### Community 17 - "Community 17"
Cohesion: 0.06
Nodes (20): code, fs, fs, fs, content, fs, content, fs (+12 more)

### Community 18 - "Community 18"
Cohesion: 0.12
Nodes (23): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+15 more)

### Community 19 - "Community 19"
Cohesion: 0.09
Nodes (28): createDefaultHead(), DiagramNode, HEAD_TYPES, MATERIALS, NPS_OPTIONS, POSITIONS, Props, RT_OPTIONS (+20 more)

### Community 20 - "Community 20"
Cohesion: 0.08
Nodes (20): TeamPage(), BINARY_BG, CARD_MAX_HEIGHT, cardMaxWidth(), containerVariants, contentTeam, engineeringTeam, GitHubIcon() (+12 more)

### Community 21 - "Community 21"
Cohesion: 0.09
Nodes (23): zod, AggregateInput, Material, MATERIAL_DENSITY, MaterialSchema, NodePositionSchema, UnitSystem, UnitSystemSchema (+15 more)

### Community 22 - "Community 22"
Cohesion: 0.11
Nodes (14): AparatContext, AparatProvider(), AparatProviderProps, sample(), useAparatChannel(), UseAparatChannelResult, VideoCardProps, IAparatService (+6 more)

### Community 23 - "Community 23"
Cohesion: 0.10
Nodes (19): ROLE_HOME, DEMO_USERS, LoginPayload, RegisterPayload, UseDashboardResult, ActivityItem, ChecklistItem, DashboardData (+11 more)

### Community 24 - "Community 24"
Cohesion: 0.16
Nodes (14): dynamic, fetchCache, GET(), MARKET_SYMBOLS, MarketController, MarketHistory, MarketQuote, MarketSymbol (+6 more)

### Community 25 - "Community 25"
Cohesion: 0.11
Nodes (16): LocaleNotFound(), PrivacyPage(), TermsPage(), QuickAccessCard(), QuickAccessCardProps, NotFoundPage(), LOCALES, getPathname (+8 more)

### Community 26 - "Community 26"
Cohesion: 0.15
Nodes (20): @phosphor-icons/react, GoogleAddShortcutTile(), GoogleShortcutModal(), GoogleShortcutModalProps, QuickAccessCustomizer(), QuickAccessCustomizerProps, fadeUp, QuickAccessSection() (+12 more)

### Community 27 - "Community 27"
Cohesion: 0.12
Nodes (22): @react-three/drei, @react-three/fiber, three, buildInitialEdges(), buildNodes(), FlowInner(), HeroFlowNodeData, nodeTypes (+14 more)

### Community 28 - "Community 28"
Cohesion: 0.11
Nodes (24): ToggleGroup(), DEL_BTN, DUPE_BTN, EDGE_TYPE_OPTIONS, EdgeColorTokenRow(), Field(), LABEL_SYMBOLS, NodeColorTokenRow() (+16 more)

### Community 29 - "Community 29"
Cohesion: 0.16
Nodes (18): AdminDashboard(), AdminHeatmapModules(), AdminHeatmapModulesProps, AdminProfileStats(), AdminProfileStatsProps, AdminSidebar(), AdminSidebarProps, AdminTasksTime() (+10 more)

### Community 30 - "Community 30"
Cohesion: 0.11
Nodes (18): ExchangeRates, FakeExchangeRatesService, IExchangeRatesService, RealExchangeRatesService, ApiErrorResponse, ApiResponse, ApiResult, DateRangeParams (+10 more)

### Community 31 - "Community 31"
Cohesion: 0.15
Nodes (23): calcAttachmentWeight(), calcInsulationSupportWeight(), calcLiftingLugWeight(), calcNamePlateWeight(), calcTurningLugWeight(), getDensity(), AttachmentsNode, createNewAttachment() (+15 more)

### Community 32 - "Community 32"
Cohesion: 0.09
Nodes (24): CategoryTabsProps, ChannelHeaderProps, ChannelInfo, ChannelProfile, ChannelResponse, ChannelStatsProps, LiveStream, PlaylistProps (+16 more)

### Community 33 - "Community 33"
Cohesion: 0.13
Nodes (20): cmdk, COMBOBOX_SEARCH_THRESHOLD, ComboboxOption, ComboboxProps, Command(), CommandEmpty(), CommandGroup(), CommandInput() (+12 more)

### Community 34 - "Community 34"
Cohesion: 0.13
Nodes (19): react-day-picker, ThemeToggle(), Button(), buttonVariants, Calendar(), CalendarDayButton(), GeneralData, COMMON_CRITERIA_OPTIONS (+11 more)

### Community 35 - "Community 35"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 36 - "Community 36"
Cohesion: 0.13
Nodes (12): class-variance-authority, radix-ui, Badge(), badgeVariants, HoverCardContent(), Progress(), ScrollArea(), ScrollBar() (+4 more)

### Community 37 - "Community 37"
Cohesion: 0.26
Nodes (15): GoogleShortcutTile(), SideMenu(), Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), APP_ICON_DEFAULT_WEIGHT, AppIcon() (+7 more)

### Community 38 - "Community 38"
Cohesion: 0.21
Nodes (13): AparatService, decodeEntities(), endpointFromAparatUrl(), isAbortError(), isTransient(), normalizeVideo(), pickKey(), pickNextPageUrl() (+5 more)

### Community 39 - "Community 39"
Cohesion: 0.14
Nodes (4): HttpClient, RealNavigationService, RealPreferencesService, RealUserService

### Community 40 - "Community 40"
Cohesion: 0.20
Nodes (15): @radix-ui/react-tabs, ChannelHeader(), ChannelHeaderProps, ChannelVideoSearch(), ChannelVideoSearchProps, SlidingTabItem, SlidingTabs(), SlidingTabsProps (+7 more)

### Community 41 - "Community 41"
Cohesion: 0.22
Nodes (16): zustand, CommandDialog(), Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay() (+8 more)

### Community 42 - "Community 42"
Cohesion: 0.19
Nodes (15): GoogleShortcutTileProps, GoogleSearchBox(), GoogleSearchBoxProps, highlightText(), NavSearchResult(), SiteSearch(), NavColor, useRemoteSearch() (+7 more)

### Community 43 - "Community 43"
Cohesion: 0.16
Nodes (14): StatCard(), StatsSection(), StatsSectionProps, STATS, useCountUp(), UseCountUpOptions, useInView(), UseInViewOptions (+6 more)

### Community 44 - "Community 44"
Cohesion: 0.19
Nodes (16): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), Collapsible(), CollapsibleContent() (+8 more)

### Community 45 - "Community 45"
Cohesion: 0.16
Nodes (18): calcDemisterWeight(), calculateCircularSegments(), circleHalfArea(), getDensity(), YORK_DENSITIES, createNewDemister(), DemisterDrawing(), MistEliminatorNode (+10 more)

### Community 46 - "Community 46"
Cohesion: 0.18
Nodes (12): LocaleLayout(), generateMetadata(), viewport, PremiumGuard(), ConditionalFooter(), HIDDEN_PREFIXES, ConditionalHeader(), HIDDEN_PREFIXES (+4 more)

### Community 47 - "Community 47"
Cohesion: 0.15
Nodes (17): calcAnnularRingWeight(), calcCylinderWeight(), calcLegColumnWeight(), calcRectPlateWeight(), SupportNode, LegData, LegSchema, LugData (+9 more)

### Community 48 - "Community 48"
Cohesion: 0.11
Nodes (12): adminDashboardPath, adminDir, content, fs, path, fs, path, srcDir (+4 more)

### Community 49 - "Community 49"
Cohesion: 0.18
Nodes (11): @tanstack/react-query, FakeProfileService, MOCK_PROFILE, profileService, ProfileService, EducationInfo, InsuranceInfo, OrganizationalInfo (+3 more)

### Community 50 - "Community 50"
Cohesion: 0.18
Nodes (16): HomePage(), Container(), ContainerProps, ContainerSize, containerSizeClasses, FullWidth(), FullWidthProps, fadeUp (+8 more)

### Community 51 - "Community 51"
Cohesion: 0.16
Nodes (9): AuthState, LoginResult, AUTH_USER_KEY, ChangePasswordPayload, FakeUserService, IUserService, UpdateProfilePayload, wait() (+1 more)

### Community 52 - "Community 52"
Cohesion: 0.18
Nodes (18): BeamCalcNode(), ConstantNode(), formatCalcResult(), GeometryCalcNode(), NumberField(), NumberNode(), OperatorNode(), safeT() (+10 more)

### Community 53 - "Community 53"
Cohesion: 0.17
Nodes (13): NPS, PipeDimensions, PipeSchedule, calcCylindricalShellWeight(), calcShellRawWeight(), makeCourse(), ShellNode, ShellCourse (+5 more)

### Community 54 - "Community 54"
Cohesion: 0.11
Nodes (18): devDependencies, eslint, eslint-config-next, eslint-config-prettier, eslint-plugin-react, eslint-plugin-react-hooks, prettier, prettier-plugin-tailwindcss (+10 more)

### Community 56 - "Community 56"
Cohesion: 0.23
Nodes (15): ChartNode(), CornerResizer(), ExcelNode(), FreeConnectHandles(), GroupNode(), MatrixNode(), TableNode(), tabularGridOf() (+7 more)

### Community 57 - "Community 57"
Cohesion: 0.20
Nodes (15): calcElliptical21HeadWeight(), calcHeadBlankWeight(), calcHemisphericalHeadWeight(), calcTorishericalHeadWeight(), HeadCalcResult, HeadNode, makeHead(), Head (+7 more)

### Community 58 - "Community 58"
Cohesion: 0.26
Nodes (13): @tanstack/react-virtual, Playlist(), VideoCard(), VideoPlayer(), PlaylistProps, formatDuration(), formatRelativeTime(), formatViews() (+5 more)

### Community 59 - "Community 59"
Cohesion: 0.12
Nodes (16): author, dependencies, axios, cheerio, xlsx, description, axios, xlsx (+8 more)

### Community 60 - "Community 60"
Cohesion: 0.12
Nodes (12): Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarPortal(), MenubarRadioItem(), MenubarSeparator() (+4 more)

### Community 61 - "Community 61"
Cohesion: 0.18
Nodes (11): dagre, SitemapPage(), NAV_COLOR_MAP, FlowInner(), getDoubleSidedLayout(), LayoutDirection, nodeTypes, SitemapClient() (+3 more)

### Community 62 - "Community 62"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext() (+6 more)

### Community 63 - "Community 63"
Cohesion: 0.16
Nodes (5): AparatClient(), AparatClientProps, TaggedVideo, AparatPage(), ChannelInfoBar()

### Community 64 - "Community 64"
Cohesion: 0.30
Nodes (12): GlobalConfirmModal(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader() (+4 more)

### Community 65 - "Community 65"
Cohesion: 0.17
Nodes (7): NAV_SEARCH_SOURCE, FakeSearchService, ISearchService, RealSearchService, SearchPayload, SearchResponse, SearchResult

### Community 66 - "Community 66"
Cohesion: 0.16
Nodes (13): BaseNodeShell(), BaseNodeShellProps, DefaultNode(), FONT_WEIGHT_MAP, getNodeStyle(), FLOW_HANDLE_CIRCLE, FLOW_HANDLE_CLASS, FLOW_HANDLE_DIAMOND (+5 more)

### Community 67 - "Community 67"
Cohesion: 0.20
Nodes (13): recharts, ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartStyle(), ChartTooltipContent() (+5 more)

### Community 68 - "Community 68"
Cohesion: 0.31
Nodes (11): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), EditorSettingsDialog(), Row(), safeT() (+3 more)

### Community 69 - "Community 69"
Cohesion: 0.25
Nodes (11): calcNozzleWeight(), getDensity(), AccordionItem(), createNewNozzle(), NozzleDrawing(), NozzleNode, BaseNodeDataSchema, Nozzle (+3 more)

### Community 70 - "Community 70"
Cohesion: 0.18
Nodes (9): fs, https, postRequest(), run(), fs, https, get(), https (+1 more)

### Community 71 - "Community 71"
Cohesion: 0.26
Nodes (7): RootLayout(), useRelativeTime(), QueryProvider(), ThemeProvider(), TimeContext, TimeProvider(), useNow()

### Community 72 - "Community 72"
Cohesion: 0.26
Nodes (10): MODE_OPTIONS, SettingsSection(), THEME_OPTIONS, DEFAULT_PRIMARY_COLOR, PRIMARY_COLORS, PrimaryColorId, PrimaryColorPreset, ALL_COLOR_CLASSES (+2 more)

### Community 73 - "Community 73"
Cohesion: 0.18
Nodes (6): FALLBACK, FAKE_STATS, FakeStatsService, IStatsService, RealStatsService, StatItem

### Community 74 - "Community 74"
Cohesion: 0.26
Nodes (10): engines, node, npm, Get-DevServerUrl(), gp(), op(), run(), runall() (+2 more)

### Community 75 - "Community 75"
Cohesion: 0.20
Nodes (8): vaul, DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerPortal(), DrawerTitle()

### Community 76 - "Community 76"
Cohesion: 0.24
Nodes (6): CommodityItem, FAKE_COMMODITIES, FakeCommoditiesService, ICommoditiesService, RealCommoditiesService, wait()

### Community 77 - "Community 77"
Cohesion: 0.31
Nodes (10): ellipsePoints(), getEdgePosition(), getFloatingEdgeParams(), getNodeIntersection(), nodePolygon(), Point, polygonRayIntersection(), raySegmentIntersection() (+2 more)

### Community 78 - "Community 78"
Cohesion: 0.25
Nodes (7): ApiError, ErrorCode, toApiError(), getToken(), isRetryable(), sleep(), AUTH_TOKEN_KEY

### Community 79 - "Community 79"
Cohesion: 0.20
Nodes (10): scripts, build, clean, dev, dev:local, dev:network, dev:network:hmr, lint (+2 more)

### Community 80 - "Community 80"
Cohesion: 0.22
Nodes (7): cheerio, cheerio, fs, persianToEnglishDigits(), scrapeHolidays(), cheerio, fs

### Community 81 - "Community 81"
Cohesion: 0.24
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger(), navigationMenuTriggerStyle (+1 more)

### Community 83 - "Community 83"
Cohesion: 0.22
Nodes (9): CONSTRAINED_DEFAULT, DEFAULT_LAYOUTS, DEFAULT_VISIBILITY, enforceConstraints(), Layout, Layouts, MIN_SIZES, useDashboardLayout() (+1 more)

### Community 84 - "Community 84"
Cohesion: 0.28
Nodes (7): axios, cheerio, fs, getHolidays(), monthMap, parseIranfair(), run()

### Community 85 - "Community 85"
Cohesion: 0.22
Nodes (8): arrayStart, enObj, faObj, fs, newEvents, parsed, path, serviceContent

### Community 86 - "Community 86"
Cohesion: 0.33
Nodes (7): PersianDigitsProvider(), PersianDigitsProviderProps, abbreviationMap, convertTextNode(), englishToPersianMap, shouldProcessNode(), usePersianDigits()

### Community 87 - "Community 87"
Cohesion: 0.28
Nodes (7): Pagination(), PaginationContent(), PaginationEllipsis(), PaginationLink(), PaginationLinkProps, PaginationNext(), PaginationPrevious()

### Community 88 - "Community 88"
Cohesion: 0.28
Nodes (4): DEFAULT_PREFS, FakePreferencesService, IPreferencesService, UserPreferences

### Community 89 - "Community 89"
Cohesion: 0.39
Nodes (5): Slider(), RotateNode, RotateNodeData, ZoomNode, ZoomNodeData

### Community 90 - "Community 90"
Cohesion: 0.29
Nodes (3): FlowState, saveFlowState(), setupAutoSave()

### Community 91 - "Community 91"
Cohesion: 0.29
Nodes (5): data, events, fs, workbook, xlsx

### Community 92 - "Community 92"
Cohesion: 0.48
Nodes (3): AdminPage(), HomePage(), AuthGate()

### Community 93 - "Community 93"
Cohesion: 0.29
Nodes (6): enContent, faContent, fs, path, serviceContent, widgetContent

### Community 94 - "Community 94"
Cohesion: 0.33
Nodes (3): eslintConfig, eslint-config-prettier, eslint-plugin-react-hooks

### Community 95 - "Community 95"
Cohesion: 0.33
Nodes (5): events, fs, lines, monthMap, ocr

### Community 96 - "Community 96"
Cohesion: 0.33
Nodes (5): events, fs, lines, monthMap, ocr

### Community 97 - "Community 97"
Cohesion: 0.47
Nodes (4): SearchPopup(), GenericSearchBox(), GenericSearchBoxProps, useSearchHistory()

### Community 98 - "Community 98"
Cohesion: 0.40
Nodes (5): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants

### Community 99 - "Community 99"
Cohesion: 0.53
Nodes (5): getShapeGeometry(), roundedRect(), SHAPE_DEFAULT_SIZE, ShapeGeometry, stadium()

### Community 100 - "Community 100"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 101 - "Community 101"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 102 - "Community 102"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 103 - "Community 103"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 104 - "Community 104"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, en, fa, fs

### Community 105 - "Community 105"
Cohesion: 0.40
Nodes (4): code, fs, matchFair, matchHol

### Community 106 - "Community 106"
Cohesion: 0.40
Nodes (3): react-resizable-panels, ResizableHandle(), ResizablePanelGroup()

### Community 107 - "Community 107"
Cohesion: 0.40
Nodes (3): code, events, fs

### Community 108 - "Community 108"
Cohesion: 0.40
Nodes (3): enProfile, faProfile, fs

### Community 109 - "Community 109"
Cohesion: 0.40
Nodes (4): endIdx, fs, lines, startIdx

### Community 110 - "Community 110"
Cohesion: 0.40
Nodes (3): CRYPTO_SYMBOL, SYMBOL_MAP, YH_HEADERS

### Community 111 - "Community 111"
Cohesion: 0.70
Nodes (4): HDim(), ShapeSchematic(), VDim(), Wrap()

### Community 112 - "Community 112"
Cohesion: 0.40
Nodes (4): MATH_CONSTANT_BY_KEY, MATH_CONSTANT_OPTIONS, MATH_CONSTANTS, MathConstant

### Community 113 - "Community 113"
Cohesion: 0.50
Nodes (3): enData, faData, fs

### Community 114 - "Community 114"
Cohesion: 0.50
Nodes (3): fs, html, urls

### Community 116 - "Community 116"
Cohesion: 0.50
Nodes (3): HEADER_HEIGHT, MAX_CONTENT_WIDTH, SIDEBAR_WIDTH

### Community 117 - "Community 117"
Cohesion: 0.50
Nodes (3): FLANGE_WEIGHTS, FlangeClass, FlangeType

### Community 118 - "Community 118"
Cohesion: 0.50
Nodes (3): PIPE_DIMENSIONS, PipeNPS, PipeSchedule

### Community 119 - "Community 119"
Cohesion: 0.50
Nodes (3): enData, faData, fs

### Community 120 - "Community 120"
Cohesion: 0.50
Nodes (3): en, fa, fs

### Community 121 - "Community 121"
Cohesion: 0.50
Nodes (3): calContent, checkContent, fs

### Community 123 - "Community 123"
Cohesion: 0.67
Nodes (3): browserslist, development, production

### Community 124 - "Community 124"
Cohesion: 0.67
Nodes (3): repository, type, url

## Knowledge Gaps
- **766 isolated node(s):** `fs`, `code`, `$schema`, `style`, `rsc` (+761 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 922 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Community 15` to `Community 128`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 13`, `Community 14`, `Community 16`, `Community 18`, `Community 19`, `Community 20`, `Community 22`, `Community 23`, `Community 25`, `Community 26`, `Community 27`, `Community 28`, `Community 29`, `Community 31`, `Community 32`, `Community 33`, `Community 34`, `Community 36`, `Community 37`, `Community 40`, `Community 41`, `Community 42`, `Community 43`, `Community 44`, `Community 45`, `Community 46`, `Community 47`, `Community 50`, `Community 53`, `Community 57`, `Community 58`, `Community 60`, `Community 61`, `Community 62`, `Community 63`, `Community 64`, `Community 66`, `Community 67`, `Community 68`, `Community 69`, `Community 71`, `Community 72`, `Community 73`, `Community 75`, `Community 81`, `Community 83`, `Community 86`, `Community 87`, `Community 89`, `Community 92`, `Community 97`, `Community 98`, `Community 111`?**
  _High betweenness centrality (0.180) - this node is a cross-community bridge._
- **What connects `fs`, `code`, `$schema` to the rest of the system?**
  _766 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.02666666666666667 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `Community 4` to `Community 2`, `Community 3`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 18`, `Community 19`, `Community 25`, `Community 26`, `Community 28`, `Community 33`, `Community 34`, `Community 36`, `Community 37`, `Community 40`, `Community 41`, `Community 42`, `Community 44`, `Community 50`, `Community 52`, `Community 56`, `Community 58`, `Community 60`, `Community 61`, `Community 62`, `Community 63`, `Community 64`, `Community 66`, `Community 67`, `Community 68`, `Community 72`, `Community 75`, `Community 81`, `Community 87`, `Community 89`, `Community 97`, `Community 98`, `Community 106`?**
  _High betweenness centrality (0.175) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.030303030303030304 - nodes in this community are weakly interconnected._
- **Why does `next` connect `Community 3` to `Community 1`, `Community 2`, `Community 58`, `Community 6`, `Community 44`, `Community 110`, `Community 46`, `Community 48`, `Community 15`, `Community 115`, `Community 20`, `Community 24`, `Community 122`, `Community 127`?**
  _High betweenness centrality (0.169) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07796610169491526 - nodes in this community are weakly interconnected._