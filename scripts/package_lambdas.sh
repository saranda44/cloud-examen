#!/bin/bash
set -e

# Cambiar al directorio raíz del proyecto para referencias absolutas/relativas seguras
cd "$(dirname "$0")/.."

# Directorios de la lambda
LAMBDA_DIR="lambda"
SRC_DIR="$LAMBDA_DIR/src"
DIST_DIR="$LAMBDA_DIR/dist"
BUILD_ROOT="$LAMBDA_DIR/build"

CACHE_DIR="$BUILD_ROOT/cache"
PACKAGE_DIR="$BUILD_ROOT/package"
HASH_FILE="$CACHE_DIR/package.hash"

mkdir -p "$BUILD_ROOT"
mkdir -p "$CACHE_DIR"
mkdir -p "$PACKAGE_DIR"

echo "Compilando TypeScript de las lambdas..."
# Asumimos que tsc está instalado en devDependencies y config compila a dist/
npx tsc --project $LAMBDA_DIR/tsconfig.json || npx tsc

echo "Verificando dependencias en la raíz..."
# Generar hash basado en package.json y package-lock.json de la raíz
if [ -f "package-lock.json" ]; then
  NEW_HASH=$(sha256sum package.json package-lock.json | sha256sum | awk '{print $1}')
else
  NEW_HASH=$(sha256sum package.json | awk '{print $1}')
fi

OLD_HASH=""
if [ -f "$HASH_FILE" ]; then
  OLD_HASH=$(cat "$HASH_FILE")
fi

if [ "$NEW_HASH" != "$OLD_HASH" ]; then
  echo "Las dependencias cambiaron. Reinstalando módulos para producción..."
  
  rm -rf "$CACHE_DIR"/*
  
  # Copiar archivos esenciales para instalar limpio sin afectar el entorno principal
  cp package.json "$CACHE_DIR/"
  if [ -f "package-lock.json" ]; then
    cp package-lock.json "$CACHE_DIR/"
  fi
  
  cd "$CACHE_DIR"
  # npm ci preferido para entornos CI/producción; si no funciona usa npm install
  npm ci --omit=dev 2>/dev/null || npm install --omit=dev
  cd - >/dev/null

  echo "$NEW_HASH" > "$HASH_FILE"
else
  echo "Dependencias sin cambios. Reutilizando caché de node_modules."
fi

# Empaquetamos cada función individualmente
for func_file in "$SRC_DIR"/*.ts; do
  if [ -f "$func_file" ]; then
    # Extraer el nombre de la función (ej: generatePDF)
    FUNC_NAME=$(basename "$func_file" .ts)
    echo "--------------------------"
    echo "Empaquetando $FUNC_NAME..."

    # Limpiamos el directorio temporal de empaquetado
    rm -rf "$PACKAGE_DIR"/*
    
    # 1. Copiamos el archivo .js compilado desde dist/
    if [ -f "$DIST_DIR/$FUNC_NAME.js" ]; then
      cp "$DIST_DIR/$FUNC_NAME.js" "$PACKAGE_DIR/"
    else
      echo "Advertencia: El archivo $DIST_DIR/$FUNC_NAME.js no existe. Saltando..."
      continue
    fi

    # 2. Copiamos los node_modules de producción desde el caché
    if [ -d "$CACHE_DIR/node_modules" ]; then
      cp -r "$CACHE_DIR/node_modules" "$PACKAGE_DIR/"
    fi
    
    # 3. Zip recursivo de la función
    cd "$PACKAGE_DIR"
    # El archivo resultante quedará en lambda/build/nombreFuncion.zip
    zip -r9 "../../$BUILD_ROOT/$FUNC_NAME.zip" . >/dev/null
    cd - >/dev/null

    echo "$FUNC_NAME.zip listo en $BUILD_ROOT/"
  fi
done

echo "--------------------------"
echo "Empaquetado completo."
