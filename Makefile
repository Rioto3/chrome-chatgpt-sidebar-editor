# ============================================================
#  Makefile for Firefox Add-on (Self-Deploy Build System)
#
#  make build
#      1. Run production build (npm run build:prod)
#      2. Package dist/prod → dist/<timestamp>.xpi
#      3. Package src + metadata files → dist/<timestamp>.zip
#
#  Timestamp format: MMDDHHMMSS (例: 1209183059)
#  dist/ ディレクトリが出力先
# ============================================================

# タイムスタンプ
TS := $(shell date +%m%d%H%M%S)

# dist ディレクトリ
DIST_DIR := dist
PROD_DIR := dist/prod

# xpi 出力先
XPI_FILE := $(DIST_DIR)/$(TS).xpi

# zip 出力先
SRC_ZIP := $(DIST_DIR)/$(TS).zip

# メタ情報パッケージに含めるファイル
META_FILES := src package.json package-lock.json README.md Makefile


# ------------------------------------------------------------
#  build: すべてのビルドを実行
# ------------------------------------------------------------
build: prep npm-build xpi zip
	@echo "----------------------------------------------"
	@echo " Build completed:"
	@echo "   XPI: $(XPI_FILE)"
	@echo "   ZIP: $(SRC_ZIP)"
	@echo "----------------------------------------------"


# ------------------------------------------------------------
# dist フォルダ準備
# ------------------------------------------------------------
prep:
	@mkdir -p $(DIST_DIR)
	@echo "[prep] dist/ folder prepared"


# ------------------------------------------------------------
# npm build 実行
# ------------------------------------------------------------
npm-build:
	@echo "[npm] Running npm run build:prod ..."
	npm run build:prod
	@echo "[npm] Build completed"


# ------------------------------------------------------------
# dist/prod → xpi パッケージ生成
# ------------------------------------------------------------
xpi:
	@if [ ! -d "$(PROD_DIR)" ]; then \
		echo "ERROR: $(PROD_DIR) not found. Check build output."; \
		exit 1; \
	fi
	@echo "[xpi] Packaging $(PROD_DIR) → $(XPI_FILE)"
	cd $(PROD_DIR) && zip -r ../$(TS).xpi .
	@echo "[xpi] XPI created"


# ------------------------------------------------------------
# src + metadata → zip パッケージ生成
# ------------------------------------------------------------
zip:
	@echo "[zip] Packaging metadata → $(SRC_ZIP)"
	zip -r $(SRC_ZIP) $(META_FILES)
	@echo "[zip] ZIP created"


# ------------------------------------------------------------
# clean: dist を削除
# ------------------------------------------------------------
clean:
	rm -rf $(DIST_DIR)
	@echo "[clean] dist/ removed"


# EOF
