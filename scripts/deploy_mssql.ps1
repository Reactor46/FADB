<#
PowerShell helper: deploy_mssql.ps1

Runs the MSSQL DDL and optional insert files against a target SQL Server / Azure SQL Database.
Requires the SqlServer PowerShell module (Invoke-Sqlcmd) OR fallback to sqlcmd CLI.

Usage examples:
# Using Invoke-Sqlcmd (Windows/PowerShell Core with SqlServer module):
.
# ./scripts/deploy_mssql.ps1 -ServerInstance "localhost\SQLEXPRESS" -Database "FADB" -Username "sa" -Password "P@ssw0rd" -Ddls @("sql/ddl_mssql.sql") -Inserts @("sql/inserts_small_import.sql")

# Using sqlcmd fallback (works on Linux/macOS with mssql-tools/sqlcmd installed):
# ./scripts/deploy_mssql.ps1 -ServerInstance "tcp:db.example.com,1433" -Database "FADB" -UseSqlCmd -Ddls @("sql/ddl_mssql.sql")
#>

param(
    [Parameter(Mandatory=$true)] [string] $ServerInstance,
    [Parameter(Mandatory=$true)] [string] $Database,
    [string] $Username = $null,
    [string] $Password = $null,
    [string[]] $Ddls = @('sql/ddl_mssql.sql'),
    [string[]] $Inserts = @(),
    [switch] $UseSqlCmd
n)

function Run-SqlFile_InvokeSqlcmd {
    param($Server, $Database, $Username, $Password, $File)
    Write-Host "Running $File via Invoke-Sqlcmd against $Server/$Database"
    try {
        if ($Username -and $Password) {
            Invoke-Sqlcmd -ServerInstance $Server -Database $Database -Username $Username -Password $Password -InputFile $File -ErrorAction Stop
        } else {
            Invoke-Sqlcmd -ServerInstance $Server -Database $Database -InputFile $File -ErrorAction Stop
        }
        Write-Host "OK: $File"
    } catch {
        Write-Error "Failed to run $File: $_"
        throw
    }
}

function Run-SqlFile_SqlCmd {
    param($Server, $Database, $File)
    Write-Host "Running $File via sqlcmd against $Server/$Database"
    $sqlcmdPath = 'sqlcmd'
    $args = @('-S', $Server, '-d', $Database, '-i', $File)
    $proc = Start-Process -FilePath $sqlcmdPath -ArgumentList $args -NoNewWindow -Wait -PassThru
    if ($proc.ExitCode -ne 0) {
        throw "sqlcmd exit code $($proc.ExitCode)"
    }
}

# Main
if ($UseSqlCmd) {
    foreach ($f in $Ddls) { Run-SqlFile_SqlCmd -Server $ServerInstance -Database $Database -File $f }
    foreach ($f in $Inserts) { Run-SqlFile_SqlCmd -Server $ServerInstance -Database $Database -File $f }
    exit 0
}

# Prefer Invoke-Sqlcmd if available
if (Get-Command Invoke-Sqlcmd -ErrorAction SilentlyContinue) {
    foreach ($f in $Ddls) { Run-SqlFile_InvokeSqlcmd -Server $ServerInstance -Database $Database -Username $Username -Password $Password -File $f }
    foreach ($f in $Inserts) { Run-SqlFile_InvokeSqlcmd -Server $ServerInstance -Database $Database -Username $Username -Password $Password -File $f }
} else {
    Write-Warning "Invoke-Sqlcmd not available. Use -UseSqlCmd switch to fall back to the sqlcmd CLI."
    foreach ($f in $Ddls) { Run-SqlFile_SqlCmd -Server $ServerInstance -Database $Database -File $f }
    foreach ($f in $Inserts) { Run-SqlFile_SqlCmd -Server $ServerInstance -Database $Database -File $f }
}
