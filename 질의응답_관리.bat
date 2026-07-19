@echo off
cd /d "%~dp0"
echo 질의응답 관리 도구를 시작합니다...
python "질의응답_관리.py"
if errorlevel 9009 (
  echo.
  echo [오류] python 을 찾을 수 없습니다. Python 설치 여부를 확인하세요.
  pause
)
