@echo off
setlocal

:: Create HTML file
echo ^<!DOCTYPE html^> > index.html
echo ^<html lang="en"^> >> index.html
echo ^<head^> >> index.html
echo     ^<meta charset="UTF-8"^> >> index.html
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^> >> index.html
echo     ^<title^>My App^</title^> >> index.html
echo     ^<link rel="stylesheet" href="styles.css"^> >> index.html
echo ^</head^> >> index.html
echo ^<body^> >> index.html
echo     ^<script src="script.js"^>^</script^> >> index.html
echo ^</body^> >> index.html
echo ^</html^> >> index.html

:: Create JavaScript file
echo // JavaScript file for My App > script.js
echo console.log('Hello, world!'); >> script.js

:: Create CSS file
echo /* CSS file for My App */ > styles.css
echo body { >> styles.css
echo     font-family: Arial, sans-serif; >> styles.css
echo } >> styles.css

echo Files created successfully.

endlocal
