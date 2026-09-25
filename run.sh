#!/usr/bin/env bash
set -e

# =============================================================
# Script điều khiển dự án nhanh cho macOS và Linux (MySQL + Tomcat)
# =============================================================

# ANSI Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

COMMAND=${1:-reload}

case "$COMMAND" in
  reload|r)
    echo -e "${CYAN}🔄 [1/2] Đang biên dịch mã nguồn và nạp lại Webapp vào Tomcat...${NC}"
    docker compose up -d --build webapp
    echo -e "${GREEN}✅ [2/2] Webapp đã sẵn sàng!${NC}"
    echo ""
    echo -e "${BOLD}🌐 Địa chỉ ứng dụng :${NC} ${BLUE}http://localhost:8080/${NC}"
    echo -e "${BOLD}🩺 Kiểm tra kết nối :${NC} ${BLUE}http://localhost:8080/status${NC}"
    echo ""
    echo -e "${YELLOW}📋 Nhật ký hoạt động (Logs gần nhất):${NC}"
    docker compose logs --tail=15 webapp
    echo ""
    echo -e "${CYAN}💡 Gợi ý: Gõ './run.sh logs' để xem log liên tục theo thời gian thực.${NC}"
    ;;

  start|up)
    echo -e "${BLUE}=============================================================${NC}"
    echo -e "${BOLD}🚀 KHỞI ĐỘNG HỆ THỐNG: MYSQL 8.0 & APACHE TOMCAT 10.1${NC}"
    echo -e "${BLUE}=============================================================${NC}"
    docker compose up -d --build
    echo ""
    echo -e "${GREEN}✅ Khởi động thành công! Đang tải log hệ thống...${NC}"
    echo ""
    sleep 2
    docker compose logs --tail=25 webapp
    echo ""
    echo -e "${BOLD}🌐 Webapp Endpoint :${NC} ${CYAN}http://localhost:8080/${NC}"
    echo -e "${BOLD}🗄️ MySQL Port      :${NC} ${CYAN}localhost:3306 (User: root / Pass: 12345678)${NC}"
    echo -e "${BOLD}🩺 Health Status   :${NC} ${CYAN}http://localhost:8080/status${NC}"
    ;;

  stop|down)
    echo -e "${YELLOW}🛑 Đang dừng toàn bộ container...${NC}"
    docker compose down
    echo -e "${GREEN}✅ Đã dừng hệ thống an toàn.${NC}"
    ;;

  logs|log|l)
    echo -e "${CYAN}📋 Đang theo dõi log thời gian thực của Webapp (Ctrl+C để thoát)...${NC}"
    docker compose logs -f webapp
    ;;

  db)
    echo -e "${CYAN}🗄️ Đang khởi động riêng container MySQL 8.0...${NC}"
    docker compose up -d mysql
    echo -e "${GREEN}✅ MySQL đang lắng nghe tại localhost:3306.${NC}"
    ;;

  status|ps)
    docker compose ps
    ;;

  help|h|*)
    echo -e "${BLUE}=============================================================${NC}"
    echo -e "${BOLD}  Location Weather App - Hướng dẫn sử dụng run.sh${NC}"
    echo -e "${BLUE}=============================================================${NC}"
    echo -e "  ${GREEN}./run.sh${NC}          (hoặc ./run.sh reload) : Rebuild và cập nhật nhanh Webapp sau khi sửa code"
    echo -e "  ${GREEN}./run.sh start${NC}    (hoặc ./run.sh up)     : Khởi động toàn bộ hệ thống từ đầu"
    echo -e "  ${GREEN}./run.sh stop${NC}     (hoặc ./run.sh down)   : Dừng toàn bộ container"
    echo -e "  ${GREEN}./run.sh logs${NC}                            : Theo dõi log trực tiếp (Real-time)"
    echo -e "  ${GREEN}./run.sh status${NC}                          : Xem trạng thái các container"
    echo -e "  ${GREEN}./run.sh db${NC}                              : Bật riêng MySQL 8.0"
    echo -e "${BLUE}=============================================================${NC}"
    ;;
esac
