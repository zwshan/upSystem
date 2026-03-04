#!/usr/bin/env bash
set -euo pipefail

FILE="/Users/zwshan/Desktop/LIFE_CODE/upSystem/ui/apple-home.html"

[ -f "$FILE" ]
grep -q ">刷题<" "$FILE"
grep -q ">复习<" "$FILE"
grep -q ">设置<" "$FILE"
grep -q ">题库管理<" "$FILE"
grep -q ">备份<" "$FILE"
grep -Eq "min-height:\s*100vh" "$FILE"
grep -q "backdrop-filter" "$FILE"
