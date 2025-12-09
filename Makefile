# ============================================================
#  Makefile for Firefox Add-on Build (Version Directory)
#
#  dist/v<version>/distribution.xpi
#  dist/v<version>/for-check.zip
#
#  <version> は package.json の "version" を自動取得
# ============================================================

# version from package.json
VERSION := $(shell node -p "require('./package.json').version")

# Directory → dist/v1.0.1/
DIST_ROOT := dist
DIST_DIR := $(DIST_ROOT)/v$(VERSION)

# Build output directory from npm
PROD_DIR := dist/prod

# Output files
XPI_OUT := $(DIST_DIR)/distribution.xpi
ZIP_OUT := $(DIST_DIR)/for-check.zip

# Files included in metadata ZIP
META_FILES := src package.json package-lock.json README.md Makefile


# ------------------------------------------------------------
# Main target
# ------------------------------------------------------------
build: prep npm-build xpi zip
	@echo "----------------------------------------------"
	@echo " Build completed:"
	@echo "   XPI: $(XPI_OUT)"
	@echo "   ZIP: $(ZIP_OUT)"
	@echo "----------------------------------------------"


# ------------------------------------------------------------
# Prepare output folder
# ------------------------------------------------------------
prep:
	@mkdir -p $(DIST_DIR)
	@echo "[prep] Created: $(DIST_DIR)"


# ------------------------------------------------------------
# npm production build
# ------------------------------------------------------------
npm-build:
	@echo "[npm] Running npm run build:prod ..."
	npm run build:prod
	@echo "[npm] Build OK"


# ------------------------------------------------------------
# Create distribution.xpi
# ------------------------------------------------------------
xpi:
	@if [ ! -d "$(PROD_DIR)" ]; then \
		echo "ERROR: $(PROD_DIR) not found. Build failed?"; \
		exit 1; \
	fi
	@echo "[xpi] Creating $(XPI_OUT)"
	cd $(PROD_DIR) && zip -r ../../$(XPI_OUT) .
	@echo "[xpi] XPI created"


# ------------------------------------------------------------
# Create for-check.zip
# ------------------------------------------------------------
zip:
	@echo "[zip] Creating $(ZIP_OUT)"
	zip -r $(ZIP_OUT) $(META_FILES)
	@echo "[zip] ZIP created"


# ------------------------------------------------------------
# Remove dist directory
# ------------------------------------------------------------
clean:
	rm -rf $(DIST_ROOT)
	@echo "[clean] dist/ removed"


# EOF
