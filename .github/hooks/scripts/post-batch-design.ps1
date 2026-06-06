# PostToolUse: batch_design -> block agent, force skill-driven review
$rawInput = ($input | Out-String).Trim()
if (-not $rawInput) { exit 0 }

try {
    $data = $rawInput | ConvertFrom-Json
    $toolName = $data.tool_name
    $matches = $toolName -match 'batch_design'

    if ($matches) {
        $msg = 'BATCH_DESIGN JUST COMPLETED. Read skill "pencil-prototype": snapshot_layout on affected nodes + fix clipped/overflow. Read skill "ui-ux-pro-max": check contrast>=4.5:1, touch>=44pt, spacing multiples of 4. Then get_screenshot for user. DO NOT proceed until done.'

        $output = @{
            decision = "block"
            systemMessage = $msg
        } | ConvertTo-Json -Compress

        Write-Output $output
    }
} catch { }
exit 0
