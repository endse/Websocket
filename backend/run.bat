@echo off
echo ==============================
echo  Starting ChatWave Backend
echo ==============================
cd /d "%~dp0"
mvnw.cmd spring-boot:run 2>nul || mvn spring-boot:run
pause
