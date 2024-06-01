$targetTriple = rustc -Vv | Select-String "host:" | ForEach-Object { $_.Line.split(" ")[1] }

Rename-Item -Path "apps/bin/meta-x.exe" -NewName "meta-x-$targetTriple.exe"

