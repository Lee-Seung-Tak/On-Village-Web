# On-Village-Web

## Stack

* **Framework**: React
* **Build Tool**: Vite
* **css** : Tailwind
---

## Quick Start

### 1. 프로젝트 생성

```bash
npm create vite@latest
```

* Framework: React
* Variant: TypeScript 선택

### 2. 의존성 설치

```bash
cd ProjectName
yarn
```

### 3. 기본 라우팅 라이브러리 설치

```bash
yarn add react-router-dom
```

### 4. Tailwind CSS 설치
```bash
npm install tailwindcss @tailwindcss/vite
```

### 5. Configure the Vite plugin
#### [ vite.config.ts ]
```
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});

```
### 6.Tailwind CSS 초기화
```bash
npx tailwindcss init -p

```
### 7. Import Tailwind CSS
```bash
@import "tailwindcss";
```