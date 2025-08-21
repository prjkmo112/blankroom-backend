# Blankroom CoreAPI

실시간 화이트보드와 채팅을 제공하는 NestJS 기반의 백엔드 API 서버입니다.

## 📋 주요 기능

- **🔐 사용자 인증 시스템**: JWT 기반 회원가입/로그인
- **🏠 방(Room) 관리**: 비밀번호 보호 방 생성 및 관리
- **🎨 실시간 화이트보드**: Canvas 데이터 저장 및 실시간 동기화
- **💬 실시간 채팅**: WebSocket 기반 실시간 메시징
- **📚 API 문서**: Swagger를 통한 자동 API 문서화

## 🛠 기술 스택

- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Documentation**: Swagger
- **Security**: Helmet, CORS
- **Validation**: class-validator, class-transformer

## 📁 프로젝트 구조

```
src/
├── auth/           # 인증 관련 (로그인, 회원가입)
├── user/           # 사용자 관리
├── room/           # 방 생성 및 관리
├── board/          # 화이트보드 데이터 관리
├── chat/           # 실시간 채팅 (WebSocket)
├── common/         # 공통 모듈 (DTO, Guard, Decorator)
└── postgresdb/     # 데이터베이스 연결
```

## 🚀 설치 및 실행

### 환경 요구사항
- Node.js 16+
- PostgreSQL
- npm 또는 yarn

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# 데이터베이스
POSTGRES_URL="postgresql://username:password@localhost:5432/blankroom"

# JWT
JWT_SECRET="your-jwt-secret-key"

# CORS
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"

# Swagger (개발 환경에서만)
ENABLED_SWAGGER="true"
```

### 3. 데이터베이스 설정
```bash
# Prisma 마이그레이션 실행
npx prisma migrate dev

# Prisma 클라이언트 생성
npx prisma generate
```

### 4. 개발 서버 실행
```bash
# 개발 모드 (watch 모드)
npm run start:dev

# 일반 실행
npm run start

# 프로덕션 모드
npm run start:prod
```

## 🐳 Docker로 실행

### Dockerfile 구조

프로젝트는 멀티스테이지 빌드를 사용하는 Dockerfile을 포함합니다:

```dockerfile
# ---------- Builder ------------
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package*.json ./
COPY tsconfig*.json ./
RUN npm ci

COPY prisma/schema.prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

# ---------- Runner ------------
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package*.json ./
RUN npm ci

# Copy app from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# 환경 변수 설정
ENV POSTGRES_URL=postgresql://bruser:brpass@localhost:5433/blankroom?schema=public
ENV ENABLED_SWAGGER=true
ENV CORS_ORIGIN=http://localhost:5173,http://localhost
ENV JWT_SECRET=your-jwt-secret-key

# 헬스체크 설정
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

EXPOSE 3000

CMD ["dumb-init", "node", "dist/main"]
```

### Docker Compose 설정

PostgreSQL 데이터베이스 서비스를 위한 `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:15.13-alpine
    container_name: blankroom-postgres
    environment:
      POSTGRES_USER: bruser
      POSTGRES_PASSWORD: brpass
      POSTGRES_DB: blankroom
    ports:
      - "5433:5432"
    volumes:
      - ./docker-data/postgresql/scripts:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bruser -d blankroom"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
```

### 실행 방법

#### 1. PostgreSQL만 실행 (개발 환경)
```bash
# PostgreSQL 컨테이너만 시작
docker-compose up -d postgres

# 로컬에서 애플리케이션 실행
npm run start:dev
```

#### 2. Docker로 애플리케이션 빌드 및 실행
```bash
# Docker 이미지 빌드
docker build -t blankroom-coreapi .

# 네트워크 생성 (필요한 경우)
docker network create blankroom-network

# PostgreSQL 실행
docker-compose up -d postgres

# 애플리케이션 컨테이너 실행
docker run -d \
  --name blankroom-api \
  --network blankroom-network \
  -p 3000:3000 \
  -e POSTGRES_URL="postgresql://bruser:brpass@postgres:5432/blankroom" \
  blankroom-coreapi
```

#### 3. 전체 스택 실행 (추천)
```bash
# 모든 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 서비스 중지
docker-compose down
```

### 헬스체크 확인

컨테이너 상태 확인:
```bash
# 컨테이너 헬스 상태 확인
docker ps

# API 헬스체크 엔드포인트 직접 확인
curl http://localhost:3000/health
```

## 📊 데이터베이스 스키마

### 주요 테이블

- **users**: 사용자 정보 (ID, 비밀번호, 닉네임)
- **rooms**: 방 정보 (ID, 이름, 설명, 비밀번호)
- **boards**: 화이트보드 데이터 (이미지 데이터)
- **chat_messages**: 채팅 메시지

### ER 관계
- Room 1:1 Board (방마다 하나의 화이트보드)
- Room 1:N ChatMessage (방에 여러 채팅 메시지)
- User 1:N ChatMessage (사용자가 여러 메시지 작성)

## 🔌 주요 API 엔드포인트

### 인증 (`/auth`)
- `POST /auth/register` - 회원가입
- `POST /auth/login` - 로그인
- `POST /auth/logout` - 로그아웃

### 방 관리 (`/room`)
- `GET /room/list` - 방 목록 조회
- `POST /room/create` - 방 생성
- `GET /room/:id` - 방 정보 조회

### 화이트보드 (`/board`)
- `GET /board/:roomId` - 화이트보드 데이터 조회
- `POST /board/upload/:roomId` - 화이트보드 데이터 업로드

### 채팅 (`/chat`)
- WebSocket 연결: `/chat`
- 실시간 메시지 송수신

## 🧪 테스트

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov

# 테스트 watch 모드
npm run test:watch
```

## 🔧 개발 도구

```bash
# 코드 포맷팅
npm run format

# 린팅
npm run lint

# 빌드
npm run build
```

## 📖 API 문서

개발 환경에서 `ENABLED_SWAGGER=true`로 설정하면 다음 주소에서 Swagger 문서를 확인할 수 있습니다:

```
http://localhost:3000/api-docs
```
