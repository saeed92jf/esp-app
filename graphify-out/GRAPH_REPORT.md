# Graph Report - esp-app  (2026-10-19)

## Corpus Check
- 478 files · ~678,176 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 117 file(s) not represented in the graph (top: .woff2 69, .css 16, .woff 13)

## Summary
- 2681 nodes · 7834 edges · 149 communities (128 shown, 21 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 49 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `50673497`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- VesselNodeBase.tsx
- package.json
- side-menu.tsx
- BaseNode.tsx
- profile.ts
- store/index.ts
- dashboard.service.ts
- ShapeNodes.tsx
- cn
- sidebar.tsx
- next
- paths
- Toolbar.tsx
- dropdown-menu.tsx
- base.schema.ts
- ref_fs
- SettingsPanel.tsx
- multi-button.tsx
- Button
- commodities-widget.tsx
- vessel/HeadNode.tsx
- date-picker.tsx
- team-client.tsx
- engineering-dictionary.tsx
- EditorSettingsDialog.tsx
- VideoListItem
- did-you-know-section.tsx
- services/index.ts
- MarketQuote
- search/services/search.service.ts
- playlist.tsx
- test-scheduler.ts
- useVesselWeightStore
- dashboard-control-hub-modal.tsx
- esp-flow/components/DiagramCanvas.tsx
- ProjectDataNode.tsx
- vessel/AttachmentsNode.tsx
- src/types/index.ts
- radix-ui
- useDiagramStore
- search-results-client.tsx
- components.json
- register/page.tsx
- [locale]/layout.tsx
- stats-section.tsx
- aparat.service.ts
- login/page.tsx
- AdminDashboard.tsx
- mistEliminator.schema.ts
- devDependencies
- profile-page.tsx
- config/navigation.ts
- support.schema.ts
- react
- refactor_admin.js
- notifications-popover.tsx
- RealAuthService
- input-group.tsx
- calendar.tsx
- HttpClient
- Combobox
- scratch/package.json
- home-client.tsx
- menubar.tsx
- types/auth.ts
- user.service.ts
- scripts
- nav-search-result.tsx
- alert-dialog.tsx
- aparat-client.tsx
- DiagramEditor.tsx
- Link
- auth.service.ts
- dashboard-avatar.tsx
- NodePalette.tsx
- sitemap-client.tsx
- chart.tsx
- GoogleShortcutTile.tsx
- carousel.tsx
- daily-routines-widget.tsx
- fetch_events.js
- input-otp.tsx
- nodes/NozzleNode.tsx
- preferences.service.ts
- myFunc.ps1
- drawer.tsx
- app/layout.tsx
- modal-shell.tsx
- commodities.service.ts
- CustomEdge.tsx
- fetch_bahesab.js
- navigation-menu.tsx
- FakeAuthService
- src/services/search.service.ts
- scraper.js
- inject_fairs.js
- pagination.tsx
- routing.ts
- flowStorage.ts
- channel-video-search.tsx
- slide-settings-drawer.tsx
- Getting Started
- stats.service.ts
- parse_excel.js
- update-remove-birthday.js
- eslint.config.mjs
- parse-pdf.js
- container.tsx
- parse_pdf_to_js.js
- colors.ts
- update-admin-translations.js
- update-admin-translations2.js
- update-admin-translations3.js
- update-admin-translations4.js
- update-translations.js
- fix_types.js
- replace.js
- scratch_translations.js
- remove-icons.js
- textDirection.ts
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
- channelstats.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 464 edges
2. `react` - 232 edges
3. `lucide-react` - 159 edges
4. `Button()` - 155 edges
5. `next-intl` - 143 edges
6. `Input` - 89 edges
7. `useDiagramStore` - 74 edges
8. `Link` - 60 edges
9. `Combobox()` - 54 edges
10. `@xyflow/react` - 51 edges

## Surprising Connections (you probably didn't know these)
- `run()` --calls--> `npm`  [INFERRED]
  public/docs/myFunc.ps1 → package.json
- `runall()` --calls--> `npm`  [INFERRED]
  public/docs/myFunc.ps1 → package.json
- `TaggedVideo` --inherits--> `VideoListItem`  [EXTRACTED]
  src/app/[locale]/aparat/aparat-client.tsx → src/types/index.ts
- `FullWidth()` --calls--> `cn()`  [EXTRACTED]
  src/components/layout/container.tsx → src/lib/utils.ts
- `AlertDialogMedia()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (149 total, 21 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.03
Nodes (77): dependencies, @auth/core, axios, @base-ui/react, bcryptjs, class-variance-authority, clsx, cmdk (+69 more)

### Community 1 - "VesselNodeBase.tsx"
Cohesion: 0.08
Nodes (69): @xyflow/react, Checkbox(), AttachmentsNode, GeneralDataNode, HeadNode, DiagramNode, InternalsNode, Props (+61 more)

### Community 2 - "package.json"
Cohesion: 0.03
Nodes (67): author, axios, xlsx, keywords, license, name, private, version (+59 more)

### Community 3 - "side-menu.tsx"
Cohesion: 0.38
Nodes (8): zustand, SideMenuContent(), SideMenu(), AnimatedHamburger(), usePathname, HomeSidebar(), HomeSidebarState, useHomeSidebar

### Community 4 - "BaseNode.tsx"
Cohesion: 0.05
Nodes (61): BEAM_SHAPE_LABELS, CircleNode(), CloudNode(), CORNER_OFFSET_STYLE, CylinderNode(), DEFAULT_CHART_ROWS, DEFAULT_EXCEL_ROWS, DEFAULT_MATRIX_ROWS (+53 more)

### Community 5 - "profile.ts"
Cohesion: 0.16
Nodes (12): @tanstack/react-query, useProfile(), FakeProfileService, MOCK_PROFILE, profileService, ProfileService, EducationInfo, InsuranceInfo (+4 more)

### Community 6 - "store/index.ts"
Cohesion: 0.13
Nodes (35): ShapeCanvasProps, JacketNodeData, RegenVacuumSteamoutNodeData, DEFAULT_SETTINGS, DiagramStore, ArithmeticOperation, DiagramEdgeData, DiagramEdgeType (+27 more)

### Community 7 - "dashboard.service.ts"
Cohesion: 0.09
Nodes (27): STATUS_CONFIG, DashboardHeaderProps, DailyNotificationsModal(), DailyNotificationsModalProps, NotificationsPopoverProps, ManagerEmailModal(), ManagerEmailModalProps, TaskDetailModalProps (+19 more)

### Community 8 - "ShapeNodes.tsx"
Cohesion: 0.14
Nodes (15): BaseNodeShell(), BaseNodeShellProps, DefaultNode(), FONT_WEIGHT_MAP, getNodeStyle(), VesselHandles(), VesselHandlesProps, FLOW_HANDLE_CIRCLE (+7 more)

### Community 9 - "cn"
Cohesion: 0.07
Nodes (36): react-resizable-panels, Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants, AvatarGroup(), AvatarGroupCount() (+28 more)

### Community 10 - "sidebar.tsx"
Cohesion: 0.07
Nodes (38): Separator(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetPortal() (+30 more)

### Community 11 - "next"
Cohesion: 0.10
Nodes (10): nextConfig, withNextIntl, next, GET(), revalidateSeconds(), CRYPTO_SYMBOL, SYMBOL_MAP, YH_HEADERS (+2 more)

### Community 12 - "paths"
Cohesion: 0.05
Nodes (36): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+28 more)

### Community 13 - "Toolbar.tsx"
Cohesion: 0.20
Nodes (14): elkjs, html-to-image, ComboboxOption, DropdownMenuSeparator(), Divider(), safeT(), Toolbar(), ToolbarButton() (+6 more)

### Community 14 - "dropdown-menu.tsx"
Cohesion: 0.16
Nodes (14): AvatarBadge(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem() (+6 more)

### Community 15 - "base.schema.ts"
Cohesion: 0.09
Nodes (23): zod, AggregateInput, Material, MATERIAL_DENSITY, MaterialSchema, NodePositionSchema, UnitSystem, UnitSystemSchema (+15 more)

### Community 16 - "ref_fs"
Cohesion: 0.06
Nodes (20): code, fs, fs, fs, content, fs, content, fs (+12 more)

### Community 17 - "SettingsPanel.tsx"
Cohesion: 0.14
Nodes (21): class-variance-authority, ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants, DEL_BTN, DUPE_BTN (+13 more)

### Community 18 - "multi-button.tsx"
Cohesion: 0.16
Nodes (14): CompactMultiButton, CompactMultiButtonProps, actionDefinitions, MultiButtonDemo(), MultiButton, MultiButtonGroupContext, MultiButtonGroupContextValue, MultiButtonGroupProps (+6 more)

### Community 19 - "Button"
Cohesion: 0.17
Nodes (32): ForgotPasswordPage(), GoogleShortcutModal(), ThemeToggle(), Button(), DatePicker(), Input, AdminUsersTable(), ActivityFeed() (+24 more)

### Community 20 - "commodities-widget.tsx"
Cohesion: 0.12
Nodes (26): CATEGORIES, formatLargeIrr(), formatPrice(), UNITS, CountdownTimer(), getRateModes(), MarketControlBar(), MarketControlBarProps (+18 more)

### Community 21 - "vessel/HeadNode.tsx"
Cohesion: 0.08
Nodes (43): createDefaultHead(), DiagramNode, HEAD_TYPES, MATERIALS, NPS_OPTIONS, POSITIONS, Props, RT_OPTIONS (+35 more)

### Community 22 - "date-picker.tsx"
Cohesion: 0.10
Nodes (25): date-fns-jalali, CalendarContent(), CalendarContentProps, DatePickerProps, getGregorianDaysInMonth(), getJalaliDate(), getJalaliDaysInMonth(), GREGORIAN_MONTHS_EN (+17 more)

### Community 23 - "team-client.tsx"
Cohesion: 0.08
Nodes (20): TeamPage(), BINARY_BG, CARD_MAX_HEIGHT, cardMaxWidth(), containerVariants, contentTeam, engineeringTeam, GitHubIcon() (+12 more)

### Community 24 - "engineering-dictionary.tsx"
Cohesion: 0.12
Nodes (33): Page(), Props, AiModeIcon(), GenericSearchBox(), GenericSearchBoxProps, buildBilingualPattern(), escapeRegExp(), HighlightMatch() (+25 more)

### Community 25 - "EditorSettingsDialog.tsx"
Cohesion: 0.06
Nodes (60): @react-three/drei, @react-three/fiber, three, Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), CommandDialog() (+52 more)

### Community 26 - "VideoListItem"
Cohesion: 0.13
Nodes (13): AparatContext, AparatProvider(), AparatProviderProps, sample(), useAparatChannel(), UseAparatChannelResult, VideoCardProps, IAparatService (+5 more)

### Community 27 - "did-you-know-section.tsx"
Cohesion: 0.29
Nodes (7): embla-carousel-react, DidYouKnowSectionProps, getDidYouKnowCards(), seededShuffle(), DID_YOU_KNOW_CARDS_EN, DID_YOU_KNOW_CARDS_FA, DidYouKnowCardItem

### Community 28 - "services/index.ts"
Cohesion: 0.10
Nodes (19): ExchangeRates, FakeExchangeRatesService, IExchangeRatesService, RealExchangeRatesService, ApiErrorResponse, ApiResponse, ApiResult, DateRangeParams (+11 more)

### Community 29 - "MarketQuote"
Cohesion: 0.16
Nodes (14): dynamic, fetchCache, GET(), MARKET_SYMBOLS, MarketController, MarketHistory, MarketQuote, MarketSymbol (+6 more)

### Community 30 - "search/services/search.service.ts"
Cohesion: 0.10
Nodes (26): normalizeSearchText(), DictionaryCategoryItem, getDictionaryTerms(), interleaveDictionaryTerms(), DICTIONARY_CATEGORIES_EN, ENGINEERING_TERMS_EN, EnglishDictionaryTerm, DICTIONARY_CATEGORIES_FA (+18 more)

### Community 31 - "playlist.tsx"
Cohesion: 0.22
Nodes (17): Playlist(), VideoCard(), VideoPlayer(), VideoPlayerProps, highlightText(), VideoSearchResult(), PlaylistProps, Profile (+9 more)

### Community 32 - "test-scheduler.ts"
Cohesion: 0.11
Nodes (17): @playwright/test, args, intervalArg, isQuick, isSchedule, isWatch, main(), printHeader() (+9 more)

### Community 33 - "useVesselWeightStore"
Cohesion: 0.18
Nodes (16): metadata, VesselWeightPage(), DiagramCanvas(), getId(), nodeTypes, MTOPanel(), InternalsNode, OutputHubNode (+8 more)

### Community 34 - "dashboard-control-hub-modal.tsx"
Cohesion: 0.16
Nodes (20): DashboardControlHubModalProps, DashboardToolbar(), DashboardToolbarProps, DashboardSchematicStudioModalProps, DashboardSettingsPopoverProps, HiddenWidgetBadge(), DASHBOARD_TABS, DashboardModuleMeta (+12 more)

### Community 35 - "esp-flow/components/DiagramCanvas.tsx"
Cohesion: 0.15
Nodes (21): clampPosition(), ContextMenu(), ContextMenuState, QuickAddItem, safeT(), absolutePosition(), BG_VARIANT_MAP, DiagramCanvas() (+13 more)

### Community 36 - "ProjectDataNode.tsx"
Cohesion: 0.18
Nodes (23): PhoneInput(), PhoneInputProps, applyMask(), cleanRawPhone(), COUNTRIES, Country, getCountryByCode(), toEnglishDigits() (+15 more)

### Community 37 - "vessel/AttachmentsNode.tsx"
Cohesion: 0.14
Nodes (26): createNewAttachment(), DiagramNode, Props, calcAttachmentWeight(), calcInsulationSupportWeight(), calcLiftingLugWeight(), calcNamePlateWeight(), calcTurningLugWeight() (+18 more)

### Community 38 - "src/types/index.ts"
Cohesion: 0.11
Nodes (18): CategoryTabsProps, ChannelHeaderProps, ChannelInfo, ChannelProfile, ChannelResponse, ChannelStatsProps, LiveStream, PlaylistProps (+10 more)

### Community 39 - "radix-ui"
Cohesion: 0.08
Nodes (13): radix-ui, ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut() (+5 more)

### Community 40 - "useDiagramStore"
Cohesion: 0.12
Nodes (37): BeamCalcNode(), ChartNode(), ConstantNode(), CornerResizer(), ExcelNode(), formatCalcResult(), FreeConnectHandles(), GeometryCalcNode() (+29 more)

### Community 41 - "search-results-client.tsx"
Cohesion: 0.25
Nodes (18): SearchPage(), AppHeader(), AppHeaderProps, AppsPopover(), Header(), LocaleSwitcher(), ThemeToggle(), FOOTER_HEIGHT_MOBILE_PX (+10 more)

### Community 42 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 43 - "register/page.tsx"
Cohesion: 0.21
Nodes (22): LoginPage(), RegisterPage(), ResetPasswordContent(), ResetPasswordPage(), VerifyEmailContent(), VerifyEmailPage(), BrandWord(), Logo() (+14 more)

### Community 44 - "[locale]/layout.tsx"
Cohesion: 0.15
Nodes (15): LocaleLayout(), generateMetadata(), viewport, PremiumGuard(), ConditionalHeader(), HIDDEN_PREFIXES, HtmlLangSync(), ScrollToTop() (+7 more)

### Community 45 - "stats-section.tsx"
Cohesion: 0.16
Nodes (14): StatCard(), StatsSection(), StatsSectionProps, STATS, useCountUp(), UseCountUpOptions, useInView(), UseInViewOptions (+6 more)

### Community 46 - "aparat.service.ts"
Cohesion: 0.22
Nodes (13): AparatService, decodeEntities(), endpointFromAparatUrl(), isAbortError(), isTransient(), normalizeVideo(), pickKey(), pickNextPageUrl() (+5 more)

### Community 47 - "login/page.tsx"
Cohesion: 0.17
Nodes (16): @radix-ui/react-label, react-hook-form, FormControl(), FormDescription(), FormField(), FormFieldContext, FormFieldContextValue, FormItem() (+8 more)

### Community 48 - "AdminDashboard.tsx"
Cohesion: 0.10
Nodes (32): AdminPage(), HomePage(), Avatar(), AvatarFallback(), AvatarImage(), Collapsible(), CollapsibleContent(), CollapsibleTrigger() (+24 more)

### Community 49 - "mistEliminator.schema.ts"
Cohesion: 0.16
Nodes (18): calcDemisterWeight(), calculateCircularSegments(), circleHalfArea(), getDensity(), YORK_DENSITIES, createNewDemister(), DemisterDrawing(), MistEliminatorNode (+10 more)

### Community 50 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, eslint, eslint-config-next, eslint-config-prettier, eslint-plugin-react, eslint-plugin-react-hooks, @playwright/test, prettier (+12 more)

### Community 51 - "profile-page.tsx"
Cohesion: 0.10
Nodes (18): next-themes, sonner, MODE_OPTIONS, SettingsSection(), THEME_OPTIONS, DEFAULT_PRIMARY_COLOR, PRIMARY_COLORS, PrimaryColorId (+10 more)

### Community 52 - "config/navigation.ts"
Cohesion: 0.19
Nodes (13): QuickAccessCustomizer(), QuickAccessCustomizerProps, NAV_COLOR_ICON_GRADIENT_MAP, NAV_COLOR_MAP, NavGroup, NAVIGATION, NavItem, PRIMARY_NAV (+5 more)

### Community 53 - "support.schema.ts"
Cohesion: 0.15
Nodes (17): calcAnnularRingWeight(), calcCylinderWeight(), calcLegColumnWeight(), calcRectPlateWeight(), SupportNode, LegData, LegSchema, LugData (+9 more)

### Community 54 - "react"
Cohesion: 0.08
Nodes (27): leaflet, lucide-react, motion, next-intl, react, PrivacyPage(), TermsPage(), GoogleShortcutModalProps (+19 more)

### Community 55 - "refactor_admin.js"
Cohesion: 0.11
Nodes (12): adminDashboardPath, adminDir, content, fs, path, fs, path, srcDir (+4 more)

### Community 56 - "notifications-popover.tsx"
Cohesion: 0.35
Nodes (13): HelpPopover(), Popover(), PopoverAnchor(), PopoverContent(), PopoverTrigger(), ScrollArea(), ScrollBar(), NotificationSegment (+5 more)

### Community 58 - "input-group.tsx"
Cohesion: 0.27
Nodes (8): InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupTextarea(), Textarea(), COLOR_CLASSES, NotesWidgetProps, DashboardNote

### Community 59 - "calendar.tsx"
Cohesion: 0.60
Nodes (4): react-day-picker, buttonVariants, Calendar(), CalendarDayButton()

### Community 60 - "HttpClient"
Cohesion: 0.11
Nodes (6): RealAparatService, getToken(), HttpClient, isRetryable(), sleep(), RealUserService

### Community 61 - "Combobox"
Cohesion: 0.08
Nodes (38): cmdk, Combobox(), COMBOBOX_SEARCH_THRESHOLD, ComboboxProps, Command(), CommandEmpty(), CommandGroup(), CommandInput() (+30 more)

### Community 62 - "scratch/package.json"
Cohesion: 0.12
Nodes (16): author, dependencies, axios, cheerio, xlsx, description, axios, xlsx (+8 more)

### Community 63 - "home-client.tsx"
Cohesion: 0.16
Nodes (16): @phosphor-icons/react, HomePage(), GoogleSearchBox(), GoogleSearchBoxProps, SiteSearch(), Container(), MultiButtonGroup, DidYouKnowSection() (+8 more)

### Community 64 - "menubar.tsx"
Cohesion: 0.12
Nodes (12): Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarPortal(), MenubarRadioItem(), MenubarSeparator() (+4 more)

### Community 65 - "types/auth.ts"
Cohesion: 0.19
Nodes (7): ROLE_HOME, RegisterPayload, FakeDashboardService, IDashboardService, RealDashboardService, AppUser, UserRole

### Community 66 - "user.service.ts"
Cohesion: 0.15
Nodes (9): AuthState, LoginResult, AUTH_USER_KEY, ChangePasswordPayload, FakeUserService, IUserService, UpdateProfilePayload, wait() (+1 more)

### Community 67 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, clean, dev, dev:local, dev:network, dev:network:hmr, lint (+8 more)

### Community 69 - "alert-dialog.tsx"
Cohesion: 0.22
Nodes (15): GlobalConfirmModal(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader() (+7 more)

### Community 70 - "aparat-client.tsx"
Cohesion: 0.16
Nodes (5): AparatClient(), AparatClientProps, TaggedVideo, AparatPage(), ChannelInfoBar()

### Community 71 - "DiagramEditor.tsx"
Cohesion: 0.26
Nodes (10): FlowPage(), metadata, DiagramEditor(), DiagramEditorProps, EditorShell(), safeT(), Toast(), DiagramLibraryDialog() (+2 more)

### Community 72 - "Link"
Cohesion: 0.14
Nodes (18): LocaleNotFound(), PlansPage(), QuickAccessCard(), QuickAccessCardProps, ConditionalFooter(), HIDDEN_PREFIXES, Footer(), NotFoundPage() (+10 more)

### Community 73 - "auth.service.ts"
Cohesion: 0.21
Nodes (10): DEMO_USERS, LoginPayload, CustomDashboardBuilderProps, useDashboard(), UseDashboardResult, DashboardData, ApiError, ErrorCode (+2 more)

### Community 74 - "dashboard-avatar.tsx"
Cohesion: 0.15
Nodes (3): PREDEFINED_AVATARS, STATUSES, UserStatus

### Community 75 - "NodePalette.tsx"
Cohesion: 0.18
Nodes (11): CATEGORIES, CATEGORY_FALLBACKS, CATEGORY_ICONS, ICONS, LABEL_FALLBACKS, NodePalette(), PALETTE_ITEMS, safeT() (+3 more)

### Community 76 - "sitemap-client.tsx"
Cohesion: 0.21
Nodes (10): dagre, SitemapPage(), FlowInner(), getDoubleSidedLayout(), LayoutDirection, nodeTypes, SitemapClient(), SitemapNode (+2 more)

### Community 77 - "chart.tsx"
Cohesion: 0.20
Nodes (13): recharts, ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartStyle(), ChartTooltipContent() (+5 more)

### Community 78 - "GoogleShortcutTile.tsx"
Cohesion: 0.31
Nodes (9): GoogleAddShortcutTile(), GoogleAddShortcutTileProps, GoogleShortcutTile(), QuickAccessSection(), QuickAccessSectionProps, AppIcon(), IconGradients(), resolveNavIconGradient() (+1 more)

### Community 79 - "carousel.tsx"
Cohesion: 0.19
Nodes (13): Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions (+5 more)

### Community 80 - "daily-routines-widget.tsx"
Cohesion: 0.15
Nodes (13): COLOR_CONFIG, DailyRoutinesWidgetProps, DEFAULT_ROUTINES, GREGORIAN_MONTHS_EN, GREGORIAN_MONTHS_FA, JALALI_MONTHS_EN, JALALI_MONTHS_FA, RoutineColor (+5 more)

### Community 81 - "fetch_events.js"
Cohesion: 0.18
Nodes (9): fs, https, postRequest(), run(), fs, https, get(), https (+1 more)

### Community 82 - "input-otp.tsx"
Cohesion: 0.33
Nodes (4): input-otp, InputOTP(), InputOTPGroup(), InputOTPSlot()

### Community 83 - "nodes/NozzleNode.tsx"
Cohesion: 0.25
Nodes (11): calcNozzleWeight(), getDensity(), AccordionItem(), createNewNozzle(), NozzleDrawing(), NozzleNode, BaseNodeDataSchema, Nozzle (+3 more)

### Community 84 - "preferences.service.ts"
Cohesion: 0.21
Nodes (5): DEFAULT_PREFS, FakePreferencesService, IPreferencesService, RealPreferencesService, UserPreferences

### Community 85 - "myFunc.ps1"
Cohesion: 0.26
Nodes (10): engines, node, npm, Get-DevServerUrl(), gp(), op(), run(), runall() (+2 more)

### Community 86 - "drawer.tsx"
Cohesion: 0.20
Nodes (8): vaul, DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerPortal(), DrawerTitle()

### Community 87 - "app/layout.tsx"
Cohesion: 0.26
Nodes (7): RootLayout(), useRelativeTime(), QueryProvider(), ThemeProvider(), TimeContext, TimeProvider(), useNow()

### Community 89 - "commodities.service.ts"
Cohesion: 0.24
Nodes (6): CommodityItem, FAKE_COMMODITIES, FakeCommoditiesService, ICommoditiesService, RealCommoditiesService, wait()

### Community 90 - "CustomEdge.tsx"
Cohesion: 0.18
Nodes (16): Badge(), badgeVariants, CustomEdge(), edgeTypes, resolveEdgeColor(), ellipsePoints(), getEdgePosition(), getFloatingEdgeParams() (+8 more)

### Community 91 - "fetch_bahesab.js"
Cohesion: 0.22
Nodes (7): cheerio, cheerio, fs, persianToEnglishDigits(), scrapeHolidays(), cheerio, fs

### Community 92 - "navigation-menu.tsx"
Cohesion: 0.24
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger(), navigationMenuTriggerStyle (+1 more)

### Community 94 - "src/services/search.service.ts"
Cohesion: 0.12
Nodes (15): GoogleShortcutTileProps, NavColor, useSiteSearchItems(), BILINGUAL_KEYWORDS, getBilingualKeywords(), NAV_SEARCH_SOURCE, NavSearchItem, NavSearchSource (+7 more)

### Community 95 - "scraper.js"
Cohesion: 0.28
Nodes (7): axios, cheerio, fs, getHolidays(), monthMap, parseIranfair(), run()

### Community 96 - "inject_fairs.js"
Cohesion: 0.22
Nodes (8): arrayStart, enObj, faObj, fs, newEvents, parsed, path, serviceContent

### Community 97 - "pagination.tsx"
Cohesion: 0.28
Nodes (7): Pagination(), PaginationContent(), PaginationEllipsis(), PaginationLink(), PaginationLinkProps, PaginationNext(), PaginationPrevious()

### Community 98 - "routing.ts"
Cohesion: 0.28
Nodes (6): deepMerge(), Locale, localeDirection, localeLabels, routing, config

### Community 99 - "flowStorage.ts"
Cohesion: 0.29
Nodes (3): FlowState, saveFlowState(), setupAutoSave()

### Community 100 - "channel-video-search.tsx"
Cohesion: 0.30
Nodes (9): ChannelHeader(), ChannelHeaderProps, ChannelVideoSearch(), ChannelVideoSearchProps, SlidingTabItem, SlidingTabs(), SlidingTabsProps, VideoSearchResultProps (+1 more)

### Community 101 - "slide-settings-drawer.tsx"
Cohesion: 0.22
Nodes (11): ALL_SLIDE_ITEMS, DEFAULT_SLIDE_ITEMS, SlideMenuCustomizerModal(), SlideMenuCustomizerModalProps, SlideMenuItemDef, itemKeySafe(), SlideSettingsDrawer(), SlideSettingsDrawerProps (+3 more)

### Community 102 - "Getting Started"
Cohesion: 0.29
Nodes (6): ESP App, Features, Getting Started, Manual Setup, One-Liner Setup (PowerShell), Prerequisites

### Community 103 - "stats.service.ts"
Cohesion: 0.18
Nodes (6): FALLBACK, FAKE_STATS, FakeStatsService, IStatsService, RealStatsService, StatItem

### Community 104 - "parse_excel.js"
Cohesion: 0.29
Nodes (5): data, events, fs, workbook, xlsx

### Community 105 - "update-remove-birthday.js"
Cohesion: 0.29
Nodes (6): enContent, faContent, fs, path, serviceContent, widgetContent

### Community 106 - "eslint.config.mjs"
Cohesion: 0.33
Nodes (3): eslintConfig, eslint-config-prettier, eslint-plugin-react-hooks

### Community 107 - "parse-pdf.js"
Cohesion: 0.33
Nodes (5): events, fs, lines, monthMap, ocr

### Community 108 - "container.tsx"
Cohesion: 0.33
Nodes (5): ContainerProps, ContainerSize, containerSizeClasses, FullWidth(), FullWidthProps

### Community 109 - "parse_pdf_to_js.js"
Cohesion: 0.33
Nodes (5): events, fs, lines, monthMap, ocr

### Community 110 - "colors.ts"
Cohesion: 0.22
Nodes (8): COLOR_TOKEN_ORDER, ColorMode, EDGE_COLOR_TOKENS, NODE_COLOR_TOKENS, NodeTokenColors, NodeTokenModes, ResolvableEdgeData, ResolvableNodeData

### Community 111 - "update-admin-translations.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 112 - "update-admin-translations2.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 113 - "update-admin-translations3.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 114 - "update-admin-translations4.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, enData, faData, fs

### Community 115 - "update-translations.js"
Cohesion: 0.33
Nodes (5): adminEn, adminFa, en, fa, fs

### Community 116 - "fix_types.js"
Cohesion: 0.40
Nodes (4): code, fs, matchFair, matchHol

### Community 117 - "replace.js"
Cohesion: 0.40
Nodes (3): code, events, fs

### Community 118 - "scratch_translations.js"
Cohesion: 0.40
Nodes (3): enProfile, faProfile, fs

### Community 119 - "remove-icons.js"
Cohesion: 0.40
Nodes (4): endIdx, fs, lines, startIdx

### Community 120 - "textDirection.ts"
Cohesion: 0.43
Nodes (6): getTextDirection(), localizeTitle(), PERSIAN_DIGITS, TextDirection, toPersianDigits(), withTitleDirection()

### Community 122 - "fix_en_json.js"
Cohesion: 0.50
Nodes (3): enData, faData, fs

### Community 123 - "parse.js"
Cohesion: 0.50
Nodes (3): fs, html, urls

### Community 124 - "constants/layout.ts"
Cohesion: 0.50
Nodes (3): HEADER_HEIGHT, MAX_CONTENT_WIDTH, SIDEBAR_WIDTH

### Community 125 - "flangeWeightTable.ts"
Cohesion: 0.50
Nodes (3): FLANGE_WEIGHTS, FlangeClass, FlangeType

### Community 126 - "pipeDimensions.ts"
Cohesion: 0.50
Nodes (3): PIPE_DIMENSIONS, PipeNPS, PipeSchedule

### Community 127 - "update-admin-translations-fix.js"
Cohesion: 0.50
Nodes (3): enData, faData, fs

### Community 128 - "update-departments.js"
Cohesion: 0.50
Nodes (3): en, fa, fs

### Community 129 - "update-tabs-motion.js"
Cohesion: 0.50
Nodes (3): calContent, checkContent, fs

### Community 130 - "browserslist"
Cohesion: 0.67
Nodes (3): browserslist, development, production

### Community 131 - "repository"
Cohesion: 0.67
Nodes (3): repository, type, url

### Community 148 - "channelstats.tsx"
Cohesion: 0.50
Nodes (4): ChannelStats(), ExtendedChannelStatsProps, StatItem, ChannelStatsProps

## Knowledge Gaps
- **851 isolated node(s):** `fs`, `code`, `$schema`, `style`, `rsc` (+846 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1026 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `useVesselWeightStore`, `package.json`, `DiagramEditor.tsx`, `search-results-client.tsx`, `register/page.tsx`, `[locale]/layout.tsx`, `AdminDashboard.tsx`, `profile-page.tsx`, `team-client.tsx`, `refactor_admin.js`, `MarketQuote`, `playlist.tsx`?**
  _High betweenness centrality (0.192) - this node is a cross-community bridge._
- **What connects `fs`, `code`, `$schema` to the rest of the system?**
  _851 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.025974025974025976 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `VesselNodeBase.tsx`, `package.json`, `side-menu.tsx`, `BaseNode.tsx`, `dashboard.service.ts`, `ShapeNodes.tsx`, `cn`, `sidebar.tsx`, `Toolbar.tsx`, `dropdown-menu.tsx`, `base.schema.ts`, `SettingsPanel.tsx`, `multi-button.tsx`, `Button`, `commodities-widget.tsx`, `vessel/HeadNode.tsx`, `date-picker.tsx`, `team-client.tsx`, `engineering-dictionary.tsx`, `EditorSettingsDialog.tsx`, `VideoListItem`, `did-you-know-section.tsx`, `search/services/search.service.ts`, `playlist.tsx`, `useVesselWeightStore`, `dashboard-control-hub-modal.tsx`, `esp-flow/components/DiagramCanvas.tsx`, `ProjectDataNode.tsx`, `vessel/AttachmentsNode.tsx`, `src/types/index.ts`, `radix-ui`, `useDiagramStore`, `search-results-client.tsx`, `register/page.tsx`, `[locale]/layout.tsx`, `stats-section.tsx`, `login/page.tsx`, `AdminDashboard.tsx`, `mistEliminator.schema.ts`, `profile-page.tsx`, `config/navigation.ts`, `support.schema.ts`, `notifications-popover.tsx`, `input-group.tsx`, `calendar.tsx`, `Combobox`, `home-client.tsx`, `menubar.tsx`, `nav-search-result.tsx`, `alert-dialog.tsx`, `aparat-client.tsx`, `DiagramEditor.tsx`, `Link`, `auth.service.ts`, `dashboard-avatar.tsx`, `NodePalette.tsx`, `sitemap-client.tsx`, `chart.tsx`, `GoogleShortcutTile.tsx`, `carousel.tsx`, `daily-routines-widget.tsx`, `input-otp.tsx`, `nodes/NozzleNode.tsx`, `drawer.tsx`, `app/layout.tsx`, `modal-shell.tsx`, `CustomEdge.tsx`, `navigation-menu.tsx`, `src/services/search.service.ts`, `pagination.tsx`, `channel-video-search.tsx`, `slide-settings-drawer.tsx`, `stats.service.ts`, `container.tsx`?**
  _High betweenness centrality (0.187) - this node is a cross-community bridge._
- **Should `VesselNodeBase.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0759493670886076 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `VesselNodeBase.tsx`, `side-menu.tsx`, `BaseNode.tsx`, `dashboard.service.ts`, `ShapeNodes.tsx`, `sidebar.tsx`, `Toolbar.tsx`, `dropdown-menu.tsx`, `SettingsPanel.tsx`, `multi-button.tsx`, `Button`, `channelstats.tsx`, `commodities-widget.tsx`, `date-picker.tsx`, `engineering-dictionary.tsx`, `EditorSettingsDialog.tsx`, `did-you-know-section.tsx`, `playlist.tsx`, `useVesselWeightStore`, `dashboard-control-hub-modal.tsx`, `esp-flow/components/DiagramCanvas.tsx`, `radix-ui`, `useDiagramStore`, `search-results-client.tsx`, `register/page.tsx`, `login/page.tsx`, `AdminDashboard.tsx`, `profile-page.tsx`, `config/navigation.ts`, `react`, `notifications-popover.tsx`, `input-group.tsx`, `calendar.tsx`, `Combobox`, `home-client.tsx`, `menubar.tsx`, `alert-dialog.tsx`, `aparat-client.tsx`, `DiagramEditor.tsx`, `Link`, `dashboard-avatar.tsx`, `NodePalette.tsx`, `chart.tsx`, `GoogleShortcutTile.tsx`, `carousel.tsx`, `daily-routines-widget.tsx`, `input-otp.tsx`, `drawer.tsx`, `CustomEdge.tsx`, `navigation-menu.tsx`, `pagination.tsx`, `channel-video-search.tsx`, `slide-settings-drawer.tsx`, `container.tsx`?**
  _High betweenness centrality (0.171) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.029411764705882353 - nodes in this community are weakly interconnected._