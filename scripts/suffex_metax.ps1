$rustInfo = rustc -Vv

$res = $rustInfo | Select-String -Pattern 'host:\s.+'

$targetTriple = $res.ToString().Split(" ")[1]

Rename-Item -Path "apps/bin/meta-x.exe" -NewName "meta-x-$targetTriple.exe"

