#!/bin/bash

echo "Checking prerequisites for Epic Battle application..."
echo ""

echo "Checking Java..."
if command -v java &> /dev/null; then
    echo "[OK] Java is installed."
else
    echo "[ERROR] Java is not installed or not in PATH. Please install Java 17 or higher."
fi

echo ""
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    echo "[OK] Node.js is installed."
else
    echo "[ERROR] Node.js is not installed or not in PATH. Please install Node.js."
fi

echo ""
echo "Checking npm..."
if command -v npm &> /dev/null; then
    echo "[OK] npm is installed."
else
    echo "[ERROR] npm is not installed or not in PATH. Please install npm."
fi

echo ""
echo "Checking MySQL..."
if command -v mysql &> /dev/null; then
    echo "[OK] MySQL is installed."
else
    echo "[ERROR] MySQL is not installed or not in PATH. Please install MySQL."
fi

echo ""
echo "Prerequisite check completed."
echo ""
echo "Press Enter to exit..."
read