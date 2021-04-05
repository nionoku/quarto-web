# Remove old dist dir
rm -rf dist
# Create empty dist folder
mkdir -p dist
# Create index.html
cat << EOFSUB >> dist/index.html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>quarto-web</title>

  <link rel='stylesheet' href='bundle.css'>

  <script defer src='bundle.js'></script>
</head>

<body>

</body>

</html>
EOFSUB
