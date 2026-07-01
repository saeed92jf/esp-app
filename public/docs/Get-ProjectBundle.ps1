function Get-ProjectBundle {
    [CmdletBinding()]
    param(
        # مسیر خروجی فایل باندل
        [Parameter(Mandatory = $false)]
        [string]$OutputPath = "project-bundle.txt",

        # مسیر ریشه پروژه
        [Parameter(Mandatory = $false)]
        [string]$ProjectRoot = (Get-Location).Path,

        # پوشه خاص داخل پروژه که فقط همان باندل شود
        # مثلاً "src\components" یا "src\app\dashboard"
        # اگر خالی بگذاری، کل src را می‌گیرد
        [Parameter(Mandatory = $false)]
        [string]$TargetFolder,

        # اگر بگذاری، فقط همان پوشه‌ی TargetFolder را می‌گیرد و فایل‌های root و messages را نمی‌آورد
        [Parameter(Mandatory = $false)]
        [switch]$OnlyTargetFolder,

        # اضافه کردن فایل‌های root config
        # پیش‌فرض: روشن (مگر اینکه OnlyTargetFolder روشن باشد)
        [Parameter(Mandatory = $false)]
        [switch]$IncludeRootFiles,

        # اضافه کردن پوشه messages
        # پیش‌فرض: روشن (مگر اینکه OnlyTargetFolder روشن باشد)
        [Parameter(Mandatory = $false)]
        [switch]$IncludeMessages,

        # پوشه‌های اضافی برای حذف (علاوه بر پیش‌فرض‌ها)
        [Parameter(Mandatory = $false)]
        [string[]]$ExtraExcludeDirs,

        # پسوندهای اضافی برای حذف
        [Parameter(Mandatory = $false)]
        [string[]]$ExtraExcludeExtensions
    )

    begin {
        Write-Host "Starting project bundle creation..." -ForegroundColor Green

        # فایل‌های روت
        $rootFiles = @(
            "package.json",
            "package-lock.json",
            "tsconfig.json",
            "next.config.js",
            "next.config.mjs",
            "next.config.ts",
            "tailwind.config.js",
            "tailwind.config.ts",
            "postcss.config.js",
            "postcss.config.mjs",
            ".env.local",
            ".env.example",
            "README.md",
            "i18n.config.ts",
            "i18n.config.js"
        )

        # پسوندهای حذف
        $excludeExtensions = @(
            ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico",
            ".woff", ".woff2", ".ttf", ".eot",
            ".mp4", ".mp3", ".wav",
            ".zip", ".rar", ".7z",
            ".pdf", ".doc", ".docx"
        )
        if ($ExtraExcludeExtensions) {
            $excludeExtensions += $ExtraExcludeExtensions
        }

        # پوشه‌های حذف
        $excludeDirs = @(
            "node_modules",
            ".next",
            ".git",
            "dist",
            "build",
            "out",
            ".cache"
        )
        if ($ExtraExcludeDirs) {
            $excludeDirs += $ExtraExcludeDirs
        }

        # تعیین اینکه آیا root files و messages آورده شوند یا نه
        $shouldIncludeRootFiles = if ($OnlyTargetFolder) { $false } else { $true }
        $shouldIncludeMessages = if ($OnlyTargetFolder) { $false } else { $true }

        # اگر کاربر صریحاً IncludeRootFiles داده، override کن
        if ($IncludeRootFiles) { $shouldIncludeRootFiles = $true }
        if ($IncludeMessages) { $shouldIncludeMessages = $true }

        # اگر OnlyTargetFolder روشن است و کاربر صریحاً خواسته، باز بیا
        if ($OnlyTargetFolder -and $IncludeRootFiles) { $shouldIncludeRootFiles = $true }
        if ($OnlyTargetFolder -and $IncludeMessages) { $shouldIncludeMessages = $true }

        $srcFiles = @()
        $messageFiles = @()
    }

    process {
        try {
            $bundleContent = @()
            $bundleContent += "=" * 80
            $bundleContent += "PROJECT BUNDLE - Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            $bundleContent += "Project Root: $ProjectRoot"
            $bundleContent += "=" * 80
            $bundleContent += ""

            # ─────────────────────────────────────
            # ۱. ROOT CONFIG FILES
            # ─────────────────────────────────────
            if ($shouldIncludeRootFiles) {
                Write-Host "Processing root files..." -ForegroundColor Cyan
                $bundleContent += ""
                $bundleContent += "#" * 80
                $bundleContent += "# ROOT CONFIGURATION FILES"
                $bundleContent += "#" * 80
                $bundleContent += ""

                foreach ($fileName in $rootFiles) {
                    $filePath = Join-Path $ProjectRoot $fileName
                    if (Test-Path $filePath) {
                        Write-Host "  Adding: $fileName" -ForegroundColor Gray
                        $bundleContent += ""
                        $bundleContent += "-" * 80
                        $bundleContent += "FILE: $fileName"
                        $bundleContent += "-" * 80
                        $bundleContent += Get-Content $filePath -Raw
                        $bundleContent += ""
                    }
                }
            }

            # ─────────────────────────────────────
            # ۲. MESSAGES (i18n)
            # ─────────────────────────────────────
            if ($shouldIncludeMessages) {
                $messagesPath = Join-Path $ProjectRoot "messages"
                if (Test-Path $messagesPath) {
                    Write-Host "Processing messages directory..." -ForegroundColor Cyan
                    $bundleContent += ""
                    $bundleContent += "#" * 80
                    $bundleContent += "# MESSAGES (i18n)"
                    $bundleContent += "#" * 80
                    $bundleContent += ""

                    $messageFiles = Get-ChildItem -Path $messagesPath -Filter "*.json" -Recurse
                    foreach ($file in $messageFiles) {
                        $relativePath = $file.FullName.Replace($ProjectRoot, "").TrimStart("\", "/")
                        Write-Host "  Adding: $relativePath" -ForegroundColor Gray
                        $bundleContent += ""
                        $bundleContent += "-" * 80
                        $bundleContent += "FILE: $relativePath"
                        $bundleContent += "-" * 80
                        $bundleContent += Get-Content $file.FullName -Raw
                        $bundleContent += ""
                    }
                }
            }

            # ─────────────────────────────────────
            # ۳. SOURCE FILES
            # ─────────────────────────────────────
            $folderToProcess = if ($TargetFolder) {
                Join-Path $ProjectRoot $TargetFolder
            } else {
                Join-Path $ProjectRoot "src"
            }

            if (Test-Path $folderToProcess) {
                Write-Host "Processing folder: $folderToProcess" -ForegroundColor Cyan
                $bundleContent += ""
                $bundleContent += "#" * 80
                $sectionName = if ($TargetFolder) { "TARGET FOLDER: $TargetFolder" } else { "SOURCE CODE (src/)" }
                $bundleContent += "# $sectionName"
                $bundleContent += "#" * 80
                $bundleContent += ""

                $srcFiles = Get-ChildItem -Path $folderToProcess -File -Recurse | Where-Object {
                    $file = $_
                    $includeFile = $true

                    # چک پسوند
                    foreach ($ext in $excludeExtensions) {
                        if ($file.Extension.ToLower() -eq $ext.ToLower()) {
                            $includeFile = $false
                            break
                        }
                    }

                    # چک پوشه‌های حذف
                    if ($includeFile) {
                        foreach ($dir in $excludeDirs) {
                            if ($file.FullName -like "*\$dir\*" -or $file.FullName -like "*/$dir/*") {
                                $includeFile = $false
                                break
                            }
                        }
                    }

                    $includeFile
                } | Sort-Object FullName

                foreach ($file in $srcFiles) {
                    $relativePath = $file.FullName.Replace($ProjectRoot, "").TrimStart("\", "/")
                    Write-Host "  Adding: $relativePath" -ForegroundColor Gray
                    $bundleContent += ""
                    $bundleContent += "-" * 80
                    $bundleContent += "FILE: $relativePath"
                    $bundleContent += "-" * 80
                    try {
                        $bundleContent += Get-Content $file.FullName -Raw -ErrorAction Stop
                    } catch {
                        $bundleContent += "[Error reading file: $($_.Exception.Message)]"
                    }
                    $bundleContent += ""
                }
            } else {
                $msg = if ($TargetFolder) {
                    "Target folder not found: $folderToProcess"
                } else {
                    "src directory not found: $folderToProcess"
                }
                Write-Host "Warning: $msg" -ForegroundColor Yellow
            }

            # ─────────────────────────────────────
            # ۴. WRITE OUTPUT
            # ─────────────────────────────────────
            $outputFullPath = if ([System.IO.Path]::IsPathRooted($OutputPath)) {
                $OutputPath
            } else {
                Join-Path $ProjectRoot $OutputPath
            }

            $bundleContent | Out-File -FilePath $outputFullPath -Encoding UTF8

            $outputFile = Get-Item $outputFullPath
            $fileSize = "{0:N2} MB" -f ($outputFile.Length / 1MB)

            $rootCount = 0
            if ($shouldIncludeRootFiles) {
                $rootCount = ($rootFiles | Where-Object { Test-Path (Join-Path $ProjectRoot $_) }).Count
            }

            Write-Host ""
            Write-Host "═══════════════════════════════════════════════" -ForegroundColor Green
            Write-Host " Bundle created successfully!" -ForegroundColor Green
            Write-Host "═══════════════════════════════════════════════" -ForegroundColor Green
            Write-Host " Output file:        $outputFullPath" -ForegroundColor Yellow
            Write-Host " File size:          $fileSize" -ForegroundColor Yellow
            Write-Host " Source files:       $($srcFiles.Count)" -ForegroundColor Yellow
            Write-Host " Message files:      $($messageFiles.Count)" -ForegroundColor Yellow
            Write-Host " Root config files:  $rootCount" -ForegroundColor Yellow
            Write-Host " Total files:        $($srcFiles.Count + $messageFiles.Count + $rootCount)" -ForegroundColor Yellow
            Write-Host "═══════════════════════════════════════════════" -ForegroundColor Green

        } catch {
            Write-Error "Error creating bundle: $($_.Exception.Message)"
            throw
        }
    }
}
