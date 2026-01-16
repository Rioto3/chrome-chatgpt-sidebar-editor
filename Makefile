# ============================================================
#  Makefile for Browser Extension Release
#
#  build/<platform>/<env>/        ← webpack output
#  release/<platform>/v<version>/ ← distributables
# ============================================================

# ------------------------------------------------------------
# Variables
# ------------------------------------------------------------

PLATFORM ?= firefox
ENV ?= production

VERSION := $(shell node -p "require('./package.json').version")

# build output (webpack)
BUILD_ROOT := build
BUILD_DIR := $(BUILD_ROOT)/$(PLATFORM)/$(ENV)

# release output
RELEASE_ROOT := release
RELEASE_DIR := $(RELEASE_ROOT)/$(PLATFORM)/v$(VERSION)

XPI_OUT := $(RELEASE_DIR)/distribution.xpi
ZIP_OUT := $(RELEASE_DIR)/for-check.zip

META_FILES := src package.json package-lock.json README.md Makefile

# ------------------------------------------------------------
# Main target
# ------------------------------------------------------------
build: prep npm-build xpi zip
	@echo "----------------------------------------------"
	@echo " Build completed:"
	@echo "   PLATFORM : $(PLATFORM)"
	@echo "   VERSION  : v$(VERSION)"
	@echo "   XPI      : $(XPI_OUT)"
	@echo "   ZIP      : $(ZIP_OUT)"
	@echo "----------------------------------------------"

# ------------------------------------------------------------
# Prepare release directory
# ------------------------------------------------------------
prep:
	@mkdir -p $(RELEASE_DIR)
	@echo "[prep] Created: $(RELEASE_DIR)"

# ------------------------------------------------------------
# npm production build
# ------------------------------------------------------------
npm-build:
	@echo "[npm] Running build ($(PLATFORM), $(ENV))..."
	PLATFORM=$(PLATFORM) NODE_ENV=$(ENV) npm run build:prod:$(PLATFORM)
	@echo "[npm] Build OK"

# ------------------------------------------------------------
# Create distribution.xpi
# ------------------------------------------------------------
xpi:
	@if [ ! -d "$(BUILD_DIR)" ]; then \
		echo "ERROR: $(BUILD_DIR) not found. Build failed?"; \
		exit 1; \
	fi
	@echo "[xpi] Creating $(XPI_OUT)"
	cd $(BUILD_DIR) && zip -r ../../../$(XPI_OUT) .
	@echo "[xpi] XPI created"

# ------------------------------------------------------------
# Create for-check.zip
# ------------------------------------------------------------
zip:
	@echo "[zip] Creating $(ZIP_OUT)"
	zip -r $(ZIP_OUT) $(META_FILES)
	@echo "[zip] ZIP created"

# ------------------------------------------------------------
# Clean
# ------------------------------------------------------------
clean:
	rm -rf $(RELEASE_ROOT)
	@echo "[clean] release/ removed"

# EOF
