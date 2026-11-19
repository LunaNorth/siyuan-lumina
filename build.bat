@echo off
REM ---------------------------------------------------------------
REM Lumina (siyuan-lumina) builder
REM Ships exactly: index.js index.css plugin.json icon.png preview.png
REM                README.md README.zh-CN.md i18n/
REM Everything else (git, node_modules, editor folders, build scripts,
REM old readmes, icons source folder) is ignored on purpose.
REM ---------------------------------------------------------------
setlocal enabledelayedexpansion
cd /d "%~dp0"

set "OUTPUT=package.zip"
set "STAGE=%TEMP%\lumina_build_%RANDOM%"

echo.
echo   Lumina builder
echo   ---------------------------------

echo [1/4] staging ...
if exist "%STAGE%" rd /s /q "%STAGE%"
mkdir "%STAGE%" 2>nul
if not exist "%STAGE%" (
    echo [ERROR] cannot create staging folder
    exit /b 1
)

echo [2/4] copying ...
set "MISSING="
for %%F in (index.js index.css plugin.json icon.png preview.png README.md README.zh-CN.md) do (
    if exist "%%F" (
        copy /y "%%F" "%STAGE%\" >nul
    ) else (
        set "MISSING=!MISSING! %%F"
    )
)
if exist "i18n\" (
    xcopy "i18n" "%STAGE%\i18n\" /E /I /Q /Y >nul
) else (
    set "MISSING=!MISSING! i18n\"
)
if not "!MISSING!"=="" (
    echo [ERROR] missing required item^(s^):!MISSING!
    rd /s /q "%STAGE%" >nul 2>&1
    exit /b 1
)

echo [3/4] packaging ...
if exist "%OUTPUT%" del /q "%OUTPUT%" >nul 2>&1
REM Windows PowerShell's Compress-Archive / ZipFile.CreateFromDirectory write '\'
REM separators; Go's archive/zip (used by SiYuan) treats that as a literal filename,
REM so i18n\en.json would land in the zip root instead of the i18n folder.
REM Building the entries by hand keeps '/' separators.
powershell -nologo -noprofile -command "Add-Type -A System.IO.Compression.FileSystem; $src='%STAGE%'; $out=(Join-Path '%CD%' '%OUTPUT%'); $zip=[IO.Compression.ZipFile]::Open($out,'Create'); Get-ChildItem -LiteralPath $src -Recurse -File | ForEach-Object { $rel=$_.FullName.Substring($src.Length+1).Replace('\','/'); $e=$zip.CreateEntry($rel,[IO.Compression.CompressionLevel]::Optimal); $s=$e.Open(); $f=[IO.File]::OpenRead($_.FullName); $f.CopyTo($s); $f.Dispose(); $s.Dispose() }; $zip.Dispose()"
if errorlevel 1 (
    echo [ERROR] zipping failed
    rd /s /q "%STAGE%" >nul 2>&1
    exit /b 1
)

echo [4/4] verifying ...
powershell -nologo -noprofile -command "Add-Type -A System.IO.Compression.FileSystem; $z=[IO.Compression.ZipFile]::OpenRead((Resolve-Path '%OUTPUT%')); $z.Entries | ForEach-Object { '  ' + $_.FullName }; $z.Dispose()"

for %%A in ("%OUTPUT%") do set "SIZE=%%~zA"
echo.
echo [OK] %OUTPUT%  ^(%SIZE% bytes^)
rd /s /q "%STAGE%" >nul 2>&1
endlocal
