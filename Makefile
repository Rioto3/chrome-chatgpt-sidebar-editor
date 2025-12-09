# ============================================================
#  Makefile for Firefox Add-on Build (Timestamp Folder Version)
#
#  make build
#      1. Run production build: npm run build:prod
#      2. Create dist/<timestamp>/ directory
#      3. Package dist/prod → dist/<timestamp>/distribution.xpi
#      4. Package src + metadata → dist/<timestamp>/for-check.zip
#
#  Timestamp format: MMDDHHMMSS
# ============================================================

# Timestamp
TS := $(shell date +%m%d%H%M%S)

# Directories
DIST_ROOT := dist
DIST_DIR := $(DIST_ROOT)/$(TS)
PROD_DIR := dist/prod

# Output files
XPI_OUT := $(DIST_DIR)/distribution.xpi
ZIP_OUT := $(DIST_DIR)/for-check.zip

# Files included in metadata ZIP
META_FILES := src package.json package-lock.json README.md Makefile


# ------------------------------------------------------------
# Public target
# ------------------------------------------------------------
build: prep npm-build xpi zip
	@echo "----------------------------------------------"
	@echo " Build completed:"
	@echo "   XPI: $(XPI_OUT)"
	@echo "   ZIP: $(ZIP_OUT)"
	@echo "----------------------------------------------"


# ------------------------------------------------------------
# Prepare dist/<timestamp>/ directory
# ------------------------------------------------------------
prep:
	@mkdir -p $(DIST_DIR)
	@echo "[prep] Created: $(DIST_DIR)"


# ------------------------------------------------------------
# Run npm production build
# ------------------------------------------------------------
npm-build:
	@echo "[npm] Running npm run build:prod ..."
	npm run build:prod
	@echo "[npm] Build OK"


# ------------------------------------------------------------
# Package dist/prod → distribution.xpi
# ------------------------------------------------------------
xpi:
	@if [ ! -d "$(PROD_DIR)" ]; then \
		echo "ERROR: $(PROD_DIR) not found. Build failed?"; \
		exit 1; \
	fi
	@echo "[xpi] Packaging $(PROD_DIR) → $(XPI_OUT)"
	cd $(PROD_DIR) && zip -r ../../$(XPI_OUT) .
	@echo "[xpi] XPI created"


# ------------------------------------------------------------
# Package metadata → for-check.zip
# ------------------------------------------------------------
zip:
	@echo "[zip] Packaging metadata → $(ZIP_OUT)"
	zip -r $(ZIP_OUT) $(META_FILES)
	@echo "[zip] ZIP created"


# ------------------------------------------------------------
# Remove entire dist directory
# ------------------------------------------------------------
clean:
	rm -rf $(DIST_ROOT)
	@echo "[clean] dist/ removed"


# EOF
