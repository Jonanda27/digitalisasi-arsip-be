# Gunakan versi slim agar ringan tapi tetap support install library OS
FROM node:20-slim

# 1. Install Tesseract OCR & Bahasa Indonesia/Inggris (Wajib untuk fitur OCR)
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    poppler-utils \
    tesseract-ocr \
    tesseract-ocr-ind \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

# 2. Set folder kerja
WORKDIR /app

# 3. Copy package.json dan install dependency
COPY package*.json ./
RUN npm install

# 4. Copy seluruh codingan
COPY . .

# 5. Buat folder uploads agar tidak error saat user upload file
RUN mkdir -p uploads

# 6. Buka port 5000
EXPOSE 5000

# 7. Jalankan aplikasi (Sesuaikan jika file utamanya server.js)
CMD ["node", "server.js"]
